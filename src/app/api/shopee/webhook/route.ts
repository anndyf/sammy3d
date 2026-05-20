import { NextRequest, NextResponse } from "next/server";
import { ShopeeService } from "@/services/ShopeeService";

/**
 * Webhook oficial para receber notificações de eventos da Shopee em tempo real
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[SHOPEE WEBHOOK] Evento recebido:", JSON.stringify(body));

    // A Shopee v2 envia notificações de atualização de pedidos
    // Normalmente o payload contém "code" indicando o tipo de evento (ex: 3 = alteração de pedido)
    // E o objeto "data" contendo o "ordersn" (número de série do pedido)
    const orderId = body?.data?.ordersn || body?.ordersn;

    if (orderId) {
      console.log(`[SHOPEE WEBHOOK] Sincronizando pedido: ${orderId}...`);
      await ShopeeService.syncOrder(orderId);
      console.log(`[SHOPEE WEBHOOK] Pedido ${orderId} sincronizado com sucesso.`);
    } else {
      console.warn("[SHOPEE WEBHOOK] Evento ignorado ou payload sem ID do pedido (ordersn).");
    }

    // A Shopee exige retorno HTTP 200 com esse formato JSON específico para confirmar o recebimento
    return NextResponse.json({
      code: 0,
      message: "success"
    });
  } catch (err: any) {
    console.error("[SHOPEE WEBHOOK] Erro ao processar webhook:", err);
    // Mesmo em caso de erro interno de processamento do nosso lado, retornamos 200 para evitar retentativas infinitas da Shopee
    // que poderiam derrubar a fila de integração, mas registramos o log de erro no console
    return NextResponse.json({
      code: 1,
      message: err.message || "error"
    });
  }
}
