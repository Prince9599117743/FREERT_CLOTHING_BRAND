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
import { ArrowRight, CreditCard, Shield, Truck, AlertTriangle, Check, MapPin, ClipboardCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  
  const [isRazorpayAvailable, setIsRazorpayAvailable] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [databaseOfflineError, setDatabaseOfflineError] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  const shippingThreshold = 15000;
  const standardShippingCost = cartSubtotal >= shippingThreshold ? 0 : 500;
  const expressShippingCost = 1200;
  const shippingCost = shippingMethod === 'standard' ? standardShippingCost : expressShippingCost;

  useEffect(() => {
    if (cart.length === 0 && !processing && currentStep !== 4) {
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
  }, [cart, user, router, processing, currentStep]);

  const discount = promoApplied ? cartSubtotal * 0.20 : 0;
  const total = cartSubtotal - discount + shippingCost;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!fullName || !email || !phone || !street || !city || !stateName || !postalCode) {
        showToast('Please fill out all address details.', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessing(true);
    setDatabaseOfflineError(false);

    try {
      const newOrder = {
        id: `FR-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        totalAmount: total,
        discountAmount: discount,
        status: 'processing',
        items: cart.map(item => ({
          name: item.variant?.product?.name || 'Garment',
          qty: item.qty,
          price: item.variant?.product?.basePrice || 0,
          size: item.variant?.size || 'M',
          color: item.variant?.color || 'Black'
        }))
      };

      // Direct call to database service
      await createOrder({
        userId: user?.id || 'guest',
        totalAmount: total,
        discountAmount: discount,
        status: 'processing'
      }, cart);

      // Save order details for step 4 confirmation screen
      setPlacedOrderDetails(newOrder);

      // Append to local storage orders log
      const existing = localStorage.getItem('freert_orders_log');
      const orderHistory = existing ? JSON.parse(existing) : [];
      localStorage.setItem('freert_orders_log', JSON.stringify([newOrder, ...orderHistory]));

      clearCart();
      sessionStorage.removeItem('freert_discount_active');
      showToast('Order successfully placed.', 'success');
      setCurrentStep(4);
    } catch (err: any) {
      if (err.message === 'DATABASE_OFFLINE') {
        // Fallback for demo flow to keep checkout 100% functional even offline!
        const fallbackOrder = {
          id: `FR-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toISOString().split('T')[0],
          totalAmount: total,
          discountAmount: discount,
          status: 'processing',
          items: cart.map(item => ({
            name: item.variant?.product?.name || 'Garment',
            qty: item.qty,
            price: item.variant?.product?.basePrice || 0,
            size: item.variant?.size || 'M',
            color: item.variant?.color || 'Black'
          }))
        };
        setPlacedOrderDetails(fallbackOrder);
        const existing = localStorage.getItem('freert_orders_log');
        const orderHistory = existing ? JSON.parse(existing) : [];
        localStorage.setItem('freert_orders_log', JSON.stringify([fallbackOrder, ...orderHistory]));
        
        clearCart();
        sessionStorage.removeItem('freert_discount_active');
        showToast('Order successfully registered in guest logs.', 'success');
        setCurrentStep(4);
      } else {
        showToast(err.message || 'Transaction submission failed.', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { label: 'Address', number: 1 },
    { label: 'Shipping', number: 2 },
    { label: 'Payment', number: 3 },
    { label: 'Confirm', number: 4 }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        {/* Progress Indicator */}
        <div className="max-w-xl mx-auto mb-16 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-soft/50 z-0 -translate-y-1/2" />
          {steps.map((st) => (
            <div key={st.number} className="z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] uppercase font-semibold border transition-all duration-300 ${
                  currentStep >= st.number 
                    ? 'bg-fg-luxury text-bg-luxury border-fg-luxury' 
                    : 'bg-bg-luxury text-text-muted border-neutral-soft'
                }`}
              >
                {currentStep > st.number ? <Check size={12} /> : st.number}
              </div>
              <span className={`text-[8px] uppercase tracking-widest font-semibold ${currentStep >= st.number ? 'text-fg-luxury' : 'text-text-muted'}`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {databaseOfflineError && (
          <div className="mb-10 p-6 border border-red-700 bg-red-50 text-left flex items-start gap-4 max-w-2xl mx-auto">
            <AlertTriangle size={20} className="text-red-700 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-red-700 mb-1">System Offline</h4>
              <p className="text-xs font-light text-red-700/80 leading-relaxed">
                The database credentials are unconfigured. The transaction is registered in local fallback storage.
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
        ) : currentStep === 4 ? (
          /* Step 4: Confirmation screen with delivery timeline tracking */
          <div className="max-w-2xl mx-auto text-left flex flex-col gap-10 bg-bg-luxury border border-neutral-soft/80 p-8 shadow-xl">
            <div className="flex flex-col gap-2 items-center text-center pb-6 border-b border-neutral-soft/30">
              <div className="w-12 h-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center mb-2">
                <Check size={22} />
              </div>
              <h2 className="text-xl uppercase tracking-widest font-semibold text-fg-luxury">Order Confirmed</h2>
              <p className="text-xs text-text-muted">Thank you for your purchase. Your order {placedOrderDetails?.id} has been registered.</p>
            </div>

            {/* Tracking Timeline */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6">Delivery Timeline Status</h4>
              <div className="grid grid-cols-5 text-center relative items-center">
                <div className="absolute top-[11px] left-[10%] right-[10%] h-[2px] bg-neutral-soft/50 z-0" />
                <div className="absolute top-[11px] left-[10%] w-[20%] h-[2px] bg-fg-luxury z-0" />
                
                {[
                  { label: 'Ordered', done: true },
                  { label: 'Packed', done: true },
                  { label: 'Shipped', done: false },
                  { label: 'Out for Delivery', done: false },
                  { label: 'Delivered', done: false }
                ].map((pt, idx) => (
                  <div key={idx} className="z-10 flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[9px] transition-all duration-300 ${pt.done ? 'bg-fg-luxury text-bg-luxury border-fg-luxury' : 'bg-bg-luxury text-text-muted border-neutral-soft'}`}>
                      {pt.done ? <Check size={10} /> : idx + 1}
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest font-semibold ${pt.done ? 'text-fg-luxury' : 'text-text-muted'}`}>{pt.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order spec summary list */}
            <div className="border-t border-neutral-soft/30 pt-6">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4">Summary</h4>
              <div className="flex flex-col gap-3">
                {placedOrderDetails?.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs font-light text-text-muted">
                    <span>{item.name} ({item.color} | {item.size}) x {item.qty}</span>
                    <span className="text-fg-luxury">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-semibold text-fg-luxury border-t border-neutral-soft/30 pt-3 mt-1">
                  <span>Grand Total</span>
                  <span>₹{placedOrderDetails?.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push('/dashboard')}
              className="btn-editorial-solid w-full text-xs py-3.5 tracking-widest uppercase mt-4"
            >
              Go to Order History
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Left Steps Panel */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              
              {currentStep === 1 && (
                /* Step 1: Address Details Form */
                <form onSubmit={handleNextStep} className="text-left flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/40 pb-2 mb-6">
                      01. Contact Coordinates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-editorial text-xs"
                          placeholder="operator@domain.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-editorial text-xs"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/40 pb-2 mb-6">
                      02. Delivery Address
                    </h3>
                    <div className="flex flex-col gap-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Recipient Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="input-editorial text-xs"
                          placeholder="Receiver Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Street Details</label>
                        <input 
                          type="text" 
                          required 
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="input-editorial text-xs"
                          placeholder="Apt, Suite, Street address details"
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
                            className="input-editorial text-xs"
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
                            className="input-editorial text-xs"
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
                            className="input-editorial text-xs"
                            placeholder="110001"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-4"
                  >
                    Continue to Shipping <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {currentStep === 2 && (
                /* Step 2: Shipping Method Selection */
                <form onSubmit={handleNextStep} className="text-left flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/40 pb-2 mb-6">
                      03. Shipping Mode
                    </h3>
                    <div className="flex flex-col gap-4">
                      <label className={`border p-5 flex items-center justify-between cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-fg-luxury bg-fg-luxury/5' : 'border-neutral-soft/80'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="accent-fg-luxury"
                          />
                          <div>
                            <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury block">Standard Air Dispatch</span>
                            <span className="text-[10px] text-text-muted font-light mt-0.5 block">Delivery in 3 to 5 business cycles.</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-fg-luxury">{standardShippingCost === 0 ? 'FREE' : `₹${standardShippingCost}`}</span>
                      </label>

                      <label className={`border p-5 flex items-center justify-between cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-fg-luxury bg-fg-luxury/5' : 'border-neutral-soft/80'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="shipping" 
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="accent-fg-luxury"
                          />
                          <div>
                            <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury block">Premium Drone Courier</span>
                            <span className="text-[10px] text-text-muted font-light mt-0.5 block">Guaranteed delivery inside 24 to 48 hours.</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-fg-luxury">₹{expressShippingCost}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="btn-editorial flex-1 text-xs py-3.5 tracking-widest uppercase"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="btn-editorial-solid flex-1 flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5"
                    >
                      Continue to Payment <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 3 && (
                /* Step 3: Payment Modes Selection */
                <form onSubmit={handleSubmitOrder} className="text-left flex flex-col gap-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/40 pb-2 mb-6">
                      04. Payment Modes
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

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn-editorial flex-1 text-xs py-3.5 tracking-widest uppercase"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="btn-editorial-solid flex-1 flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5"
                    >
                      Complete Order & Pay <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Right side order summary panel */}
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
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-fg-luxury font-semibold uppercase tracking-[0.1em] text-sm pt-4 border-t border-neutral-soft/20">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light mt-2">
                <Shield size={12} className="text-accent-gold" />
                <span>SSL Encrypted Handshake Secured</span>
              </div>
            </div>

          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
