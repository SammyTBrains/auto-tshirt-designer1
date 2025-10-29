import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface OrderItem {
  product_id: string;
  product_name: string;
  design_id?: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  design_data?: {
    imageUrl: string;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    canvasSize?: { width: number; height: number };
    baseSize?: { width: number; height: number };
  };
}

export interface OrderCreate {
  items: OrderItem[];
  total_amount: number;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact_email: string;
  contact_phone?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  shipping_address: OrderCreate['shipping_address'];
  email: string;
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
}

const orderService = {
  /**
   * Create a new order
   */
  async createOrder(orderData: OrderCreate): Promise<Order> {
    const response = await apiService.post<Order>(API_ENDPOINTS.ORDERS, orderData);
    return response;
  },

  /**
   * Get user's orders
   */
  async getMyOrders(): Promise<Order[]> {
    const response = await apiService.get<Order[]>(API_ENDPOINTS.ORDERS_ME);
    return response;
  },

  /**
   * Get specific order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get<Order>(API_ENDPOINTS.ORDER_BY_ID(orderId));
    return response;
  },

  /**
   * Create payment intent for order checkout
   */
  async createPaymentIntent(orderId: string): Promise<PaymentIntent> {
    const response = await apiService.post<PaymentIntent>(
      API_ENDPOINTS.ORDER_CHECKOUT(orderId),
      {}
    );
    return response;
  },

  /**
   * Confirm payment for an order
   */
  async confirmPayment(orderId: string): Promise<Order> {
    const response = await apiService.post<Order>(
      API_ENDPOINTS.ORDER_CONFIRM_PAYMENT(orderId),
      {}
    );
    return response;
  },
};

export default orderService;
