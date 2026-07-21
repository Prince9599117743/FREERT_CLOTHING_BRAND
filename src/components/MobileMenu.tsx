'use client';

import React from 'react';
import Link from 'next/link';
import { X, ChevronRight, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { cart } = useCart();
  const { user } = useAuth();

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const categories = [
    { name: 'Men', href: '/shop/men', sub: ['Oversized T-Shirts', 'Regular T-Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jeans', 'Cargo Pants', 'Joggers', 'Shorts', 'Jackets'] },
    { name: 'Women', href: '/shop/women', sub: ['T-Shirts', 'Oversized', 'Tops', 'Hoodies', 'Jeans', 'Dresses', 'Co-ords'] },
    { name: 'Accessories', href: '/shop/accessories', sub: ['Caps', 'Belts', 'Wallets', 'Bags', 'Chains', 'Rings'] },
    { name: 'Perfumes', href: '/shop/perfumes', sub: ['Men', 'Women', 'Unisex', 'Travel Packs'] },
    { name: 'Sale', href: '/shop/sale' },
    { name: 'New Arrivals', href: '/shop/new-arrivals' }
  ];

  return (
    <>
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-fg-luxury/40 backdrop-blur-[2px] z-50 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 bottom-0 left-0 w-[85vw] sm:w-[380px] bg-bg-luxury z-50 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col text-left ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
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

        {/* Content Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="flex flex-col border-b border-neutral-soft/20 pb-4">
              <Link 
                href={cat.href}
                onClick={onClose}
                className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-fg-luxury hover:text-accent-gold transition-colors"
              >
                <span>{cat.name}</span>
                <ChevronRight size={12} className="text-text-muted" />
              </Link>
              
              {cat.sub && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {cat.sub.map((sub) => {
                    const slugified = sub.toLowerCase().replace(/ /g, '-');
                    return (
                      <Link
                        key={sub}
                        href={`${cat.href}/${slugified}`}
                        onClick={onClose}
                        className="text-[9px] uppercase tracking-wider bg-neutral-soft/10 py-1 px-2.5 border border-neutral-soft/30 text-text-muted hover:border-fg-luxury hover:text-fg-luxury transition-all font-light"
                      >
                        {sub}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
