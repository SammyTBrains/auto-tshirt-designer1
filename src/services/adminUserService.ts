import { apiService } from "./apiService";
import { API_ENDPOINTS } from "../config/api";

export type AdminUserRole = "user" | "admin";

export interface AdminUserSummary {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role: AdminUserRole;
  store_credits: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  design_count?: number;
  order_count?: number;
}

export interface AdminUsersResponse {
  users: AdminUserSummary[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
  };
}

interface FetchUsersParams {
  search?: string;
  role?: AdminUserRole | "";
  status?: "active" | "inactive" | "";
  page?: number;
  pageSize?: number;
}

export interface AdminUserUpdatePayload {
  username?: string;
  full_name?: string | null;
  role?: AdminUserRole;
  is_active?: boolean;
}

export const adminUserService = {
  async fetchUsers({
    search,
    role,
    status,
    page = 1,
    pageSize = 25,
  }: FetchUsersParams = {}): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search.trim());
    }

    if (role) {
      params.set("role", role);
    }

    if (status === "active") {
      params.set("is_active", "true");
    } else if (status === "inactive") {
      params.set("is_active", "false");
    }

    const limit = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (Math.max(1, page) - 1) * limit);

    params.set("limit", String(limit));
    params.set("skip", String(skip));

    const query = params.toString();
    const url = query
      ? `${API_ENDPOINTS.ADMIN_USERS}?${query}`
      : API_ENDPOINTS.ADMIN_USERS;

    return apiService.get<AdminUsersResponse>(url);
  },

  async updateUser(
    userId: string,
    updates: AdminUserUpdatePayload
  ): Promise<{ user: AdminUserSummary }> {
    return apiService.patch<{ user: AdminUserSummary }>(
      API_ENDPOINTS.ADMIN_USER_DETAIL(userId),
      updates
    );
  },

  async adjustCredits(
    userId: string,
    amount: number,
    reason?: string
  ): Promise<{
    user: AdminUserSummary | null;
    transaction?: Record<string, unknown>;
  }> {
    return apiService.post<{
      user: AdminUserSummary | null;
      transaction?: Record<string, unknown>;
    }>(API_ENDPOINTS.ADMIN_USER_CREDIT_ADJUST(userId), {
      amount,
      reason: reason?.trim() || undefined,
    });
  },
};
