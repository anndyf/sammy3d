import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.quote.count({
      where: { status: 'PENDING' },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Notifications Count Error:", error);
    return apiError('Erro ao buscar notificações.', 500, error.message);
  }
}
