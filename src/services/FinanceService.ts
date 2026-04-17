import { prisma } from '@/lib/prisma';
import { Transaction } from '@prisma/client';

export class FinanceService {
  /**
   * Lista transações com paginação e resumo.
   */
  static async list(page: number = 1, limit: number = 50) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [transactions, total, allTransactions] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: limit,
        skip,
      }),
      prisma.transaction.count(),
      // Pegamos todos os montantes para o resumo (economiza queries se o volume for moderado)
      // Em sistemas gigantes, usaríamos agregações (sum) no banco.
      prisma.transaction.findMany({
        select: { type: true, amount: true }
      })
    ]);

    const totalIncome = allTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
    const totalExpense = allTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);

    return {
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Registro inteligente de transação (com baixa de estoque/material).
   */
  static async create(body: any) {
    const { type, category, amount, description, productId, materialId, addStockAmount } = body;

    return await prisma.$transaction(async (tx) => {
      // 1. Caso: Reposição de Insumo
      if (materialId && type === 'EXPENSE') {
        const material = await tx.material.findUnique({ where: { id: materialId } });
        if (!material) throw new Error('Material não encontrado');

        await tx.material.update({
          where: { id: materialId },
          data: { remainingAmount: { increment: Number(addStockAmount) || 0 } }
        });

        return await tx.transaction.create({
          data: {
            type,
            category: "Reposição de Insumo",
            amount: Number(amount),
            description: `📦 COMPRA MATÉRIA PRIMA: [${material.name}] +${addStockAmount}${material.unitType}`,
            date: new Date()
          },
        });
      }

      // 2. Caso: Venda direta vinculada ao catálogo
      if (productId && type === 'INCOME') {
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: { material: true }
        });

        if (product) {
          if (product.stockQuantity > 0) {
            await tx.product.update({
              where: { id: productId },
              data: { stockQuantity: { decrement: 1 } }
            });
          } else if (product.material) {
            let deduction = product.weightGrams;
            if (product.material.unitType === 'kg' || product.material.unitType === 'l') deduction /= 1000;
            
            await tx.material.update({
              where: { id: product.materialId },
              data: { remainingAmount: { decrement: deduction } }
            });
          }

          return await tx.transaction.create({
            data: {
              type,
              category: "Venda de Peça Automatizada",
              amount: Number(amount),
              description: `📦 Venda ERP: [${product.id}] ${product.name}`,
              date: new Date()
            },
          });
        }
      }

      // 3. Caso: Fluxo Normal
      return await tx.transaction.create({
        data: {
          type,
          category: category || "Outros",
          amount: Number(amount),
          description: description || null,
          date: new Date()
        },
      });
    });
  }
}
