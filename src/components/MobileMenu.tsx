'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, User, ShoppingBag, Heart, HelpCircle, Truck, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { cart } = useCart();
  const { user } = useAuth();
  
  // Accordion state management
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (name: string) => {
    if (activeAccordion === name) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(name);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const navigationTree = [
    {
      name: 'Men',
      href: '/shop/men',
      sub: [
        { name: 'Oversized T-Shirts', href: '/shop/men/oversized-t-shirts' },
        { name: 'Regular T-Shirts', href: '/shop/men/regular-t-shirts' },
        { name: 'Graphic T-Shirts', href: '/shop/men/graphic-t-shirts' },
        { name: 'Shirts', href: '/shop/men/shirts' },
        { name: 'Hoodies', href: '/shop/men/hoodies' },
        { name: 'Sweatshirts', href: '/shop/men/sweatshirts' },
        { name: 'Jackets', href: '/shop/men/jackets' },
        { name: 'Jeans', href: '/shop/men/jeans' },
        { name: 'Cargo Pants', href: '/shop/men/cargo-pants' },
        { name: 'Joggers', href: '/shop/men/joggers' },
        { name: 'Shorts', href: '/shop/men/shorts' },
        { name: 'Essentials', href: '/shop/men/essentials' }
      ]
    },
    {
      name: 'Women',
      href: '/shop/women',
      sub: [
        { name: 'Tops', href: '/shop/women/tops' },
        { name: 'Crop Tops', href: '/shop/women/crop-tops' },
        { name: 'Shirts', href: '/shop/women/shirts' },
        { name: 'Hoodies', href: '/shop/women/hoodies' },
        { name: 'Dresses', href: '/shop/women/dresses' },
        { name: 'Skirts', href: '/shop/women/skirts' },
        { name: 'Jeans', href: '/shop/women/jeans' },
        { name: 'Cargo Pants', href: '/shop/women/cargo-pants' },
        { name: 'Co-ords', href: '/shop/women/co-ords' },
        { name: 'Accessories', href: '/shop/women/accessories' }
      ]
    },
    {
      name: 'Accessories',
      href: '/shop/accessories',
      sub: [
        { name: 'Caps', href: '/shop/accessories/caps' },
        { name: 'Bags', href: '/shop/accessories/bags' },
        { name: 'Wallets', href: '/shop/accessories/wallets' },
        { name: 'Belts', href: '/shop/accessories/belts' },
        { name: 'Sunglasses', href: '/shop/accessories/sunglasses' },
        { name: 'Jewellery', href: '/shop/accessories/rings' }
      ]
    },
    {
      name: 'Perfumes',
      href: '/shop/perfumes',
      sub: [
        { name: 'Men', href: '/shop/perfumes/men' },
        { name: 'Women', href: '/shop/perfumes/women' },
        { name: 'Unisex', href: '/shop/perfumes/unisex' },
        { name: 'Gift Sets', href: '/shop/perfumes/gift-sets' }
      ]
    }
  ];

  return (
    <>
      {/* Background Blur Overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-fg-luxury/40 backdrop-blur-[3px] z-50 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Slide-in Drawer from Left */}
      <div className={`fixed top-0 bottom-0 left-0 w-[85vw] sm:w-[380px] bg-bg-luxury z-50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col text-left border-r border-neutral-soft/30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-soft/30">
          <Link href="/" onClick={onClose} className="text-sm font-semibold tracking-[0.25em] uppercase text-fg-luxury">
            FREERT
          </Link>
          <button 
            onClick={onClose}
            className="p-1 text-fg-luxury hover:text-accent-gold transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Navigation Panel */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-5">
          {/* Main Collapsible Category Accordions */}
          {navigationTree.map((item) => {
            const isAccordionOpen = activeAccordion === item.name;
            return (
              <div key={item.name} className="flex flex-col border-b border-neutral-soft/10 pb-4">
                <button
                  onClick={() => toggleAccordion(item.name)}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-fg-luxury hover:text-accent-gold transition-colors py-1 cursor-pointer"
                >
                  <span>{item.name}</span>
                  {isAccordionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {/* Accordion submenus lists */}
                <div className={`grid transition-all duration-500 ease-in-out ${isAccordionOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                  <div className="overflow-hidden flex flex-col gap-2.5 pl-2">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={onClose}
                        className="text-[10px] uppercase tracking-wider text-text-muted hover:text-fg-luxury transition-colors font-light py-0.5"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Single quick links */}
          <div className="flex flex-col gap-4 mt-2">
            <Link 
              href="/shop/sale"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-red-700 hover:text-red-800 transition-colors"
            >
              Sale
            </Link>
            <Link 
              href="/shop/new-arrivals"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors"
            >
              New Arrivals
            </Link>
            <Link 
              href="/shop"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors"
            >
              Best Sellers
            </Link>
          </div>

          {/* Aux links */}
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-neutral-soft/20 text-[10px] uppercase tracking-[0.15em] font-light text-text-muted">
            <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <Package size={13} />
              <span>Track Order</span>
            </Link>
            <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <Heart size={13} />
              <span>Wishlist</span>
            </Link>
            <Link href="/support" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <HelpCircle size={13} />
              <span>Contact Comms</span>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-soft/30 bg-neutral-soft/5 flex flex-col gap-4">
          <Link 
            href={user ? '/dashboard' : '/login'} 
            onClick={onClose}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-fg-luxury hover:text-accent-gold transition-colors font-medium"
          >
            <User size={16} strokeWidth={1.5} />
            <span>{user ? 'My Account' : 'Identify Sign In'}</span>
          </Link>
          <Link 
            href="/checkout" 
            onClick={onClose}
            className="btn-editorial-solid text-center text-xs tracking-[0.25em] py-3.5 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Checkout Bag ({totalItems})
          </Link>
        </div>

      </div>
    </>
  );
};
