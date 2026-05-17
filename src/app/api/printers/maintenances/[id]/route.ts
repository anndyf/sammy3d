import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiOk } from '@/lib/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const m = await prisma.maintenance.findUnique({
      where: { id }
    });
    
    if (m) {
      await prisma.maintenance.delete({
        where: { id }
      });
      
      // Restaura a impressora correspondente para operacional
      await prisma.printer.update({
        where: { id: m.printerId },
        data: { status: 'OPERATIONAL' }
      });
    }
    
    return apiOk({ message: 'Manutenção concluída com sucesso.' });
  } catch (error: any) {
    console.error("DELETE Maintenance Error:", error);
    return apiError('Erro ao excluir manutenção.', 500, error.message);
  }
}
