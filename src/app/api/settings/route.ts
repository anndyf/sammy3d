import { NextRequest } from 'next/server';
import { ConfigService } from '@/services/ConfigService';
import { apiOk, apiError } from '@/lib/api';

/**
 * Retorna todas as configurações.
 */
export async function GET() {
  try {
    const configs = await ConfigService.list();
    return apiOk(configs);
  } catch (error: any) {
    console.error("GET Settings Error:", error);
    return apiError('Erro ao buscar configurações.');
  }
}

/**
 * Salva configurações em lote.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return apiError('Corpo da requisição inválido.', 400);
    }

    await ConfigService.saveBatch(body);
    return apiOk({ message: 'Configurações salvas com sucesso.' });
  } catch (error: any) {
    console.error("POST Settings Error:", error);
    return apiError('Erro ao salvar configurações.', 500, error.message);
  }
}
