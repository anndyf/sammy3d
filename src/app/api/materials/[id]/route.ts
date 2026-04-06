import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID is missing' }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, color, costPerUnit, totalAmount, remainingAmount, unitType } = body;

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        name,
        type,
        color,
        costPerUnit: Number(costPerUnit),
        totalAmount: Number(totalAmount),
        remainingAmount: Number(remainingAmount),
        unitType,
      },
    });

    return NextResponse.json(updatedMaterial, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao editar insumo' }, { status: 500 });
  }
}
