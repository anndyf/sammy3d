import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiOk, requireFields } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const printers = await prisma.printer.findMany({
      orderBy: { name: 'asc' },
      include: { maintenances: true }
    });
    return apiOk(printers);
  } catch (error: any) {
    console.error("GET Printers Error:", error);
    return apiError('Erro ao buscar impressoras.', 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, model, type, price, lifespan, powerW, status } = body;

    const validationError = requireFields({ name, model, type });
    if (validationError) return validationError;

    const parsedPrice = parseFloat(price || 0);
    const parsedLifespan = parseInt(lifespan || 5000);
    const parsedPowerW = parseInt(powerW || 250);
    const depreciation = parsedLifespan > 0 ? (parsedPrice / parsedLifespan) : 0;

    const printer = await prisma.printer.create({
      data: {
        name,
        model,
        type,
        price: parsedPrice,
        lifespan: parsedLifespan,
        powerW: parsedPowerW,
        depreciation,
        status: status || "OPERATIONAL"
      }
    });
    return apiOk(printer, 201);
  } catch (error: any) {
    console.error("POST Printer Error:", error);
    return apiError('Erro ao cadastrar impressora.', 500, error.message);
  }
}
