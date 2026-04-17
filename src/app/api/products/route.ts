import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, requireFields } from '@/lib/api';

// GET: Listagem do catálogo com paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',   10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip  = (Math.max(1, page) - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: { material: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("GET Products Error:", error);
    return apiError('Erro ao buscar catálogo.', 500, error.message);
  }
}

// POST: Cadastro de novo produto/ativo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, description, productionTime, weightGrams, additionalCost,
      materialId, sellingPrice, stockQuantity, category, subcategory,
      shopeeUrl, imageUrl,
    } = body;

    const validationError = requireFields({ name, materialId, sellingPrice, weightGrams });
    if (validationError) return validationError;

    const parsedWeight = Number(weightGrams);
    const parsedPrice  = Number(sellingPrice);

    if (isNaN(parsedWeight) || parsedWeight <= 0) return apiError("'weightGrams' inválido.", 400);
    if (isNaN(parsedPrice)  || parsedPrice  <= 0) return apiError("'sellingPrice' inválido.", 400);

    // Busca material para cálculo de custo
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) return apiError('Material não encontrado.', 400);

    // Gerar SKU único
    const catPrefix = (category || 'GEN').substring(0, 3).toUpperCase();
    const namePart  = (name as string)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
    const random    = Math.floor(Math.random() * 900) + 100;
    const sku       = body.sku || `${catPrefix}-${namePart}-${random}`;

    // Custo calculado
    const divider       = (material.unitType === 'kg' || material.unitType === 'l')
      ? material.totalAmount * 1000 : material.totalAmount;
    const costPerGram   = material.costPerUnit / (divider || 1);
    const calculatedCost = parsedWeight * costPerGram + Number(additionalCost || 0);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description:    description || null,
        imageUrl:       imageUrl    || null,
        productionTime: Number(productionTime) || 0,
        weightGrams:    parsedWeight,
        additionalCost: Number(additionalCost  || 0),
        materialId,
        category:       category   || "Geral",
        subcategory:    subcategory || null,
        sku,
        shopeeUrl:      shopeeUrl   || null,
        calculatedCost: Number(calculatedCost.toFixed(4)),
        sellingPrice:   parsedPrice,
        stockQuantity:  Number(stockQuantity || 0),
      },
    });

    // Baixa inicial de material se tiver estoque cadastrado
    const initialQty = Number(stockQuantity || 0);
    if (initialQty > 0) {
      let deduction = parsedWeight * initialQty;
      if (material.unitType === 'kg' || material.unitType === 'l') deduction /= 1000;
      await prisma.material.update({
        where: { id: materialId },
        data:  { remainingAmount: { decrement: deduction } },
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return apiError('Erro ao cadastrar produto.', 500, error.message);
  }
}
