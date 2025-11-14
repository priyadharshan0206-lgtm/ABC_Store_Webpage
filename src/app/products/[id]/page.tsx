'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || 'Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Product Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'The product you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Go Back
            </button>
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Browse Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-500">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-blue-600 transition-colors">
              Products
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <ProductDetail product={product} />

      {/* Related Products Section (Optional - for future enhancement) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Continue Shopping
          </h2>
          <div className="text-center">
            <a
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}