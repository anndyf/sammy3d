import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";

// PATCH: Atualizar status de uma solicitação
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || typeof status !== 'string') {
      return apiError("Campo 'status' obrigatório.", 400);
    }

    const updated = await prisma.quote.update({
      where: { id },
      data: { status: String(status) },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error: any) {
    console.error("PATCH Quote Error:", error);
    return apiError("Erro ao atualizar solicitação.", 500, error.message);
  }
}

// DELETE: Excluir uma solicitação permanentemente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.quote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Quote Error:", error);
    return apiError("Erro ao excluir solicitação.", 500, error.message);
  }
}
