'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, updateQty, removeFromCart, cartSubtotal, isCartOpen, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const shippingThreshold = 15000;
  const flatShipping = 500;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FREERT20') {
      setDiscountApplied(true);
      showToast('Coupon verified: 20% discount applied.', 'success');
      sessionStorage.setItem('freert_discount_active', 'true');
      setPromoCode('');
    } else {
      showToast('Invalid promo parameters.', 'error');
    }
  };

  const handleDeleteItem = async (variantId: string, name: string) => {
    await removeFromCart(variantId);
    showToast(`Removed ${name} from shopping bag.`, 'info');
  };

  const discount = discountApplied ? cartSubtotal * 0.20 : 0;
  const shipping = cartSubtotal >= shippingThreshold || cartSubtotal === 0 ? 0 : flatShipping;
  const total = cartSubtotal - discount + shipping;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay Background */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[3px] transition-opacity duration-500"
      />

      {/* Cart Panel Container */}
      <div className="relative w-full max-w-md h-full bg-bg-luxury border-l border-neutral-soft/60 shadow-xl flex flex-col z-10 animate-[slideIn_0.35s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-soft/40">
          <h3 className="text-sm uppercase tracking-[0.25em] font-medium text-fg-luxury">Shopping Bag ({cart.length})</h3>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
            aria-label="Close Shopping Bag"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Shipping Indicator */}
        <div className="bg-neutral-soft/30 px-8 py-3 border-b border-neutral-soft/30 text-[10px] uppercase tracking-widest text-text-muted text-center font-light">
          {cartSubtotal >= shippingThreshold ? (
            <span className="text-fg-luxury font-medium">Free shipping active</span>
          ) : (
            <span>Add ₹{(shippingThreshold - cartSubtotal).toLocaleString('en-IN')} more for free delivery</span>
          )}
        </div>

        {/* Scrollable items */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center gap-4 text-center text-text-muted font-light">
              <p className="text-xs uppercase tracking-widest">Your bag is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[10px] uppercase tracking-widest text-fg-luxury border-b border-fg-luxury pb-1 font-medium hover:text-accent-gold hover:border-accent-gold transition-all"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => {
                const price = item.variant?.product?.basePrice || 0;
                const additionalPrice = item.variant?.additionalPrice || 0;
                const unitTotal = price + additionalPrice;
                const itemName = item.variant?.product?.name || 'Garment';
                
                return (
                  <div key={item.variantId} className="flex gap-4 pb-6 border-b border-neutral-soft/30">
                    {/* Item Image */}
                    <div className="w-20 aspect-[3/4] bg-neutral-soft/20 flex-shrink-0">
                      {item.variant?.product?.images?.[0] && (
                        <img 
                          src={item.variant.product.images[0]} 
                          alt={itemName} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-xs uppercase tracking-wider font-medium text-fg-luxury truncate max-w-[150px]">
                            {itemName}
                          </h4>
                          <span className="text-[11px] font-light text-fg-luxury">
                            ₹{(unitTotal * item.qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-text-muted font-light">
                          {item.variant?.color} | {item.variant?.size}
                        </p>
                      </div>

                      {/* Item footer triggers */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-neutral-soft/80 bg-neutral-soft/10">
                          <button 
                            onClick={() => updateQty(item.variantId, item.qty - 1)}
                            className="p-1.5 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-3 text-[10px] font-medium text-fg-luxury">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.variantId, item.qty + 1)}
                            className="p-1.5 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem(item.variantId, itemName)}
                          className="text-text-muted hover:text-red-700 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer footer summary */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-soft/40 px-8 py-6 bg-neutral-soft/10 flex flex-col gap-4">
            {/* Promo application */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input 
                type="text" 
                placeholder="PROMO CODE (FREERT20)" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[10px] font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury tracking-wider"
              />
              <button 
                type="submit" 
                className="bg-fg-luxury text-bg-luxury text-[9px] uppercase tracking-widest py-2 px-4 hover:bg-neutral-800 transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Calculations summaries */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-soft/20 text-xs">
              <div className="flex justify-between text-text-muted font-light uppercase tracking-wider text-[10px]">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-700 font-light uppercase tracking-wider text-[10px]">
                  <span>Promo Discount (20%)</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-text-muted font-light uppercase tracking-wider text-[10px]">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-fg-luxury font-semibold uppercase tracking-[0.1em] text-sm pt-2 border-t border-neutral-soft/20">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link 
              href="/cart" 
              onClick={() => setIsCartOpen(false)}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 mt-2 text-center text-xs tracking-[0.2em] font-medium"
            >
              Review Bag & Checkout <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
