import { Product } from "./product";

export interface DesignData {
  imageUrl: string;
  position: {
    x: number;
    y: number;
  };
  scale: number;
  rotation: number;
  canvasSize: {
    width: number;
    height: number;
  };
  baseSize: {
    width: number;
    height: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  design?: DesignData;
}

export interface CartState {
  items: CartItem[];
  total: number;
}
