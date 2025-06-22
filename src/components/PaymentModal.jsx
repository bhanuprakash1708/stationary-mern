import React, { useState } from 'react';
import { X, CreditCard, Banknote, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function PaymentModal({
  isOpen,
  onClose,
  bookingData,
  onPaymentComplete
}) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  if (!isOpen) return null;

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentStatus(null);
  };

  const handleCashOnDelivery = async () => {
    setProcessing(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const paymentResult = {
        method: 'cash_on_delivery',
        status: 'not_required',
        paymentId: null,
        amount: bookingData.total_cost
      };

      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentComplete(paymentResult);
      }, 1500);
    } catch (error) {
      setPaymentStatus('error');
      console.error('Error processing cash on delivery:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    setProcessing(true);
    setPaymentStatus(null); // Reset any previous status

    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please check your internet connection.');
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log('Razorpay Key:', razorpayKey); // Debug log

      if (!razorpayKey || razorpayKey === 'your_razorpay_key_id_here') {
        throw new Error('Razorpay key not configured. Please add VITE_RAZORPAY_KEY_ID to your .env.local file.');
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(bookingData.total_cost * 100), // Amount in paise
        currency: 'INR',
        name: 'Stationery Store',
        description: `Booking for ${bookingData.customer_name}`,
        handler: function (response) {
          console.log('Payment successful:', response);
          setProcessing(false);
          setPaymentStatus('success');

          const paymentResult = {
            method: 'online',
            status: 'completed',
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: bookingData.total_cost
          };

          setTimeout(() => {
            onPaymentComplete(paymentResult);
          }, 1500);
        },
        prefill: {
          name: bookingData.customer_name,
          email: bookingData.customer_email || '',
          contact: bookingData.customer_phone || ''
        },
        notes: {
          booking_date: bookingData.date,
          time_slot: bookingData.time_slot,
          items: JSON.stringify(bookingData.items)
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setProcessing(false);
            setPaymentStatus('cancelled');
          }
        }
      };

      console.log('Creating Razorpay instance with options:', options);
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentStatus('error');
        setProcessing(false);
      });

      console.log('Opening Razorpay checkout...');
      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('error');
      setProcessing(false);
    }
  };

  const handleProceed = () => {
    if (selectedMethod === 'cash_on_delivery') {
      handleCashOnDelivery();
    } else if (selectedMethod === 'online') {
      handleOnlinePayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Customer:</strong> {bookingData.customer_name}</p>
              <p><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {bookingData.time_slot}</p>
              <p><strong>Items:</strong> {bookingData.items.length} item(s)</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                <strong>Total: ₹{bookingData.total_cost.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Payment Status Messages */}
          {paymentStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Payment Successful!</p>
                <p className="text-green-600 text-sm">Redirecting to confirmation...</p>
              </div>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">Payment Failed</p>
              </div>
              <p className="text-red-600 text-sm">Please try again or choose a different method.</p>
              <p className="text-red-500 text-xs mt-1">Check browser console for detailed error information.</p>
            </div>
          )}

          {paymentStatus === 'cancelled' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Payment Cancelled</p>
                <p className="text-yellow-600 text-sm">You can try again or choose a different method.</p>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {!paymentStatus && (
            <>
              <h3 className="font-medium text-gray-900 mb-4">Select Payment Method</h3>

              <div className="space-y-3 mb-6">
                {/* Online Payment Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                    selectedMethod === 'online'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                </button>

                {/* Cash on Delivery Option */}
                <button
                  onClick={() => handlePaymentMethodSelect('cash_on_delivery')}
                  className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                    selectedMethod === 'cash_on_delivery'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                disabled={!selectedMethod || processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
