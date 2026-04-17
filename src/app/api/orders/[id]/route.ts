import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, calcNetMarketplace } from '@/lib/api';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, saleChannel } = body;

    if (!id) return apiError('ID do pedido ausente.', 400);

    const oldOrder = await prisma.order.findUnique({ where: { id } });
    if (!oldOrder) return apiError('Pedido não encontrado.', 404);

    const result = await prisma.$transaction(async (tx) => {
      // Atualizar o pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          ...(status        && { status }),
          ...(paymentStatus && { paymentStatus }),
        },
      });

      // Sincronização Financeira Inteligente
      if (paymentStatus === 'PAID' && oldOrder.paymentStatus !== 'PAID') {
        // Só cria se o pedido mudou PARA pago (evita duplicata)
        const netAmount = calcNetMarketplace(updatedOrder.totalAmount, saleChannel || '');
        await tx.transaction.create({
          data: {
            type:        'INCOME',
            category:    'VENDA_DIRETA',
            amount:      Number(netAmount.toFixed(2)),
            description: `[AUTOMAÇÃO] Liquidação: ${updatedOrder.customerName} [ID: ${id}]`,
            date:        new Date(),
          },
        });
      } else if (paymentStatus === 'UNPAID' && oldOrder.paymentStatus === 'PAID') {
        // Reverteu para não pago: remove os lançamentos automáticos
        await tx.transaction.deleteMany({
          where: { description: { contains: `[ID: ${id}]` } },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PUT Order Error:', error);
    return apiError('Erro ao atualizar pedido.', 500, error.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Deletar itens e pedido de forma atômica
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Order Error:', error);
    return apiError('Erro ao deletar pedido.', 500, error.message);
  }
}
