import { prisma } from "@/lib/prisma";
import { ShopeeClient } from "@/lib/shopee";
import { ConfigService } from "./ConfigService";
import { OrderService } from "./OrderService";

export class ShopeeService {
  /**
   * Inicializa o cliente ShopeeClient com base nas configurações gravadas.
   */
  private static async getClient(): Promise<ShopeeClient> {
    const configs = await ConfigService.list();
    const partnerId = configs["shopee_partner_id"];
    const partnerKey = configs["shopee_partner_key"];
    const isSandbox = configs["shopee_sandbox"] === "true";

    if (!partnerId || !partnerKey) {
      throw new Error("As credenciais da Shopee (Partner ID / Partner Key) não estão configuradas.");
    }

    return new ShopeeClient({
      partnerId,
      partnerKey,
      isSandbox,
    });
  }

  /**
   * Gera a URL de redirecionamento oficial da Shopee para autorização do lojista.
   */
  public static async getAuthorizationUrl(): Promise<string> {
    const configs = await ConfigService.list();
    const partnerId = configs["shopee_partner_id"];
    const partnerKey = configs["shopee_partner_key"];
    const isSandbox = configs["shopee_sandbox"] === "true";

    if (!partnerId || !partnerKey) {
      throw new Error("Preencha o Partner ID e a Partner Key antes de conectar.");
    }

    const client = new ShopeeClient({ partnerId, partnerKey, isSandbox });
    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = "/api/v2/shop/auth_partner";
    const redirectUrl = `${configs["app_url"] || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/shopee/callback`;

    const sign = client.generateSignature(apiPath, timestamp);
    const host = isSandbox
      ? "https://partner.test-stable.shopeemobile.com"
      : "https://partner.shopeemobile.com";

    const authUrl = new URL(`${host}${apiPath}`);
    authUrl.searchParams.append("partner_id", partnerId);
    authUrl.searchParams.append("timestamp", timestamp.toString());
    authUrl.searchParams.append("sign", sign);
    authUrl.searchParams.append("redirect", redirectUrl);

    return authUrl.toString();
  }

  /**
   * Troca o código de callback da Shopee por tokens de acesso (access_token e refresh_token).
   */
  public static async exchangeCodeForTokens(code: string, shopId: string): Promise<void> {
    const client = await this.getClient();
    const configs = await ConfigService.list();
    const partnerId = configs["shopee_partner_id"];

    const apiPath = "/api/v2/public/get_token";
    const body = {
      code,
      shop_id: parseInt(shopId, 10),
      partner_id: parseInt(partnerId || "0", 10),
    };

    try {
      const response = await client.request("POST", apiPath, { body });

      if (response && response.access_token) {
        const expiresIn = response.expires_in || 14400; // 4 horas padrão
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

        await ConfigService.saveBatch({
          shopee_shop_id: shopId,
          shopee_access_token: response.access_token,
          shopee_refresh_token: response.refresh_token,
          shopee_token_expires_at: expiresAt.toString(),
        });
      } else {
        throw new Error(response.message || "Não foi possível obter os tokens da Shopee.");
      }
    } catch (err: any) {
      console.error("Erro ao trocar código por token na Shopee:", err);
      throw err;
    }
  }

  /**
   * Obtém um token de acesso válido. Se o token atual estiver expirado, ele o renova automaticamente.
   */
  public static async getValidAccessToken(): Promise<{ accessToken: string; shopId: string }> {
    const configs = await ConfigService.list();
    const accessToken = configs["shopee_access_token"];
    const refreshToken = configs["shopee_refresh_token"];
    const expiresAtStr = configs["shopee_token_expires_at"];
    const shopId = configs["shopee_shop_id"];
    const partnerId = configs["shopee_partner_id"];

    if (!accessToken || !refreshToken || !shopId) {
      throw new Error("Integração com a Shopee não configurada ou não autorizada.");
    }

    const expiresAt = parseInt(expiresAtStr || "0", 10);
    const now = Math.floor(Date.now() / 1000);

    // Se faltar menos de 10 minutos para expirar, renovamos o token
    if (now >= expiresAt - 600) {
      console.log("[SHOPEE] Renovando token expirado...");
      const client = await this.getClient();
      const apiPath = "/api/v2/public/refresh_token";
      const body = {
        refresh_token: refreshToken,
        shop_id: parseInt(shopId, 10),
        partner_id: parseInt(partnerId || "0", 10),
      };

      try {
        const response = await client.request("POST", apiPath, { body });

        if (response && response.access_token) {
          const expiresIn = response.expires_in || 14400;
          const nextExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;

          await ConfigService.saveBatch({
            shopee_access_token: response.access_token,
            shopee_refresh_token: response.refresh_token,
            shopee_token_expires_at: nextExpiresAt.toString(),
          });

          return {
            accessToken: response.access_token,
            shopId,
          };
        } else {
          throw new Error("Erro na renovação de token da Shopee.");
        }
      } catch (err: any) {
        console.error("[SHOPEE] Falha ao renovar token automaticamente:", err);
        throw err;
      }
    }

    return { accessToken, shopId };
  }

  /**
   * Busca os detalhes de um pedido na Shopee e sincroniza na base de dados do SAMMY3D.
   */
  public static async syncOrder(shopeeOrderId: string): Promise<any> {
    const client = await this.getClient();
    const { accessToken, shopId } = await this.getValidAccessToken();

    const apiPath = "/api/v2/order/get_order_detail";
    const params = {
      order_list: shopeeOrderId,
      response_optional_fields: "buyer_username,item_list,escrow_amount,total_amount,order_status",
    };

    const result = await client.request("GET", apiPath, {
      accessToken,
      shopId,
      params,
    });

    const orderData = result?.response?.order_list?.[0];
    if (!orderData) {
      throw new Error(`Pedido ${shopeeOrderId} não encontrado na Shopee.`);
    }

    // 1. Mapear Status da Shopee para Status do SAMMY3D
    const shopeeStatus = orderData.order_status;
    let localStatus = "PENDING";
    let paymentStatus = "UNPAID";

    switch (shopeeStatus) {
      case "UNPAID":
        localStatus = "PENDING";
        paymentStatus = "UNPAID";
        break;
      case "READY_TO_SHIP":
      case "PROCESSED":
        localStatus = "PICKING"; // Aguardando produção / separação
        paymentStatus = "PAID";
        break;
      case "SHIPPED":
        localStatus = "SHIPPED"; // Enviado
        paymentStatus = "PAID";
        break;
      case "COMPLETED":
        localStatus = "FINISHED"; // Concluído
        paymentStatus = "PAID";
        break;
      case "CANCELLED":
        localStatus = "CANCELLED";
        paymentStatus = "UNPAID";
        break;
      default:
        localStatus = "PENDING";
    }

    // 2. Mapeamento dos Itens do Pedido para o Catálogo do SAMMY3D
    const items = [];
    const rawItems = orderData.item_list || [];

    // Carregar produtos locais para cruzamento de SKUs
    const dbProducts = await prisma.product.findMany({
      where: { sku: { not: null } },
    });

    for (const rawItem of rawItems) {
      const itemSku = (rawItem.model_sku || rawItem.item_sku || "").trim();
      const itemName = rawItem.item_name;
      const quantity = rawItem.model_quantity_purchased || rawItem.quantity_purchased || 1;
      const price = rawItem.model_original_price || rawItem.original_price || 0;

      // Buscar correspondência de produto no catálogo usando o SKU
      let matchedProduct = null;
      if (itemSku) {
        matchedProduct = dbProducts.find(
          (p) => p.sku && p.sku.toLowerCase() === itemSku.toLowerCase()
        );
      }

      if (!matchedProduct && itemName) {
        // Fallback por correspondência parcial de nome
        matchedProduct = await prisma.product.findFirst({
          where: { name: { contains: itemName, mode: "insensitive" } },
        });
      }

      items.push({
        productId: matchedProduct?.id || null,
        customName: matchedProduct ? undefined : `${itemName} (Não Cadastrado)`,
        quantity,
        price,
      });
    }

    // Calcular valores financeiros
    const totalAmount = orderData.total_amount || 0;
    // O valor líquido real do repasse da Shopee (se enviado)
    const netRevenue = orderData.escrow_amount?.escrow_amount || null;

    // Verificar se o pedido já existe na base de dados
    const existingOrder = await prisma.order.findUnique({
      where: { id: shopeeOrderId },
    });

    if (existingOrder) {
      console.log(`[SHOPEE] Atualizando pedido existente no SAMMY3D: ${shopeeOrderId}`);
      // Atualizar status e dados financeiros de forma idempotente
      return await OrderService.update(shopeeOrderId, {
        status: localStatus,
        paymentStatus,
        totalAmount,
        netRevenue,
        channel: "Shoppe",
      });
    } else {
      console.log(`[SHOPEE] Importando novo pedido para o SAMMY3D: ${shopeeOrderId}`);
      // Criar novo pedido
      return await OrderService.create({
        id: shopeeOrderId, // Prisma aceita custom strings no id cuid()
        customerName: orderData.buyer_username || "Cliente Shopee",
        status: localStatus,
        type: "CATALOG",
        totalAmount,
        paymentStatus,
        saleChannel: "SHOPEE",
        netRevenue,
        items,
        bypassStock: false, // Deduz o estoque automaticamente com base nos SKUs vinculados
      });
    }
  }

  /**
   * Sincroniza histórico de pedidos recentes.
   * @param days Quantidade de dias para trás
   */
  public static async syncHistory(days: number = 7): Promise<{synced: number, errors: number}> {
    const client = await this.getClient();
    const { accessToken, shopId } = await this.getValidAccessToken();

    const timeTo = Math.floor(Date.now() / 1000);
    const timeFrom = timeTo - (days * 24 * 60 * 60);

    const apiPath = "/api/v2/order/get_order_list";
    let cursor = "";
    let hasMore = true;
    let synced = 0;
    let errors = 0;

    while (hasMore) {
      const params: any = {
        time_range_field: "create_time",
        time_from: timeFrom,
        time_to: timeTo,
        page_size: 50
      };
      if (cursor) {
        params.cursor = cursor;
      }

      try {
        const result = await client.request("GET", apiPath, {
          accessToken,
          shopId,
          params
        });

        const orderList = result?.response?.order_list || [];
        
        for (const order of orderList) {
          const orderSn = order.order_sn;
          if (orderSn) {
            try {
              // syncOrder faz verificação de duplicidade (atualiza se já existe)
              await this.syncOrder(orderSn);
              synced++;
            } catch (err) {
              console.error(`Erro ao sincronizar pedido ${orderSn}:`, err);
              errors++;
            }
          }
        }

        hasMore = result?.response?.has_more || result?.response?.more || false;
        cursor = result?.response?.next_cursor || "";
        
      } catch (err) {
        console.error("Erro ao buscar lista de pedidos da Shopee:", err);
        hasMore = false;
        errors++;
      }
    }
    return { synced, errors };
  }
}
