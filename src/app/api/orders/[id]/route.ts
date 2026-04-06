import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const oldOrder = await prisma.order.findUnique({ where: { id } });
    if (!oldOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      }
    });

    // SINCRONIZAÇÃO FINANCEIRA INTELIGENTE
    if (paymentStatus === 'PAID') {
       // Só cria se NÃO existir (evita duplicata no toggle)
       const existing = await prisma.transaction.findFirst({
         where: { description: { contains: `[ID: ${id}]` } }
       });

       if (!existing) {
          await prisma.transaction.create({
            data: {
              type: 'INCOME',
              category: 'VENDA_DIRETA',
              amount: updatedOrder.totalAmount,
              description: `[AUTOMAÇÃO] Liquidação: ${updatedOrder.customerName} [ID: ${id}]`,
              date: new Date()
            }
          });
       }
    } else if (paymentStatus === 'UNPAID') {
       // Se mudar para UNPAID, removemos os lançamentos desse pedido
       await prisma.transaction.deleteMany({
         where: { description: { contains: `[ID: ${id}]` } }
       });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Deletar itens do pedido primeiro por causa da chave estrangeira
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar pedido' }, { status: 500 });
  }
}
