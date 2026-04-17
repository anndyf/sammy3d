import { NextResponse, NextRequest } from 'next/server';
import { FinanceService } from '@/services/FinanceService';
import { apiError, apiOk, requireFields } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',  10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await FinanceService.list(page, limit);
    return apiOk(result);
  } catch (error: any) {
    console.error("GET Finance Error:", error);
    return apiError('Erro ao buscar movimentações');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount } = body;

    const validationError = requireFields({ type, amount });
    if (validationError) return validationError;

    const transaction = await FinanceService.create(body);
    return apiOk(transaction, 201);
  } catch (error: any) {
    console.error("POST Finance Error:", error);
    return apiError('Erro ao registrar movimentação', 500, error.message);
  }
}
