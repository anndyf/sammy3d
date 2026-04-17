import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, requireFields } from '@/lib/api';

// GET: Listagem de todos os materiais com paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',  10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip  = (Math.max(1, page) - 1) * limit;

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.material.count(),
    ]);

    return NextResponse.json({
      data: materials,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("GET Materials Error:", error);
    return apiError('Erro ao buscar materiais.', 500, error.message);
  }
}

// POST: Cadastro de novo material (Filamento ou Resina)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, color, costPerUnit, totalAmount, unitType, recordExpense, amountPaid } = body;

    const validationError = requireFields({ name, type, costPerUnit, totalAmount, unitType });
    if (validationError) return validationError;

    const parsedCost   = Number(costPerUnit);
    const parsedAmount = Number(totalAmount);

    if (isNaN(parsedCost) || parsedCost <= 0) {
      return apiError("'costPerUnit' deve ser um número positivo.", 400);
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return apiError("'totalAmount' deve ser um número positivo.", 400);
    }

    const newMaterial = await prisma.material.create({
      data: {
        name:            String(name),
        type:            String(type),
        color:           color    ? String(color)    : null,
        costPerUnit:     parsedCost,
        totalAmount:     parsedAmount,
        remainingAmount: parsedAmount,
        unitType:        String(unitType),
      },
    });

    // Registrar despesa no livro caixa se solicitado (dentro de uma transação)
    if (recordExpense) {
      const expenseAmount = Number(amountPaid || costPerUnit);
      if (!isNaN(expenseAmount) && expenseAmount > 0) {
        await prisma.transaction.create({
          data: {
            description: `Compra de Insumo: ${name}${color ? ` (${color})` : ''}`,
            amount:      expenseAmount,
            type:        'EXPENSE',
            category:    'PRODUCAO',
            date:        new Date(),
          },
        });
      }
    }

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error: any) {
    console.error("POST Material Error:", error);
    return apiError('Erro ao cadastrar material.', 500, error.message);
  }
}
