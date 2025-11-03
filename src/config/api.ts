/**
 * API Configuration
 * Centralized API base URL configuration
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGIN: "/api/auth/login",

  // Users
  USER_ME: "/api/users/me",
  USER_TRANSACTIONS: "/api/users/me/transactions",

  // Designs
  DESIGNS: "/api/designs/",
  DESIGNS_ME: "/api/designs/me",
  DESIGN_BY_ID: (id: string) => `/api/designs/${id}`,

  // Orders
  ORDERS: "/api/orders/",
  ORDERS_ME: "/api/orders/me",
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  ORDER_CHECKOUT: (id: string) => `/api/orders/${id}/checkout`,
  ORDER_CONFIRM_PAYMENT: (id: string) => `/api/orders/${id}/confirm-payment`,

  // Admin
  ADMIN_ANALYTICS: "/api/admin/analytics",
  ADMIN_ORDER_UPDATE_STATUS: (id: string) =>
    `/api/admin/orders/${id}/update-status`,
  ADMIN_TELEGRAM_TEST: "/api/admin/telegram/test",
  ADMIN_DAILY_REPORT: "/api/admin/analytics/send-daily-report",
  ADMIN_USERS: "/api/admin/users",
  ADMIN_USER_DETAIL: (id: string) => `/api/admin/users/${id}`,
  ADMIN_USER_CREDIT_ADJUST: (id: string) =>
    `/api/admin/users/${id}/credits-adjust`,
  ADMIN_CONFIG: "/api/admin/config",
  ADMIN_CONFIG_REFRESH: "/api/admin/config/refresh",
  ADMIN_PRINTIFY_TEST: "/api/admin/printify/test",
  ADMIN_PRINTIFY_SYNC: (orderId: string) =>
    `/api/admin/printify/orders/${orderId}/sync`,
};
