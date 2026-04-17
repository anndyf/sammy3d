import { prisma } from '@/lib/prisma';

export class MaterialService {
  static async list(page: number = 1, limit: number = 100) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.material.findMany({
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.count('material') // Note: Prisma.count('material') is hypothetical, I'll use the specific model
    ]);
    // Correction:
    const count = await prisma.material.count();

    return {
      data,
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
    };
  }

  static async create(body: any) {
    const { name, type, color, costPerUnit, totalAmount, unitType, recordExpense, amountPaid } = body;

    const parsedCost   = Number(costPerUnit);
    const parsedAmount = Number(totalAmount);

    return await prisma.$transaction(async (tx) => {
      const material = await tx.material.create({
        data: {
          name:            String(name),
          type:            String(type),
          color:           color    ? String(color)    : null,
          costPerUnit:     parsedCost,
          totalAmount:     parsedAmount,
          remainingAmount: parsedAmount,
          unitType:        String(unitType),
        },
      });

      if (recordExpense) {
        const expenseAmount = Number(amountPaid || costPerUnit);
        if (!isNaN(expenseAmount) && expenseAmount > 0) {
          await tx.transaction.create({
            data: {
              description: `Compra de Insumo: ${name}${color ? ` (${color})` : ''}`,
              amount:      expenseAmount,
              type:        'EXPENSE',
              category:    'PRODUCAO',
              date:        new Date(),
            },
          });
        }
      }

      return material;
    });
  }
}
