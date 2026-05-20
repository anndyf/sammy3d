import { NextRequest, NextResponse } from "next/server";
import { ShopeeService } from "@/services/ShopeeService";
import { ConfigService } from "@/services/ConfigService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  const appUrl = await ConfigService.get("app_url", "");
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code || !shopId) {
    console.error("[SHOPEE CALLBACK] Parâmetros inválidos ou ausentes.");
    return NextResponse.redirect(`${baseUrl}/settings?shopee_error=missing_params`);
  }

  try {
    console.log(`[SHOPEE CALLBACK] Trocando código por tokens para a loja ${shopId}...`);
    await ShopeeService.exchangeCodeForTokens(code, shopId);
    
    return NextResponse.redirect(`${baseUrl}/settings?shopee_success=true`);
  } catch (err: any) {
    console.error("[SHOPEE CALLBACK] Erro durante a troca do token:", err);
    return NextResponse.redirect(
      `${baseUrl}/settings?shopee_error=auth_failed&message=${encodeURIComponent(err.message || "Erro desconhecido")}`
    );
  }
}
