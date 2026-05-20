import { NextResponse } from "next/server";
import { ShopeeService } from "@/services/ShopeeService";
import { apiError } from "@/lib/api";

export async function GET() {
  try {
    const authUrl = await ShopeeService.getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("[SHOPEE AUTH] Erro ao obter URL de autenticação:", err);
    return apiError(
      err.message || "Erro ao obter a URL de autorização da Shopee. Verifique se o Partner ID e o Partner Key estão configurados nas Integrações.",
      500
    );
  }
}
