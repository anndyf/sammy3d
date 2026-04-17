import { NextResponse, NextRequest } from 'next/server';
import { MaterialService } from '@/services/MaterialService';
import { apiError, apiOk, requireFields } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',  10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const result = await MaterialService.list(page, limit);
    return apiOk(result);
  } catch (error: any) {
    console.error("GET Materials Error:", error);
    return apiError('Erro ao buscar materiais.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, costPerUnit, totalAmount, unitType } = body;

    const validationError = requireFields({ name, type, costPerUnit, totalAmount, unitType });
    if (validationError) return validationError;

    const material = await MaterialService.create(body);
    return apiOk(material, 201);
  } catch (error: any) {
    console.error("POST Material Error:", error);
    return apiError('Erro ao cadastrar material.', 500, error.message);
  }
}
