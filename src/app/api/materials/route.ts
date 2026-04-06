import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Listagem de todos os materiais (Insumos) no banco
export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar materiais' }, { status: 500 });
  }
}

// POST: Cadastro de um novo material (Filamento ou Resina) com opcional de Despesa Financeira
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, color, costPerUnit, totalAmount, unitType, recordExpense, amountPaid } = body;

    const newMaterial = await prisma.material.create({
      data: {
        name,
        type,
        color,
        costPerUnit: Number(costPerUnit),
        totalAmount: Number(totalAmount),
        remainingAmount: Number(totalAmount),
        unitType,
      },
    });

    // Se o usuário solicitou registrar despesa no Livro Caixa
    if (recordExpense) {
      await prisma.transaction.create({
        data: {
          description: `Compra de Insumo: ${name} (${color})`,
          amount: Number(amountPaid || costPerUnit), // Valor real pago
          type: 'EXPENSE',
          category: 'PRODUCAO', // Categoria fixa para insumos
          date: new Date(),
        }
      });
    }

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error("MATERIAL POST FAIL:", error);
    return NextResponse.json({ error: 'Erro ao cadastrar material' }, { status: 500 });
  }
}
