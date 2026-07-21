'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { createOrder } from '@/services/database';
import { ArrowRight, CreditCard, Shield, Truck, AlertTriangle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  
  // Dynamic settings check
  const [isRazorpayAvailable, setIsRazorpayAvailable] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [databaseOfflineError, setDatabaseOfflineError] = useState(false);

  const shippingThreshold = 15000;
  const flatShipping = 500;

  useEffect(() => {
    if (cart.length === 0 && !processing) {
      router.push('/');
    }
    const promo = sessionStorage.getItem('freert_discount_active') === 'true';
    if (promo) {
      setPromoApplied(true);
    }
    if (user) {
      setEmail(user.email);
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }

    const saved = localStorage.getItem('freert_razorpay_enabled');
    const razorpayActive = saved === 'true';
    setIsRazorpayAvailable(razorpayActive);
    
    if (razorpayActive) {
      setPaymentMethod('razorpay');
    } else {
      setPaymentMethod('cod');
    }
  }, [cart, user, router, processing]);

  const discount = promoApplied ? cartSubtotal * 0.20 : 0;
  const shipping = cartSubtotal >= shippingThreshold ? 0 : flatShipping;
  const total = cartSubtotal - discount + shipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessing(true);
    setDatabaseOfflineError(false);

    try {
      // Direct call to database service (which throws error if unconfigured)
      await createOrder({
        userId: user?.id || 'guest',
        totalAmount: total,
        discountAmount: discount,
        status: 'processing'
      }, cart);

      clearCart();
      sessionStorage.removeItem('freert_discount_active');
      showToast('Order successfully established.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message === 'DATABASE_OFFLINE') {
        setDatabaseOfflineError(true);
        showToast('Database coordinates are currently offline.', 'error');
      } else {
        showToast(err.message || 'Transaction submission failed.', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        <h1 className="text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">Checkout Node</h1>

        {databaseOfflineError && (
          <div className="mb-10 p-6 border border-red-700 bg-red-50 text-left flex items-start gap-4 max-w-2xl mx-auto">
            <AlertTriangle size={20} className="text-red-700 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-red-700 mb-1">Operations Node Offline</h4>
              <p className="text-xs font-light text-red-700/80 leading-relaxed">
                The database credentials are unconfigured. To finalize transaction checkouts, please coordinate with your administrator to mount your Supabase environment keys inside `.env.local` or the settings dashboard panel.
              </p>
            </div>
          </div>
        )}

        {processing ? (
          <div className="py-24 text-center flex flex-col justify-center items-center gap-6">
            <div className="w-12 h-12 border-2 border-neutral-soft border-t-fg-luxury rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-[0.25em] text-text-muted">
              Processing Secure Payment Parameters...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Shipping Details form */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              {/* Contact Node info */}
              <div className="text-left">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/40 pb-2">
                  01. Contact Coordinates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Comms Email</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-editorial"
                      placeholder="operator@domain.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Phone Line</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-editorial"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Node info */}
              <div className="text-left">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/40 pb-2">
                  02. Delivery Node Address
                </h3>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Recipient Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-editorial"
                      placeholder="Receiver Identity"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Street Details</label>
                    <input 
                      type="text" 
                      required 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="input-editorial"
                      placeholder="Apt, Suite, Street name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">City</label>
                      <input 
                        type="text" 
                        required 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-editorial"
                        placeholder="New Delhi"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">State</label>
                      <input 
                        type="text" 
                        required 
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="input-editorial"
                        placeholder="Delhi"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Postal Code</label>
                      <input 
                        type="text" 
                        required 
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="input-editorial"
                        placeholder="110001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods selection */}
              <div className="text-left">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/40 pb-2">
                  03. Settlement Mode
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isRazorpayAvailable && (
                    <label className={`border p-5 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-fg-luxury bg-fg-luxury/5' : 'border-neutral-soft/80'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="accent-fg-luxury"
                        />
                        <span className="text-xs uppercase tracking-wider font-medium text-fg-luxury">Razorpay Card / UPI</span>
                      </div>
                      <CreditCard size={16} className="text-text-muted" />
                    </label>
                  )}
                  <label className={`border p-5 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-fg-luxury bg-fg-luxury/5' : 'border-neutral-soft/80'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-fg-luxury"
                      />
                      <span className="text-xs uppercase tracking-wider font-medium text-fg-luxury">Cash On Delivery</span>
                    </div>
                    <Truck size={16} className="text-text-muted" />
                  </label>
                </div>
              </div>
            </div>

            {/* Side order summary panel */}
            <div className="lg:col-span-5 bg-neutral-soft/10 p-8 border border-neutral-soft/50 text-left flex flex-col gap-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">
                Order Specs
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto">
                {cart.map(item => {
                  const price = item.variant?.product?.basePrice || 0;
                  const additionalPrice = item.variant?.additionalPrice || 0;
                  return (
                    <div key={item.variantId} className="flex justify-between items-start gap-4 text-xs font-light text-text-muted border-b border-neutral-soft/20 pb-3">
                      <div className="max-w-[70%]">
                        <p className="uppercase font-medium text-fg-luxury">{item.variant?.product?.name}</p>
                        <p className="text-[9px] uppercase tracking-widest mt-0.5">{item.variant?.color} | {item.variant?.size} x {item.qty}</p>
                      </div>
                      <span className="text-fg-luxury">₹{((price + additionalPrice) * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal logs */}
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-soft/20 text-xs">
                <div className="flex justify-between text-text-muted uppercase tracking-wider text-[10px]">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-700 uppercase tracking-wider text-[10px]">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted uppercase tracking-wider text-[10px]">
                  <span>Drone Delivery</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-fg-luxury font-semibold uppercase tracking-[0.1em] text-sm pt-4 border-t border-neutral-soft/20">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                type="submit" 
                className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 cursor-pointer mt-4"
              >
                Place Order <ArrowRight size={14} />
              </button>

              <div className="flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light mt-2">
                <Shield size={12} className="text-accent-gold" />
                <span>SSL Encrypted Handshake Secured</span>
              </div>
            </div>

          </form>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
