import { NextRequest, NextResponse } from "next/server";
import { ShopeeService } from "@/services/ShopeeService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = body.days || 7;

    console.log(`[SHOPEE SYNC] Iniciando sincronização manual de histórico (últimos ${days} dias)...`);
    const result = await ShopeeService.syncHistory(days);
    
    return NextResponse.json({
      success: true,
      message: `Sincronização concluída. ${result.synced} pedidos sincronizados, ${result.errors} erros.`
    });
  } catch (error: any) {
    console.error("[SHOPEE SYNC] Erro ao sincronizar histórico:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno ao sincronizar histórico" },
      { status: 500 }
    );
  }
}
