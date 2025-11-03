/**
 * Authentication service for API calls
 */
import { API_ENDPOINTS } from "../config/api";
import { apiService } from "./apiService";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: "user" | "admin";
  store_credits: number;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getAuthHeaders(): HeadersInit {
    if (!this.token) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  async register(data: RegisterRequest): Promise<User> {
    return apiService.post<User>(API_ENDPOINTS.AUTH_REGISTER, data);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const authData = await apiService.post<
      AuthResponse | { access_token: string }
    >(API_ENDPOINTS.AUTH_LOGIN, data);
    // Normalize and store token
    const token = (authData as any).access_token;
    this.setToken(token);
    return authData as AuthResponse;
  }

  async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>(API_ENDPOINTS.USER_ME);
    } catch (err: any) {
      if (
        String(err?.message || "")
          .toLowerCase()
          .includes("unauthorized")
      ) {
        this.clearToken();
      }
      throw err;
    }
  }

  async updateProfile(data: Partial<RegisterRequest>): Promise<User> {
    return apiService.put<User>(API_ENDPOINTS.USER_ME, data);
  }

  logout() {
    this.clearToken();
  }
}

export const authService = new AuthService();
