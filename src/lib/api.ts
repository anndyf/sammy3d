import { NextResponse } from 'next/server';

/**
 * Resposta de sucesso padronizada.
 */
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Resposta de erro padronizada.
 * Garante que o front-end sempre receba `{ error: string, details?: string }`.
 */
export function apiError(message: string, status = 500, details?: string) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Wrapper de validação simples: retorna null se ok, ou uma resposta de erro.
 * Uso: `const err = requireFields({ name, amount }); if (err) return err;`
 */
export function requireFields(fields: Record<string, unknown>) {
  const missing = Object.entries(fields)
    .filter(([, val]) => val === undefined || val === null || val === '')
    .map(([key]) => key);

  if (missing.length > 0) {
    return apiError(`Campos obrigatórios ausentes: ${missing.join(', ')}`, 400);
  }
  return null;
}

/**
 * Calcula custo/grama levando em conta unidade (kg, g, l, ml).
 */
export function calcCostPerGram(costPerUnit: number, totalAmount: number, unitType: string): number {
  let divider = totalAmount;
  if (unitType === 'kg' || unitType === 'l') divider = totalAmount * 1000;
  return costPerUnit / (divider || 1);
}

/**
 * Calcula o valor líquido após taxas de marketplace.
 */
export function calcNetMarketplace(grossAmount: number, channel: string): number {
  if (channel === 'SHOPEE') return grossAmount * 0.86 - 5;
  if (channel === 'ML') return grossAmount * 0.88 - (grossAmount < 79 ? 6 : 0);
  return grossAmount;
}
