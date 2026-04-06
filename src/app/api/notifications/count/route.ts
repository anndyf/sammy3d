import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Uso de SQL direto compatível com PostgreSQL (Supabase)
    const result: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Quote" WHERE status = 'PENDING'`);
    const count = result[0]?.count || 0;

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("DEBUG NOTIFICATION ERROR:", error);
    return NextResponse.json({ count: 0, error: error.message }, { status: 500 });
  }
}
