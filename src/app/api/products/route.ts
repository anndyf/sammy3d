import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Listagem completa do Catálogo de Peças 3D (Bypass Prisma Filter)
export async function GET() {
  try {
    const products = await prisma.$queryRawUnsafe(`
      SELECT p.*, m.name as materialName, m.color as materialColor, m.costPerUnit, m.totalAmount, m.unitType 
      FROM "Product" p 
      LEFT JOIN "Material" m ON p.materialId = m.id 
      ORDER BY p.createdAt DESC
    `);
    
    // Formata o objeto para manter compatibilidade com o front que espera { material: { ... } }
    const formatted = (products as any[]).map(p => ({
      ...p,
      material: {
        id: p.materialId,
        name: p.materialName,
        color: p.materialColor,
        costPerUnit: p.costPerUnit,
        totalAmount: p.totalAmount,
        unitType: p.unitType
      }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("CATALOG GET FAIL:", error);
    return NextResponse.json({ error: 'Erro ao buscar catálogo via SQL' }, { status: 500 });
  }
}

// POST: Cadastro de um novo modelo / peça 3D pronta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      productionTime, 
      weightGrams, 
      additionalCost, 
      materialId, 
      sellingPrice, 
      stockQuantity,
      category,
      subcategory,
      shopeeUrl,
      imageUrl
    } = body;

    // 1. Busca o material para o cálculo de custo de precisão
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material não encontrado' }, { status: 400 });
    }

    // 2. Geração Automática de SKU (Código Único)
    const categoryPrefix = {
      'Chaveiros': 'CHV', 'Fidgets': 'FDG', 'Sensoriais': 'SNS', 
      'Decorativos': 'DEC', 'Placas': 'PLC', 'Jogos': 'JGS'
    }[category as string] || 'GEN';
    
    // Slug do nome (primeiras 3 letras sem espaços/acentos)
    const namePart = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
    const randomPart = Math.floor(Math.random() * 900) + 100; // 3 dígitos aleatórios
    const sku = `${categoryPrefix}-${namePart}-${randomPart}`;

    // 3. Calcula o custo base real (Material + custos extras)
    const divider = material.unitType === 'kg' ? material.totalAmount * 1000 : material.totalAmount;
    const costPerGram = material.costPerUnit / divider;
    const calculatedCost = (Number(weightGrams) * costPerGram) + (Number(additionalCost) || 0);

    // 4. Persistência via Prisma (Compatível com PostgreSQL)
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        productionTime: Number(productionTime),
        weightGrams: Number(weightGrams),
        additionalCost: Number(additionalCost || 0),
        materialId,
        category: category || "Geral",
        subcategory: subcategory || null,
        sku: body.sku || sku, // Usa o SKU do front se houver, ou o gerado
        shopeeUrl: shopeeUrl || null,
        calculatedCost: Number(calculatedCost),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity || 0)
      }
    });

    // 5. Baixa Automática de Material (Se houver estoque inicial)
    const initialQty = Number(stockQuantity || 0);
    if (initialQty > 0) {
      let deduction = Number(weightGrams) * initialQty;
      if (material.unitType === 'kg' || material.unitType === 'l') deduction = deduction / 1000;
      await prisma.material.update({ 
        where: { id: materialId }, 
        data: { remainingAmount: { decrement: deduction } } 
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("PRODUCT POST SQL FAIL:", error);
    return NextResponse.json({ error: 'Erro ao cadastrar produto', details: error.message }, { status: 500 });
  }
}
