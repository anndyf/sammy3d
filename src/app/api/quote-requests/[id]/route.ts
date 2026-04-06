import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Atualizar status de uma solicitação (Marcar como respondida)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
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
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
