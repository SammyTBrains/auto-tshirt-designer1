import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{product.name}</h3>
            {product.featured && (
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <span className="uppercase tracking-wide">{product.category}</span>
            <span aria-hidden="true">•</span>
            <span>{product.tags.slice(0, 2).join(", ")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-indigo-600">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-600">
                {product.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
