import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ConfigService } from '@/services/ConfigService';
import { MaterialService } from '@/services/MaterialService';

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

    if (!id) {
      return NextResponse.json({ error: 'ID is missing' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      name, description, productionTime, weightGrams, additionalCost, 
      materialId, sellingPrice, stockQuantity, category, subcategory, sku, shopeeUrl, imageUrl 
    } = body;

    // 1. Busca produto e material para auditoria de estoque
    const product = await prisma.product.findUnique({ where: { id } });
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    
    if (!product || !material) return NextResponse.json({ error: 'Produto ou Material não encontrado' }, { status: 400 });

    // 2. Calcula a Baixa Automática de Material se o estoque aumentou
    const oldQty = product.stockQuantity || 0;
    const newQty = Number(stockQuantity || 0);

    const configs = await ConfigService.list();
    const energyH = parseFloat(configs.production_energy_cost || "0.50");
    const machineH = parseFloat(configs.production_machine_wear || "1.20");
    const failPct = parseFloat(configs.production_fail_rate || "5") / 100;

    const result = await prisma.$transaction(async (tx) => {
      if (newQty > oldQty) {
        const diff = newQty - oldQty;
        await MaterialService.deduct(tx, materialId, Number(weightGrams), diff);
      }

      // 3. Recalcula o Custo Base dinâmico
      let costPerGram = material.costPerUnit / material.totalAmount;
      if (material.unitType === 'kg' || material.unitType === 'l') {
        costPerGram = costPerGram / 1000;
      }

      const materialCost = (Number(weightGrams) * costPerGram) * (1 + failPct);
      const timeH = Number(productionTime) / 60;
      const productionCost = timeH * (energyH + machineH);
      
      const calculatedCost = materialCost + productionCost + Number(additionalCost || 0);

      // 4. Atualiza o banco
      return await tx.product.update({
        where: { id },
        data: {
          name,
          description: description || null,
          productionTime: Number(productionTime),
          weightGrams: Number(weightGrams),
          additionalCost: Number(additionalCost || 0),
          materialId,
          calculatedCost: Number(calculatedCost),
          sellingPrice: Number(sellingPrice),
          stockQuantity: newQty,
          category: category || "Chaveiros",
          subcategory: subcategory || null,
          sku: sku || undefined,
          shopeeUrl: shopeeUrl || null,
          ...(imageUrl !== undefined && { imageUrl: imageUrl || null })
        }
      });
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("PRODUCT PUT ERRO:", error);
    return NextResponse.json({ error: 'Erro ao editar produto', details: error.message }, { status: 500 });
  }
}
