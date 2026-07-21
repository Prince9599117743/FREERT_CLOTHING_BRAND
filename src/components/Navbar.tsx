'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, User, Search } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { SearchOverlay } from './SearchOverlay';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const linkStyle = (path: string) => {
    const base = 'hover:text-accent-gold transition-colors duration-300 relative py-1';
    const active = pathname === path ? 'text-accent-gold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-accent-gold' : 'text-fg-luxury';
    return `${base} ${active}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-bg-luxury/90 backdrop-blur-md border-b border-neutral-soft/40 py-5 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        {/* Brand logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="text-xl font-editorial tracking-[0.25em] font-semibold text-fg-luxury hover:opacity-80 transition-opacity">
            FREERT
          </Link>
        </div>

        {/* Nav Menu */}
        <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.25em] font-light">
          <div 
            onMouseEnter={() => setIsMegaOpen(true)}
            className="relative"
          >
            <Link href="/" className={linkStyle('/')}>
              Shop Edit
            </Link>
          </div>
          <Link href="/support" className={linkStyle('/support')}>
            Comms Node
          </Link>
          <Link href="/dashboard" className={linkStyle('/dashboard')}>
            Dashboard
          </Link>
        </nav>

        {/* Nav Actions */}
        <div className="flex-1 flex justify-end items-center gap-6 text-fg-luxury">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-accent-gold transition-colors duration-300 cursor-pointer" 
            aria-label="Search Catalog"
          >
            <Search size={16} strokeWidth={1.5} />
          </button>

          <Link href="/dashboard" className="hover:text-accent-gold transition-colors duration-300 flex items-center" aria-label="User Dashboard">
            <User size={16} strokeWidth={1.5} />
            {user && (
              <span className="hidden lg:inline text-[9px] uppercase tracking-[0.15em] ml-2 font-light">
                {user.fullName?.split(' ')[0] || 'Operator'}
              </span>
            )}
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-accent-gold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer relative"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span className="text-[10px] font-light tracking-wider">({totalItems})</span>
          </button>
        </div>
      </header>

      {/* MegaMenu Dropdown */}
      <MegaMenu isOpen={isMegaOpen} onClose={() => setIsMegaOpen(false)} />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
