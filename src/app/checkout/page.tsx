'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import BillingForm, { BillingData } from '@/components/BillingForm';
import BillPreview from '@/components/BillPreview';
import Payment from '@/components/Payment';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'billing' | 'payment'>('billing');
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Redirect to cart if empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleBillingSubmit = (data: BillingData) => {
    setBillingData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setLoading(true);

    try {
      // Create order in backend
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems: items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: total,
          ...billingData
        })
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        setOrderId(orderResult.data._id);

        // Update order with payment ID
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderResult.data._id}/payment`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentData.paymentId
          })
        });

        // Clear cart and redirect to success
        clearCart();
        router.push(`/success?orderId=${orderResult.data._id}`);
      } else {
        throw new Error(orderResult.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="mt-4">
            <div className="flex items-center">
              <div className={`flex items-center ${step === 'billing' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  step === 'billing'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-green-600 bg-green-600 text-white'
                }`}>
                  {step === 'billing' ? '1' : '✓'}
                </div>
                <span className="ml-2 font-medium">Billing Information</span>
              </div>

              <div className="flex-1 h-1 mx-4 bg-gray-300"></div>

              <div className={`flex items-center ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  step === 'payment'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'billing' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Billing & Shipping Information
                </h2>
                <BillingForm
                  onSubmit={handleBillingSubmit}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Payment Information
                </h2>
                <Payment
                  amount={total}
                  billingData={billingData!}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BillPreview billingData={billingData || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}