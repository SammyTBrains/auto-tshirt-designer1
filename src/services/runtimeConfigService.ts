import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import { authService } from "./authService";

export interface RuntimeStripeConfig {
  publishable_key: string;
  secret_key: string;
}

export interface RuntimeSmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

export interface RuntimeTelegramConfig {
  bot_token: string;
  chat_id: string;
}

export interface RuntimeHuggingFaceConfig {
  token: string;
  model: string;
  base_url: string;
  timeout: number;
  provider?: string | null;
}

export interface RuntimePrintifyConfig {
  api_key: string;
  shop_id: string;
  print_provider_id?: number | null;
  blueprint_id?: number | null;
  default_shipping_method: number;
  print_area: string;
  variant_map?: Record<string, number> | null;
}

export interface RuntimeFeatureFlags {
  marketplace_enabled: boolean;
  design_export_enabled: boolean;
}

export interface RuntimeConfigPayload {
  stripe: RuntimeStripeConfig;
  smtp: RuntimeSmtpConfig;
  telegram: RuntimeTelegramConfig;
  huggingface: RuntimeHuggingFaceConfig;
  printify: RuntimePrintifyConfig;
  features: RuntimeFeatureFlags;
}

interface AdminConfigResponse {
  settings: RuntimeConfigPayload;
  masked: Record<string, unknown>;
}

interface PublicConfigResponse {
  stripe: Pick<RuntimeStripeConfig, "publishable_key">;
  features: RuntimeFeatureFlags;
}

const buildAuthHeaders = (
  contentType: boolean = true
): Record<string, string> => {
  const baseHeaders = authService.getAuthHeaders();
  const headers: Record<string, string> = {
    ...(baseHeaders as Record<string, string>),
  };

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Internal helper to add a client-side timeout to fetch calls
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 60000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } catch (err) {
    if ((err as any)?.name === "AbortError") {
      throw new Error("Request timed out while contacting the server.");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export const runtimeConfigService = {
  async getPublicConfig(): Promise<PublicConfigResponse> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/config/public`
    );
    if (!response.ok) {
      throw new Error("Failed to load public configuration");
    }
    return response.json();
  },

  async getAdminConfig(): Promise<AdminConfigResponse> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CONFIG}`,
      {
        headers: buildAuthHeaders(false),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Failed to load runtime configuration");
    }

    return response.json();
  },

  async updateAdminConfig(
    updates: RuntimeConfigPayload
  ): Promise<AdminConfigResponse> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CONFIG}`,
      {
        method: "PATCH",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ updates }),
      },
      60000
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Failed to update configuration");
    }

    return response.json();
  },

  async refreshAdminConfig(): Promise<AdminConfigResponse> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CONFIG_REFRESH}`,
      {
        method: "POST",
        headers: buildAuthHeaders(false),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Failed to refresh configuration");
    }

    return response.json();
  },

  async testPrintify(): Promise<unknown> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_PRINTIFY_TEST}`,
      {
        method: "POST",
        headers: buildAuthHeaders(false),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Printify test failed");
    }

    return response.json();
  },

  async syncPrintifyOrder(orderId: string): Promise<unknown> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_PRINTIFY_SYNC(orderId)}`,
      {
        method: "POST",
        headers: buildAuthHeaders(false),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Failed to sync order to Printify");
    }

    return response.json();
  },
};

export type PublicConfig = PublicConfigResponse;
export type AdminConfig = AdminConfigResponse;
