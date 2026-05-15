import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ConfigService } from '@/services/ConfigService';
import { MaterialService } from '@/services/MaterialService';
import { ProductService } from '@/services/ProductService';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is missing' }, { status: 400 });
    }

    const body = await request.json();
    const { action, amount } = body; // action: "add" | "remove", amount: number

    const product = await prisma.product.findUnique({
      where: { id },
      include: { material: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    if (action === "add") {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Atualizar o estoque do produto
        const updatedProduct = await tx.product.update({
          where: { id },
          data: { stockQuantity: { increment: amount } }
        });

        // 2. Dar baixa no material automaticamente
        await MaterialService.deduct(tx, product.materialId, product.weightGrams, amount);

        return updatedProduct;
      });

      return NextResponse.json(result);
    } 
    
    if (action === "remove") {
      // Remover estoque (ex: venda externa, descarte). Não repomos material impresso.
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          stockQuantity: {
            decrement: amount
          }
        }
      });
      return NextResponse.json(updatedProduct);
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar estoque' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID is missing' }, { status: 400 });

    const body = await request.json();
    const product = await ProductService.update(id, body);

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("PRODUCT PUT ERRO:", error);
    return NextResponse.json({ error: 'Erro ao editar produto', details: error.message }, { status: 500 });
  }
}
