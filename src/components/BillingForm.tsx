'use client';

import React, { useState } from 'react';

export interface BillingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  termsAccepted: boolean;
}

interface BillingFormProps {
  onSubmit: (data: BillingData) => void;
  loading?: boolean;
}

const BillingForm: React.FC<BillingFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<BillingData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    termsAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    // Phone validation (optional but should be valid if provided)
    if (formData.customerPhone.trim() && !/^[6-9]\d{9}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    // Address validation
    if (!formData.deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.deliveryAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.deliveryAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.deliveryAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.deliveryAddress.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      ...(field.includes('deliveryAddress.')
        ? {
            deliveryAddress: {
              ...prev.deliveryAddress,
              [field.split('.')[1]]: value as string
            }
          }
        : { [field]: value })
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Name */}
        <div className="md:col-span-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Doe"
            disabled={loading}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="customerEmail"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
            disabled={loading}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.customerPhone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+91 98765 43210"
            disabled={loading}
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="street"
            value={formData.deliveryAddress.street}
            onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.street ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123 Main Street, Apartment 4B"
            disabled={loading}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              value={formData.deliveryAddress.city}
              onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Mumbai"
              disabled={loading}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              id="state"
              value={formData.deliveryAddress.state}
              onChange={(e) => handleInputChange('deliveryAddress.state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Maharashtra"
              disabled={loading}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              id="pincode"
              value={formData.deliveryAddress.pincode}
              onChange={(e) => handleInputChange('deliveryAddress.pincode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.pincode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="400001"
              maxLength={6}
              disabled={loading}
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              errors.termsAccepted ? 'border-red-300' : ''
            }`}
            disabled={loading}
          />
          <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.preventDefault()}
            >
              Terms and Conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </button>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Continue to Payment'
        )}
      </button>
    </form>
  );
};

export default BillingForm;