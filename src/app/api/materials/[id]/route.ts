import { NextResponse } from 'next/server';
import { MaterialService } from '@/services/MaterialService';
import { apiError, apiOk } from '@/lib/api';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return apiError('ID is missing', 400);

    const body = await request.json();
    const updatedMaterial = await MaterialService.update(id, body);

    return apiOk(updatedMaterial);
  } catch (error: any) {
    console.error("PUT Material Error:", error);
    return apiError('Erro ao editar insumo.', 500, error.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return apiError('ID is missing', 400);

    await MaterialService.delete(id);
    return apiOk({ message: 'Insumo excluído com sucesso.' });
  } catch (error: any) {
    console.error("DELETE Material Error:", error);
    return apiError(error.message || 'Erro ao excluir insumo.', 500);
  }
}
