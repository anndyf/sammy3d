import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Atualizar status de uma solicitação (Marcar como respondida)
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();
    
    await prisma.$executeRawUnsafe(
      `UPDATE "Quote" SET status = $1 WHERE id = $2`,
      status, id
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH QUOTE ERROR:", error);
    return NextResponse.json({ error: "Erro ao atualizar solicitação.", details: error.message }, { status: 500 });
  }
}

// DELETE: Excluir uma solicitação permanentemente
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Quote" WHERE id = $1`,
      id
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE QUOTE ERROR:", error);
    return NextResponse.json({ error: "Erro ao excluir solicitação.", details: error.message }, { status: 500 });
  }
}
