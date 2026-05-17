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
      paymentStatus, items, saleChannel, printerId, netRevenue
    } = body;

    const deadlineDate = deadline ? new Date(deadline) : null;
    let finalStatus = status || 'PENDING';

    // Fase de leitura e reserva: Checar estoque (Próprio ou Composição)
    if (Array.isArray(items) && items.length > 0 && items.some(item => item.productId)) {
      let allReady = true;
      for (const item of items) {
        if (!item.productId) continue;
        const product = await prisma.product.findUnique({ 
          where: { id: item.productId },
          include: { components: true }
        });
        
        if (!product) { allReady = false; break; }

        // Se tem estoque do kit pronto
        if (product.stockQuantity >= Number(item.quantity)) continue;

        // Se não tem estoque do kit, checa componentes
        if (product.components && product.components.length > 0) {
          for (const comp of product.components) {
            const part = await prisma.product.findUnique({ where: { id: comp.componentId } });
            if (!part || part.stockQuantity < (comp.quantity * Number(item.quantity))) {
              allReady = false;
              break;
            }
          }
        } else {
          // Não tem kit nem componentes suficientes
          allReady = false;
        }
        if (!allReady) break;
      }
      finalStatus = allReady ? 'PICKING' : 'PENDING';
    } else if (type === 'CUSTOM') {
      finalStatus = status || 'PENDING';
    }

    let dbChannel = 'Venda Direta';
    if (saleChannel === 'SHOPEE') dbChannel = 'Shoppe';
    if (saleChannel === 'ML') dbChannel = 'Mercado Livre';

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
          printerId: printerId ? String(printerId) : null,
          channel: dbChannel,
          netRevenue: netRevenue !== undefined && netRevenue !== null ? Number(netRevenue) : null
        }
      });

      // 2. Itens + Baixa de Estoque Inteligente (Kit vs Peças)
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

          if (item.productId) {
            const product = await tx.product.findUnique({ 
              where: { id: item.productId },
              include: { components: true }
            });

            if (product) {
              // Se tiver estoque do KIT pronto, tira do KIT
              if (product.stockQuantity >= Number(item.quantity)) {
                await tx.product.update({
                  where: { id: product.id },
                  data: { stockQuantity: { decrement: Number(item.quantity) } }
                });
              } else if (product.components && product.components.length > 0) {
                // Se não tem KIT mas tem COMPONENTES, tira dos COMPONENTES
                for (const comp of product.components) {
                  await tx.product.update({
                    where: { id: comp.componentId },
                    data: { stockQuantity: { decrement: comp.quantity * Number(item.quantity) } }
                  });
                }
              } else {
                // Se não tem nem KIT nem COMPONENTES (ficou negativo)
                await tx.product.update({
                  where: { id: product.id },
                  data: { stockQuantity: { decrement: Number(item.quantity) } }
                });
              }
            }
          }
        }
      }

      // 3. Financeiro
      const isPaidNow = paymentStatus === 'PAID' || (finalStatus === 'FINISHED' || finalStatus === 'READY' || finalStatus === 'SHIPPED');
      if (isPaidNow) {
        const configs = await ConfigService.list();
        let netAmount = 0;
        if (saleChannel === 'SHOPEE' || saleChannel === 'ML') {
          netAmount = netRevenue !== undefined && netRevenue !== null
            ? Number(netRevenue)
            : calcNetMarketplace(Number(totalAmount), saleChannel || '', configs);
        } else {
          // Venda Direta: descontar os custos de impressao
          let productionCost = 0;
          if (Array.isArray(items)) {
            for (const item of items) {
              if (item.productId) {
                const prod = await tx.product.findUnique({ where: { id: item.productId } });
                if (prod) {
                  productionCost += (Number(item.quantity) || 1) * (prod.calculatedCost || 0);
                }
              }
            }
          }
          netAmount = Number(totalAmount) - productionCost;
        }

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
    const { status, paymentStatus, saleChannel, channel, totalAmount, netRevenue, printerId, startDate, productionDays, deadline } = body;
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    if (!oldOrder) throw new Error('Pedido não encontrado');

    return await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
          ...(channel && { channel }),
          ...(totalAmount !== undefined && { totalAmount: Number(totalAmount) }),
          ...(netRevenue !== undefined && { netRevenue: netRevenue !== null ? Number(netRevenue) : null }),
          ...(printerId !== undefined && { printerId: printerId ? String(printerId) : null }),
          ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
          ...(productionDays !== undefined && { productionDays: productionDays !== null ? Number(productionDays) : null }),
          ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        }
      });

      // Lógica de transição financeira automática robusta
      const isPaidNow = updatedOrder.paymentStatus === 'PAID' || (updatedOrder.status === 'FINISHED' || updatedOrder.status === 'READY' || updatedOrder.status === 'SHIPPED');
      const wasPaidBefore = oldOrder.paymentStatus === 'PAID' || (oldOrder.status === 'FINISHED' || oldOrder.status === 'READY' || oldOrder.status === 'SHIPPED');

      if (isPaidNow) {
        const configs = await ConfigService.list();
        const activeChannel = updatedOrder.channel || saleChannel || '';
        let netAmount = 0;
        
        if (activeChannel === 'Shoppe' || activeChannel === 'Mercado Livre' || activeChannel === 'SHOPEE' || activeChannel === 'ML') {
          const apiChan = (activeChannel === 'Shoppe' || activeChannel === 'SHOPEE') ? 'SHOPEE' : 'ML';
          netAmount = updatedOrder.netRevenue !== null && updatedOrder.netRevenue !== undefined
            ? updatedOrder.netRevenue
            : calcNetMarketplace(updatedOrder.totalAmount, apiChan, configs);
        } else {
          // Venda Direta: descontar os custos de impressao
          let productionCost = 0;
          const dbItems = await tx.orderItem.findMany({
            where: { orderId: id },
            include: { product: true }
          });
          dbItems.forEach(item => {
            productionCost += (item.quantity) * (item.product?.calculatedCost || 0);
          });
          netAmount = updatedOrder.totalAmount - productionCost;
        }
        
        // Evitar duplicados: checar se transação já existe
        const existingTx = await tx.transaction.findFirst({
          where: { description: { contains: `[ID: ${id}]` } }
        });
        
        if (existingTx) {
          await tx.transaction.update({
            where: { id: existingTx.id },
            data: {
              amount: Number(netAmount.toFixed(2)),
              description: `[AUTOMAÇÃO] Venda (${activeChannel || 'DIRETA'}): ${updatedOrder.customerName} [ID: ${id}]`
            }
          });
        } else {
          await tx.transaction.create({
            data: {
              type: 'INCOME',
              category: 'VENDA_DIRETA',
              amount: Number(netAmount.toFixed(2)),
              description: `[AUTOMAÇÃO] Venda (${activeChannel || 'DIRETA'}): ${updatedOrder.customerName} [ID: ${id}]`,
              date: new Date()
            }
          });
        }
        
        // Sincronizar o status de pagamento como PAID se ainda não estiver
        if (updatedOrder.paymentStatus !== 'PAID') {
          await tx.order.update({
            where: { id },
            data: { paymentStatus: 'PAID' }
          });
        }
      } else if (!isPaidNow && wasPaidBefore) {
        // Se foi estornado ou mudado para não pago, remover receitas vinculadas a este ID
        await tx.transaction.deleteMany({
          where: { description: { contains: `[ID: ${id}]` } }
        });

        // Sincronizar o status de pagamento como PENDING se foi retirado do PAID
        if (updatedOrder.paymentStatus === 'PAID') {
          await tx.order.update({
            where: { id },
            data: { paymentStatus: 'PENDING' }
          });
        }
      }

      return updatedOrder;
    });
  }

  static async delete(id: string) {
    return await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { description: { contains: `[ID: ${id}]` } } }),
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);
  }
}
