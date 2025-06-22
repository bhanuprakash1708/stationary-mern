// Utility to load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById('razorpay-script');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => reject(new Error('Failed to load Razorpay script'));
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      reject(new Error('Failed to load Razorpay script'));
    };

    document.head.appendChild(script);
  });
};

// Utility to create Razorpay order (in a real app, this would be a backend API call)
export const createRazorpayOrder = async (amount, currency = 'INR') => {
  // In production, this should be an API call to your backend
  // which creates an order using Razorpay's server-side SDK
  
  // For demo purposes, we'll return a mock order
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Convert to paise
    currency: currency,
    status: 'created'
  };
};

// Utility to verify payment (in a real app, this would be a backend API call)
export const verifyPayment = async (paymentData) => {
  // In production, this should be an API call to your backend
  // which verifies the payment signature using Razorpay's server-side SDK
  
  console.log('Payment verification data:', paymentData);
  
  // For demo purposes, we'll assume all payments are valid
  return {
    verified: true,
    payment_id: paymentData.paymentId,
    order_id: paymentData.orderId,
    signature: paymentData.signature
  };
};

// Utility to format amount for Razorpay (convert to paise)
export const formatAmountForRazorpay = (amount) => {
  return Math.round(amount * 100);
};

// Utility to format amount for display (convert from paise)
export const formatAmountForDisplay = (amountInPaise) => {
  return (amountInPaise / 100).toFixed(2);
};
