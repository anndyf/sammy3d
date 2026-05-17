import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiOk } from '@/lib/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, model, type, price, lifespan, powerW, status, totalHours } = body;

    const currentPrinter = await prisma.printer.findUnique({
      where: { id }
    });

    if (!currentPrinter) {
      return apiError('Impressora não encontrada.', 404);
    }

    const updatedPrice = price !== undefined ? parseFloat(price || 0) : currentPrinter.price;
    const updatedLifespan = lifespan !== undefined ? parseInt(lifespan || 5000) : currentPrinter.lifespan;
    const updatedPowerW = powerW !== undefined ? parseInt(powerW || 250) : currentPrinter.powerW;
    const depreciation = updatedLifespan > 0 ? (updatedPrice / updatedLifespan) : 0;

    const printer = await prisma.printer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(model !== undefined && { model }),
        ...(type !== undefined && { type }),
        ...(price !== undefined && { price: updatedPrice }),
        ...(lifespan !== undefined && { lifespan: updatedLifespan }),
        ...(powerW !== undefined && { powerW: updatedPowerW }),
        ...(status !== undefined && { status }),
        ...(totalHours !== undefined && { totalHours: parseFloat(totalHours) }),
        depreciation
      }
    });

    return apiOk(printer);
  } catch (error: any) {
    console.error("PUT Printer Error:", error);
    return apiError('Erro ao atualizar impressora.', 500, error.message);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.printer.delete({
      where: { id }
    });
    return apiOk({ message: 'Impressora excluída com sucesso.' });
  } catch (error: any) {
    console.error("DELETE Printer Error:", error);
    return apiError('Erro ao excluir impressora.', 500, error.message);
  }
}
