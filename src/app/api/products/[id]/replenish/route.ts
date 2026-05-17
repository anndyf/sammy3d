import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MaterialService } from '@/services/MaterialService';
import { OrderService } from '@/services/OrderService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID is missing' }, { status: 400 });
    }

    const { amount, materialId, notes } = await request.json();
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Quantidade de reabastecimento inválida' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { material: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const matId = materialId || product.materialId;

    const result = await prisma.$transaction(async (tx) => {
      const prevQty = product.stockQuantity;
      const newQty = prevQty + parsedAmount;

      // 1. Atualizar o estoque do produto
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { stockQuantity: newQty }
      });

      // 2. Dar baixa no material selecionado
      if (matId) {
        await MaterialService.deduct(tx, matId, product.weightGrams, parsedAmount);
      }

      // 3. Log stock change
      await OrderService.logStockChange(
        tx,
        id,
        "REPLENISH",
        prevQty,
        newQty,
        parsedAmount,
        matId,
        notes || "Reabastecimento manual de estoque"
      );

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("REPLENISH ERROR:", error);
    return NextResponse.json({ error: 'Erro ao reabastecer produto', details: error.message }, { status: 500 });
  }
}
