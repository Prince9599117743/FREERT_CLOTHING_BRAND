// Mock Razorpay Payment Handler

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    // Check if already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const triggerRazorpayCheckout = async (options: Omit<RazorpayOptions, 'key'>): Promise<void> => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    console.warn('Razorpay SDK could not be loaded. Running fallback transaction simulation.');
    // Simulated payment delay and callback
    setTimeout(() => {
      options.handler({
        razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 11)}`
      });
    }, 1500);
    return;
  }

  const rzp = new (window as any).Razorpay({
    ...options,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder'
  });
  
  rzp.open();
};
