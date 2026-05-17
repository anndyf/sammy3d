import { prisma } from '@/lib/prisma';
import { Transaction } from '@prisma/client';

export class FinanceService {
  /**
   * Lista transações com paginação e resumo.
   */
  static async list(page: number = 1, limit: number = 50) {
    const [transactions, allTransactions, orders] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.findMany({
        select: { id: true, type: true, amount: true, description: true }
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Filtrar pedidos pagos ou finalizados
    const paidOrders = orders.filter(o => 
      o.paymentStatus === 'PAID' || ['FINISHED', 'READY', 'SHIPPED'].includes(o.status)
    );

    // Mapeia pedidos pagos como transações virtuais de receita apenas se já não houver transação correspondente
    const virtualTransactions: any[] = [];
    for (const order of paidOrders) {
      const alreadyHasTx = allTransactions.some(t => t.description && t.description.includes(order.id));
      if (!alreadyHasTx) {
        let netAmount = order.totalAmount;
        // Se a venda veio da Shopee ou ML, deduzir a respectiva taxa de marketplace
        if (order.channel === 'SHOPEE' || order.channel === 'Shoppe') {
          netAmount = order.totalAmount * 0.73;
        } else if (order.channel === 'ML' || order.channel === 'Mercado Livre') {
          const fixedFee = order.totalAmount < 79 ? 6.00 : 0;
          netAmount = order.totalAmount * 0.88 - fixedFee;
        }
        netAmount = Math.max(0, netAmount);

        virtualTransactions.push({
          id: `virtual-order-${order.id}`,
          date: order.createdAt,
          description: `[VENDA] Cliente: ${order.customerName} (via ${order.channel || 'DIRETA'})`,
          category: 'Venda',
          type: 'INCOME',
          amount: Number(netAmount.toFixed(2))
        });
      }
    }

    // Combina e ordena por data decrescente
    const combinedTransactions = [...transactions, ...virtualTransactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const totalIncome = combinedTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
    const totalExpense = combinedTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);

    // Paginação em memória
    const skip = (Math.max(1, page) - 1) * limit;
    const paginatedTransactions = combinedTransactions.slice(skip, skip + limit);
    const total = combinedTransactions.length;

    return {
      transactions: paginatedTransactions,
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
