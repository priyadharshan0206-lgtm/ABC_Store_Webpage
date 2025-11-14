'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

interface BillPreviewProps {
  billingData?: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
}

const BillPreview: React.FC<BillPreviewProps> = ({ billingData }) => {
  const { items, total } = useCart();

  if (items.length === 0) {
    return null;
  }

  const billingDate = new Date().toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

        {/* Billing Date and Time */}
        <div className="mb-6 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Billing Date & Time:</span>
          </p>
          <p className="text-sm text-gray-900">{billingDate}</p>
        </div>

        {/* Customer Information */}
        {billingData && (
          <div className="mb-6 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-900 mb-2">Customer Details</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {billingData.customerName}</p>
              <p><span className="font-medium">Email:</span> {billingData.customerEmail}</p>
              {billingData.customerPhone && (
                <p><span className="font-medium">Phone:</span> {billingData.customerPhone}</p>
              )}
              <p className="pt-2">
                <span className="font-medium">Delivery Address:</span><br />
                {billingData.deliveryAddress.street}<br />
                {billingData.deliveryAddress.city}, {billingData.deliveryAddress.state} {billingData.deliveryAddress.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{index + 1}. {item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} × {item.quantity}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
            <span className="font-medium">₹{total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (GST)</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Note */}
        <div className="mt-6 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Payment Method:</strong> Razorpay (Secure Payment Gateway)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Your payment information is secure and encrypted. Test mode is enabled - no real charges will be made.
          </p>
        </div>

        {/* Terms Notice */}
        <div className="mt-4 text-xs text-gray-500">
          <p>By proceeding with payment, you agree to our Terms of Service and Privacy Policy.</p>
          <p>All transactions are secure and protected by industry-standard encryption.</p>
        </div>
      </div>
    </div>
  );
};

export default BillPreview;