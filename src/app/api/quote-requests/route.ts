import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET: Lista todas as solicitações (Admin) - BYPASSING ORM
export async function GET() {
  const prisma = new PrismaClient();
  try {
    const requests = await prisma.$queryRawUnsafe(`SELECT * FROM "Quote" ORDER BY "createdAt" DESC`);
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("GET Quotes Error:", error);
    return NextResponse.json({ error: "Erro ao buscar solicitações.", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Cliente envia uma solicitação pública - BYPASSING ORM
export async function POST(req: Request) {
  const prisma = new PrismaClient();
  try {
    const body = await req.json();
    const { clientName, clientContact, projectName, description, fileUrl, purpose, dimensions, preferredColor, externalLink } = body;

    if (!clientName || !clientContact || !projectName) {
      return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
    }

    const id = `req_${Date.now()}`;
    const now = new Date().toISOString();

    // Bypass Prisma Model Cache: SQL DIRETO (POSTGRES SYNTAX)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Quote" (id, "clientName", "clientContact", "projectName", purpose, dimensions, "preferredColor", description, "fileUrl", "externalLink", status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11)`,
      id, clientName, clientContact, projectName, purpose || '', dimensions || '', preferredColor || '', description || '', fileUrl || '', externalLink || '', now
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error("SQL FALLBACK FAIL:", error);
    return NextResponse.json({ 
      error: "Erro de Persistência Direta.", 
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
