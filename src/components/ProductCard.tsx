'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    setIsAdding(true);

    try {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        product_id: product._id,
        quantity: 1
      });

      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group">
      <Link href={`/products/${product._id}`}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category}
            </span>
          </div>

          {/* Stock Status */}
          <div className="absolute top-2 right-2">
            {product.stock === 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            ) : product.stock < 5 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Product Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className={`
                px-4 py-2 rounded-md font-medium transition-all duration-200
                ${product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isAdding
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : showAdded
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }
              `}
            >
              {isAdding ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : showAdded ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Added!
                </span>
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;