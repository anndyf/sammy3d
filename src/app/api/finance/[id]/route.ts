import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { type, category, amount, description, date } = body;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        category,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar movimentação' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return NextResponse.json({ error: 'Erro ao excluir movimentação' }, { status: 500 });
  }
}
