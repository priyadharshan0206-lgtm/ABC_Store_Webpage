'use client';

import React, { useState, useEffect } from 'react';
import { loadRazorpay } from 'razorpay';

interface PaymentProps {
  amount: number;
  billingData: {
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
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: any) => void;
}

const Payment: React.FC<PaymentProps> = ({
  amount,
  billingData,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert('Payment gateway is loading. Please wait...');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order from backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_YourKeyIDHere',
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'ABC General Store',
        description: `Payment for order with ${billingData.customerName}`,
        image: '/logo.png', // Add your logo
        order_id: orderData.data.id,
        handler: async function (response: any) {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onPaymentSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              });
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            onPaymentFailure(error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: billingData.customerName,
          email: billingData.customerEmail,
          contact: billingData.customerPhone
        },
        notes: {
          address: `${billingData.deliveryAddress.street}, ${billingData.deliveryAddress.city}, ${billingData.deliveryAddress.state} - ${billingData.deliveryAddress.pincode}`,
          order_date: new Date().toISOString()
        },
        theme: {
          color: '#2563eb' // Blue-600
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onPaymentFailure(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      onPaymentFailure(error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

      <div className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">R</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Razorpay</h4>
              <p className="text-sm text-gray-500">Secure payment gateway</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
              <p className="text-sm text-green-600 mt-1">
                Your payment information is encrypted and secure. We use industry-standard security measures.
              </p>
            </div>
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Test Mode</h4>
              <p className="text-sm text-yellow-600 mt-1">
                This is a test environment. No actual charges will be made. Use test card details for payment.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : !razorpayLoaded ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Payment Gateway...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay ₹{amount.toFixed(2)}
            </span>
          )}
        </button>

        {/* Supported Methods */}
        <div className="text-center text-sm text-gray-500">
          <p>Supported payment methods:</p>
          <div className="flex justify-center items-center space-x-2 mt-2">
            <span>Credit Card</span>
            <span>•</span>
            <span>Debit Card</span>
            <span>•</span>
            <span>UPI</span>
            <span>•</span>
            <span>Net Banking</span>
            <span>•</span>
            <span>Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;