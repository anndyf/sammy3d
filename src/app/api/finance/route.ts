import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Transaction } from '@prisma/client';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });
    
    // Calcula totais rapidamente para enviar pro Dashboard se precisar
    const totalIncome = transactions.filter((t: Transaction) => t.type === 'INCOME').reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
    const totalExpense = transactions.filter((t: Transaction) => t.type === 'EXPENSE').reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      transactions,
      summary: { totalIncome, totalExpense, balance }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, category, amount, description, productId, materialId, addStockAmount } = body;

    // Se é uma Reposição de Insumo:
    if (materialId && type === 'EXPENSE') {
      const material = await prisma.material.findUnique({ where: { id: materialId } });
      
      if (material) {
        await prisma.material.update({
          where: { id: materialId },
          data: { 
             remainingAmount: material.remainingAmount + (Number(addStockAmount) || 0)
          }
        });

        const newTransaction = await prisma.transaction.create({
          data: {
            type,
            category: "Reposição de Insumo",
            amount: Number(amount),
            description: `📦 COMPRA MATÉRIA PRIMA: [${material.name}] +${addStockAmount}${material.unitType}`,
          },
        });
        return NextResponse.json(newTransaction, { status: 201 });
      }
    }

    // Se é uma Venda vinculada a um Produto do Catálogo:
    if (productId && type === 'INCOME') {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { material: true }
      });

      if (product) {
        // Baixa Inteligente de Estoque
        if (product.stockQuantity > 0) {
          // Tirar da Pronta Entrega
          await prisma.product.update({
            where: { id: productId },
            data: { stockQuantity: product.stockQuantity - 1 }
          });
        } else if (product.material) {
          // Fabricado Sob Demanda: Desconta do rolo de filamento/resina real
          const novoEstoqueLaranja = product.material.remainingAmount - product.weightGrams;
          await prisma.material.update({
            where: { id: product.material.id },
            data: { remainingAmount: novoEstoqueLaranja >= 0 ? novoEstoqueLaranja : 0 }
          });
        }
        
        // Vamos embutir o ID no começo da descrição do Livro Caixa sorrateiramente
        // para facilitar o monitoramento futuro da "Peça mais vendida" sem precisar de migração no BD.
        const descOficial = `📦 Venda ERP: [${product.id}] ${product.name}`;
        
        const newTransaction = await prisma.transaction.create({
          data: {
            type,
            category: "Venda de Peça Automatizada",
            amount: Number(amount),
            description: descOficial,
          },
        });
        return NextResponse.json(newTransaction, { status: 201 });
      }
    }

    // Fluxo Normal (Conta de luz, Manutenção, Outros)
    const newTransaction = await prisma.transaction.create({
      data: {
        type, 
        category,
        amount: Number(amount),
        description: description || null,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar movimentação' }, { status: 500 });
  }
}
