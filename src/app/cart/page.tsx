'use client';

import React from 'react';
import Cart from '@/components/Cart';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <Cart />
      </div>
    </div>
  );
}