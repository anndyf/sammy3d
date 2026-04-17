import { NextResponse, NextRequest } from 'next/server';
import { OrderService } from '@/services/OrderService';
import { apiError, apiOk, requireFields } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await OrderService.list(page, limit);
    return apiOk(result);
  } catch (error) {
    console.error("GET Orders Error:", error);
    return apiError('Erro ao buscar pedidos');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, totalAmount } = body;

    const validationError = requireFields({ customerName, totalAmount });
    if (validationError) return validationError;

    const order = await OrderService.create(body);
    return apiOk({ success: true, id: order.id, status: order.status }, 201);
  } catch (error: any) {
    console.error("ORDER POST Error:", error);
    return apiError('Erro ao processar pedido', 500, error.message);
  }
}
