import { NextResponse, NextRequest } from 'next/server';
import { OrderService } from '@/services/OrderService';
import { apiError, apiOk } from '@/lib/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await OrderService.update(id, body);
    return apiOk(order);
  } catch (error: any) {
    console.error('PUT Order Error:', error);
    return apiError('Erro ao atualizar pedido', 500, error.message);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await OrderService.delete(id);
    return apiOk({ success: true });
  } catch (error: any) {
    console.error('DELETE Order Error:', error);
    return apiError('Erro ao deletar pedido', 500, error.message);
  }
}
