import { prisma } from '@/lib/prisma';
import { ConfigService } from './ConfigService';

export class MaterialService {
  /**
   * Lista materiais com paginação.
   */
  static async list(page: number = 1, limit: number = 100) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.material.findMany({
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.material.count()
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Cria um novo material e opcionalmente registra despesa.
   */
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

  /**
   * Atualiza um material existente.
   */
  static async update(id: string, body: any) {
    const { name, type, color, costPerUnit, totalAmount, remainingAmount, unitType } = body;

    return await prisma.material.update({
      where: { id },
      data: {
        name,
        type,
        color,
        costPerUnit:     Number(costPerUnit),
        totalAmount:     Number(totalAmount),
        remainingAmount: Number(remainingAmount),
        unitType,
      },
    });
  }

  /**
   * Realiza a baixa de material de forma inteligente, considerando a taxa de falha.
   */
  static async deduct(tx: any, materialId: string, weightGrams: number, itemsCount: number) {
    const material = await tx.material.findUnique({ where: { id: materialId } });
    if (!material) return;

    const configs = await ConfigService.list();
    const failPct = parseFloat(configs.production_fail_rate || "5") / 100;

    let deduction = Number(weightGrams) * Number(itemsCount) * (1 + failPct);
    
    // Conversão de unidade se necessário
    if (material.unitType === 'kg' || material.unitType === 'l') {
      deduction = deduction / 1000;
    }

    return await tx.material.update({
      where: { id: materialId },
      data: { remainingAmount: { decrement: deduction } },
    });
  }

  /**
   * Exclui um material.
   */
  static async delete(id: string) {
    // Verifica se existem produtos usando este material
    const productsCount = await prisma.product.count({ where: { materialId: id } });
    if (productsCount > 0) {
      throw new Error('Não é possível excluir um material que possui produtos vinculados.');
    }
    return await prisma.material.delete({ where: { id } });
  }
}
