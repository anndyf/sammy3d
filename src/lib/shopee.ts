import crypto from "crypto";

export interface ShopeeApiConfig {
  partnerId: string;
  partnerKey: string;
  isSandbox: boolean;
}

/**
 * Utilitário para lidar com a comunicação oficial com a Shopee Open API v2
 */
export class ShopeeClient {
  private partnerId: string;
  private partnerKey: string;
  private baseUrl: string;

  constructor(config: ShopeeApiConfig) {
    this.partnerId = config.partnerId;
    this.partnerKey = config.partnerKey;
    this.baseUrl = config.isSandbox
      ? "https://partner.test-stable.shopeemobile.com"
      : "https://partner.shopeemobile.com";
  }

  /**
   * Gera a assinatura HMAC-SHA256 necessária para autenticação na Shopee v2.
   */
  public generateSignature(apiPath: string, timestamp: number, accessToken?: string, shopId?: string): string {
    let baseString = "";
    
    if (accessToken && shopId) {
      // Rotas que exigem autorização da loja (privadas)
      baseString = `${this.partnerId}${apiPath}${timestamp}${accessToken}${shopId}`;
    } else {
      // Rotas comuns/públicas (como token exchange e redirect)
      baseString = `${this.partnerId}${apiPath}${timestamp}`;
    }

    return crypto
      .createHmac("sha256", this.partnerKey)
      .update(baseString)
      .digest("hex");
  }

  /**
   * Constrói a URL completa da API com os parâmetros de autenticação exigidos na query string.
   */
  public buildUrl(apiPath: string, accessToken?: string, shopId?: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = this.generateSignature(apiPath, timestamp, accessToken, shopId);

    const url = new URL(`${this.baseUrl}${apiPath}`);
    url.searchParams.append("partner_id", this.partnerId);
    url.searchParams.append("timestamp", timestamp.toString());
    url.searchParams.append("sign", sign);

    if (accessToken) {
      url.searchParams.append("access_token", accessToken);
    }
    if (shopId) {
      url.searchParams.append("shop_id", shopId);
    }

    return url.toString();
  }

  /**
   * Executa uma requisição HTTP genérica para a API da Shopee.
   */
  public async request<T = any>(
    method: "GET" | "POST",
    apiPath: string,
    options?: {
      body?: any;
      accessToken?: string;
      shopId?: string;
      params?: Record<string, string>;
    }
  ): Promise<T> {
    const urlString = this.buildUrl(apiPath, options?.accessToken, options?.shopId);
    const url = new URL(urlString);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMessage = data.message || data.error || "Erro desconhecido na chamada da Shopee API";
      throw new Error(`Shopee API Error [${data.error || response.status}]: ${errorMessage}`);
    }

    return data as T;
  }
}
