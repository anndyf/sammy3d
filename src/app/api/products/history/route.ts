import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const history = await prisma.stockHistory.findMany({
      where: {
        ...(productId && { productId })
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("HISTORY ERROR:", error);
    return NextResponse.json({ error: 'Erro ao buscar histórico de estoque', details: error.message }, { status: 500 });
  }
}
