import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiOk, requireFields } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const maintenances = await prisma.maintenance.findMany({
      orderBy: { date: 'desc' },
      include: { printer: true }
    });
    return apiOk(maintenances);
  } catch (error: any) {
    console.error("GET Maintenances Error:", error);
    return apiError('Erro ao buscar manutenções.', 500, error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { printerId, description, cost, date } = body;

    const validationError = requireFields({ printerId, description });
    if (validationError) return validationError;

    const parsedCost = parseFloat(cost || 0);

    const maintenance = await prisma.maintenance.create({
      data: {
        printerId,
        description,
        cost: parsedCost,
        date: date ? new Date(date) : new Date()
      },
      include: { printer: true }
    });

    // Coloca a impressora correspondente em status de manutenção
    await prisma.printer.update({
      where: { id: printerId },
      data: { status: 'MAINTENANCE' }
    });

    return apiOk(maintenance, 201);
  } catch (error: any) {
    console.error("POST Maintenance Error:", error);
    return apiError('Erro ao cadastrar manutenção.', 500, error.message);
  }
}
