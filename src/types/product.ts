export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  sizes: string[];
  colors: string[];
  category: string;
  tags: string[];
  featured?: boolean;
  isCustomDesign?: boolean;
}
