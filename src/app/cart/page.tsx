'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { validateCoupon } from '@/services/database';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Percent } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, cartSubtotal } = useCart();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const shippingThreshold = 15000;
  const shippingCost = cartSubtotal >= shippingThreshold || cartSubtotal === 0 ? 0 : 500;

  // Restore coupon if saved in sessionStorage
  useEffect(() => {
    const activeDiscount = sessionStorage.getItem('freert_discount_active') === 'true';
    if (activeDiscount && cartSubtotal > 0) {
      setAppliedCoupon({ code: 'FREERT20', discountValue: 20, discountType: 'percentage' });
      setDiscountAmount(cartSubtotal * 0.20);
    }
  }, [cartSubtotal]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      // Direct validation for special default demo coupon
      if (couponCode.trim().toUpperCase() === 'FREERT20') {
        const disc = cartSubtotal * 0.20;
        setAppliedCoupon({ code: 'FREERT20', discountValue: 20, discountType: 'percentage' });
        setDiscountAmount(disc);
        sessionStorage.setItem('freert_discount_active', 'true');
        showToast('Promo code applied successfully!', 'success');
        setCouponCode('');
        return;
      }

      // Check DB coupons
      const coupon = (await validateCoupon(couponCode.trim().toUpperCase())) as any;
      if (!coupon) {
        showToast('Invalid coupon code.', 'error');
        return;
      }

      if (!coupon.isActive) {
        showToast('This coupon has been disabled.', 'error');
        return;
      }

      if (cartSubtotal < coupon.minOrderAmount) {
        showToast(`Minimum cart value of ₹${coupon.minOrderAmount} required.`, 'error');
        return;
      }

      let calculatedDiscount = 0;
      if (coupon.discountType === 'flat') {
        calculatedDiscount = coupon.discountValue;
      } else {
        calculatedDiscount = cartSubtotal * (coupon.discountValue / 100);
        if (coupon.maxDiscountAmount > 0) {
          calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);
        }
      }

      setAppliedCoupon(coupon);
      setDiscountAmount(calculatedDiscount);
      showToast(`Coupon "${coupon.code}" applied!`, 'success');
      setCouponCode('');
    } catch (err) {
      showToast('Failed to validate coupon.', 'error');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    sessionStorage.removeItem('freert_discount_active');
    showToast('Coupon removed.', 'info');
  };

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        <div className="flex flex-col gap-2 mb-12 border-b border-neutral-soft/20 pb-6">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-fg-luxury">
            Your Shopping Bag
          </h1>
          <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">
            {cart.length === 0 ? 'Empty Bag' : `Curated Articles (${cart.reduce((sum, i) => sum + i.qty, 0)})`}
          </p>
        </div>

        {cart.length === 0 ? (
          /* Premium Empty Bag State */
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
            <div className="w-12 h-12 rounded-full border border-neutral-soft/50 flex items-center justify-center mb-6">
              <Plus size={16} className="text-text-muted stroke-[1.2]" />
            </div>
            <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-3">Your Bag is Empty</h2>
            <p className="text-[10px] uppercase tracking-widest text-text-muted leading-relaxed mb-8 max-w-[280px]">
              Explore our new arrivals and curated edits to select premium streetwear for your identity.
            </p>
            <Link href="/shop" className="btn-editorial-solid text-[9px] py-3.5 px-8 font-semibold tracking-[0.25em] uppercase">
              Shop All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Shipping indicator progress */}
              <div className="border border-neutral-soft/80 p-4 bg-bg-luxury/50 flex flex-col gap-2.5">
                <div className="flex justify-between text-[9px] uppercase tracking-widest font-semibold text-text-muted">
                  <span className="flex items-center gap-1.5"><Truck size={12} /> Shipping details</span>
                  <span>{cartSubtotal >= shippingThreshold ? 'Free Shipping Unlocked' : `₹${shippingCost} delivery fee`}</span>
                </div>
                <div className="w-full bg-neutral-soft/30 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-accent-gold h-full transition-all duration-700" 
                    style={{ width: `${Math.min(100, (cartSubtotal / shippingThreshold) * 100)}%` }}
                  />
                </div>
                {cartSubtotal < shippingThreshold && (
                  <p className="text-[9px] text-text-muted tracking-wide">
                    Add <span className="font-semibold text-fg-luxury">₹{(shippingThreshold - cartSubtotal).toLocaleString('en-IN')}</span> more to qualify for complimentary free shipping.
                  </p>
                )}
              </div>

              {/* Items Card List */}
              <div className="flex flex-col gap-6">
                {cart.map((item) => {
                  const basePrice = item.variant?.product?.basePrice || 0;
                  const additionalPrice = item.variant?.additionalPrice || 0;
                  const itemPrice = item.priceOverride || (basePrice + additionalPrice);
                  const itemName = item.variant?.product?.name || 'Bespoke Garment';
                  
                  return (
                    <div 
                      key={item.variantId} 
                      className="border border-neutral-soft/40 p-5 bg-bg-luxury flex flex-col sm:flex-row gap-5 justify-between items-stretch hover:border-neutral-soft transition-all duration-300 animate-[fadeIn_0.3s_ease-out]"
                    >
                      {/* Left: Product visual and details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 aspect-[3/4] bg-neutral-soft/20 flex-shrink-0 border border-neutral-soft/30">
                          {item.variant?.product?.images?.[0] && (
                            <img src={item.variant.product.images[0]} alt={itemName} className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <Link href={`/product/${item.variant?.product?.slug}`} className="text-xs uppercase tracking-wider font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
                            {itemName}
                          </Link>
                          <p className="text-[9px] uppercase tracking-widest text-text-muted font-light">
                            Size: {item.variant?.size} &middot; Color: {item.variant?.color}
                          </p>
                          <p className="text-[10px] font-medium text-fg-luxury mt-1.5">
                            ₹{itemPrice.toLocaleString('en-IN')} <span className="text-[8px] font-light text-text-muted">each</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Quantity toggler and sum */}
                      <div className="flex sm:flex-col justify-between items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-soft/10">
                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(item.variantId);
                            showToast(`Removed ${itemName} from shopping bag.`, 'info');
                          }}
                          className="text-text-muted hover:text-red-700 transition-colors flex items-center gap-1 text-[8.5px] uppercase tracking-widest"
                        >
                          <Trash2 size={12} /> Remove
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-neutral-soft/80 bg-neutral-soft/5">
                            <button 
                              onClick={() => updateQty(item.variantId, item.qty - 1)}
                              className="p-1.5 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                            >
                              <Minus size={9} />
                            </button>
                            <span className="px-3.5 text-[10px] font-semibold text-fg-luxury">{item.qty}</span>
                            <button 
                              onClick={() => updateQty(item.variantId, item.qty + 1)}
                              className="p-1.5 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                            >
                              <Plus size={9} />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-fg-luxury min-w-[80px] text-right">
                            ₹{(itemPrice * item.qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon code application */}
              <form onSubmit={handleApplyCoupon} className="border border-neutral-soft/40 p-5 bg-neutral-soft/5 flex flex-col gap-3">
                <span className="text-[9px] uppercase tracking-widest font-semibold text-fg-luxury flex items-center gap-1.5"><Percent size={12} className="text-accent-gold" /> Redeem Campaign Voucher</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ENTER CAMPAIGN PROMO CODE (e.g. FREERT20)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon || isValidatingCoupon}
                    className="bg-bg-luxury border border-neutral-soft/80 py-2.5 px-3 text-[10px] font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury tracking-wider disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={!!appliedCoupon || !couponCode.trim() || isValidatingCoupon}
                    className="bg-fg-luxury text-bg-luxury text-[9px] uppercase tracking-widest font-semibold py-2.5 px-6 hover:bg-neutral-800 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {isValidatingCoupon ? 'Verifying...' : 'Apply Coupon'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Sticky Order Summary Column (Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-neutral-soft/10 p-6 border border-neutral-soft/50 text-left flex flex-col gap-5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">
                Order Summary
              </h3>

              <div className="flex flex-col gap-2.5 text-xs text-text-muted">
                <div className="flex justify-between uppercase tracking-wider text-[9px] font-light">
                  <span>Bag Subtotal</span>
                  <span className="text-fg-luxury font-medium">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between uppercase tracking-wider text-[9px] text-green-700 font-medium">
                    <span className="flex items-center gap-1">
                      Coupon Applied ({appliedCoupon.code})
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon} 
                        className="text-red-700 hover:text-red-800 cursor-pointer ml-1"
                        aria-label="Remove coupon"
                      >
                        <Trash2 size={10} />
                      </button>
                    </span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between uppercase tracking-wider text-[9px] font-light">
                  <span>Shipping Cost</span>
                  <span className="text-fg-luxury font-medium">{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-fg-luxury font-semibold uppercase tracking-[0.1em] text-sm pt-4 border-t border-neutral-soft/20 mt-2">
                  <span>Total (Inc. GST)</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Secure checkout indicator */}
              <div className="flex items-center gap-2 justify-center text-[9px] uppercase tracking-widest text-text-muted mt-2 border-t border-neutral-soft/10 pt-4">
                <ShieldCheck size={14} className="text-accent-gold" />
                <span>GST Included &bull; Secure Checkout</span>
              </div>

              {/* Desktop checkout button */}
              <button 
                onClick={() => router.push('/checkout')}
                className="btn-editorial-solid w-full flex items-center justify-center gap-2 mt-4 text-[10px] tracking-[0.2em] py-3.5 uppercase cursor-pointer"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Checkout Panel (Mobile only) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-luxury/95 backdrop-blur-md border-t border-neutral-soft shadow-lg px-6 py-4 z-40 flex justify-between items-center no-print">
          <div className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-widest text-text-muted">Total Billing</span>
            <span className="text-sm font-semibold text-fg-luxury">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <button 
            onClick={() => router.push('/checkout')}
            className="btn-editorial-solid py-3 px-6 text-[9.5px] uppercase tracking-[0.2em] font-medium flex items-center gap-2"
          >
            Checkout <ArrowRight size={13} />
          </button>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}
