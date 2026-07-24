'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown, ChevronRight, User, ShoppingBag, Heart, HelpCircle, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories } from '@/services/database';
import type { Category } from '@/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { cart } = useCart();
  const { user } = useAuth();
  
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCategories()
        .then(list => setDbCategories(list))
        .catch(err => console.error('Failed to load categories in MobileMenu:', err));
    }
  }, [isOpen]);

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Departments (parent categories)
  const departments = dbCategories.filter(c => !c.parentCategory);

  // Fallbacks
  const fallbackDepts = [
    { id: 'men', name: 'Men', slug: 'men' },
    { id: 'women', name: 'Women', slug: 'women' },
    { id: 'accessories', name: 'Accessories', slug: 'accessories' },
    { id: 'perfumes', name: 'Perfumes', slug: 'perfumes' },
  ];

  const activeDepts = departments.length > 0 ? departments : fallbackDepts;

  const getSubs = (parentSlug: string) => {
    const subs = dbCategories.filter(c => c.parentCategory === parentSlug);
    if (subs.length > 0) {
      return subs.map(s => ({ name: s.name, href: `/shop/${parentSlug}/${s.slug}` }));
    }
    // Fallback static arrays
    let fallbacks: string[] = [];
    if (parentSlug === 'men') fallbacks = ['Oversized T-Shirts', 'Regular T-Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jeans', 'Cargo Pants'];
    else if (parentSlug === 'women') fallbacks = ['T-Shirts', 'Oversized', 'Tops', 'Hoodies', 'Jeans', 'Dresses'];
    else if (parentSlug === 'accessories') fallbacks = ['Caps', 'Belts', 'Wallets', 'Bags', 'Chains', 'Rings'];
    else if (parentSlug === 'perfumes') fallbacks = ['Men', 'Women', 'Unisex', 'Travel Packs'];
    
    return fallbacks.map(name => ({ name, href: `/shop/${parentSlug}/${name.toLowerCase().replace(/\s+/g, '-')}` }));
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-fg-luxury/45 backdrop-blur-[4px] z-50 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Slide-in Drawer from Left */}
      <div className={`fixed top-0 bottom-0 left-0 w-[85vw] sm:w-[380px] bg-bg-luxury z-50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col text-left border-r border-neutral-soft/30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-soft/30">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image src="/freert-logo.jpg" alt="FREERT" width={24} height={24} className="object-contain rounded-sm" />
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-fg-luxury">FREERT</span>
          </Link>
          <button 
            onClick={onClose}
            className="p-1 text-fg-luxury hover:text-accent-gold transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Navigation Scrollable Panel */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-4">
          
          {/* Shop general link */}
          <Link href="/shop" onClick={onClose} className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors pb-3 border-b border-neutral-soft/10">
            Shop All
          </Link>

          {/* Collapsible Accordions navigation tree */}
          {activeDepts.map((item) => {
            const isAccordionOpen = activeAccordion === item.name;
            const subItems = getSubs(item.slug);
            return (
              <div key={item.id || item.slug} className="flex flex-col border-b border-neutral-soft/10 pb-3">
                <button
                  onClick={() => toggleAccordion(item.name)}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-fg-luxury hover:text-accent-gold transition-colors py-1 cursor-pointer"
                >
                  <span>{item.name}</span>
                  {isAccordionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {/* Collapsible content with sliding height transition */}
                <div className={`grid transition-all duration-300 ease-in-out ${isAccordionOpen ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                  <div className="overflow-hidden flex flex-col gap-2.5 pl-3">
                    {subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={onClose}
                        className="text-[9.5px] uppercase tracking-wider text-text-muted hover:text-fg-luxury transition-colors font-light py-0.5"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick links */}
          <div className="flex flex-col gap-4 mt-2">
            <Link href="/shop/new-arrivals" onClick={onClose} className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
              New Arrivals
            </Link>
            <Link href="/shop" onClick={onClose} className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
              Best Sellers
            </Link>
            <Link href="/shop/sale" onClick={onClose} className="text-xs uppercase tracking-[0.2em] font-semibold text-red-700 hover:text-red-800 transition-colors">
              Sale
            </Link>
          </div>

          {/* Custom Auxiliary links */}
          <div className="flex flex-col gap-3.5 mt-6 pt-6 border-t border-neutral-soft/20 text-[9.5px] uppercase tracking-[0.15em] font-light text-text-muted">
            <Link href="/track-order" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <Package size={12} />
              <span>Track Order</span>
            </Link>
            <Link href="/wishlist" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <Heart size={12} />
              <span>Wishlist</span>
            </Link>
            <Link href="/support" onClick={onClose} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
              <HelpCircle size={12} />
              <span>Contact Comms</span>
            </Link>
          </div>

        </div>

        {/* Footer Actions Account / Cart */}
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
            href="/cart" 
            onClick={onClose}
            className="btn-editorial-solid text-center text-xs tracking-[0.25em] py-3.5 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> View Shopping Bag ({totalItems})
          </Link>
        </div>

      </div>
    </>
  );
};
