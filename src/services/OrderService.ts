import { prisma } from '@/lib/prisma';
import { calcNetMarketplace } from '@/lib/api';
import { ConfigService } from './ConfigService';

export class OrderService {
  /**
   * Lista pedidos com paginação.
   */
  static async list(page: number = 1, limit: number = 50) {
    const skip = (Math.max(1, page) - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.order.count()
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Cria um pedido com transação atômica (estoque + financeiro).
   */
  static async create(body: any) {
    const { 
      customerName, customerContact, status, type, totalAmount, 
      discountAmount, deadline, notes, weightGrams, materialId, 
      paymentStatus, items, saleChannel 
    } = body;

    const deadlineDate = deadline ? new Date(deadline) : null;
    let finalStatus = status || 'PENDING';

    // Fase de leitura: Checar estoque se for catálogo
    if (type === 'CATALOG' && Array.isArray(items)) {
      let allInStock = true;
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stockQuantity < Number(item.quantity)) {
          allInStock = false;
          break;
        }
      }
      finalStatus = allInStock ? 'PICKING' : 'PENDING';
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Criar o Pedido
      const order = await tx.order.create({
        data: {
          customerName: String(customerName),
          customerContact: customerContact ? String(customerContact) : null,
          status: finalStatus,
          type: String(type || 'CATALOG'),
          totalAmount: Number(totalAmount) || 0,
          discountAmount: Number(discountAmount) || 0,
          deadline: deadlineDate,
          notes: notes ? String(notes) : null,
          weightGrams: weightGrams ? Number(weightGrams) : null,
          materialId: materialId ? String(materialId) : null,
          paymentStatus: String(paymentStatus || 'UNPAID'),
        }
      });

      // 2. Itens + Baixa de Estoque
      if (Array.isArray(items)) {
        for (const item of items) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId || null,
              customName: item.customName || null,
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0
            }
          });

          if (type === 'CATALOG' && item.productId) {
            await tx.product.update({
              where: { id: String(item.productId) },
              data: { stockQuantity: { decrement: Number(item.quantity) || 1 } }
            });
          }
        }
      }

      // 3. Financeiro
      if (paymentStatus === 'PAID') {
        const configs = await ConfigService.list();
        const netAmount = calcNetMarketplace(Number(totalAmount), saleChannel || '', configs);
        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'VENDA_DIRETA',
            amount: Number(netAmount.toFixed(2)),
            description: `[AUTOMAÇÃO] Venda (${saleChannel || 'DIRETA'}): ${customerName} [ID: ${order.id}]`,
            date: new Date()
          }
        });
      }

      return order;
    });
  }

  /**
   * Atualiza status/pagamento do pedido.
   */
  static async update(id: string, body: any) {
    const { status, paymentStatus, saleChannel } = body;
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    if (!oldOrder) throw new Error('Pedido não encontrado');

    return await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
        }
      });

      // Lógica de transição financeira
      if (paymentStatus === 'PAID' && oldOrder.paymentStatus !== 'PAID') {
        const configs = await ConfigService.list();
        const netAmount = calcNetMarketplace(updatedOrder.totalAmount, saleChannel || '', configs);
        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'VENDA_DIRETA',
            amount: Number(netAmount.toFixed(2)),
            description: `[AUTOMAÇÃO] Liquidação: ${updatedOrder.customerName} [ID: ${id}]`,
            date: new Date()
          }
        });
      } else if (paymentStatus === 'UNPAID' && oldOrder.paymentStatus === 'PAID') {
        await tx.transaction.deleteMany({
          where: { description: { contains: `[ID: ${id}]` } }
        });
      }

      return updatedOrder;
    });
  }

  static async delete(id: string) {
    return await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);
  }
}
