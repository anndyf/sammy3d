import { NextResponse, NextRequest } from 'next/server';
import { ProductService } from '@/services/ProductService';
import { apiError, apiOk, requireFields } from '@/lib/api';

// GET: Listagem do catálogo com paginação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',   10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const result = await ProductService.list(page, limit);
    return apiOk(result);
  } catch (error: any) {
    console.error("GET Products Error:", error);
    return apiError('Erro ao buscar catálogo.', 500, error.message);
  }
}

// POST: Cadastro de novo produto/ativo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, materialId, sellingPrice, weightGrams } = body;

    const validationError = requireFields({ name, materialId, sellingPrice, weightGrams });
    if (validationError) return validationError;

    const product = await ProductService.create(body);
    return apiOk(product, 201);
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return apiError('Erro ao cadastrar produto.', 500, error.message);
  }
}
