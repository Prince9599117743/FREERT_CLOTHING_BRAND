'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ShoppingBag, User, Search, Menu, Heart, ClipboardList, Settings, LogOut, ChevronRight } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { SearchOverlay } from './SearchOverlay';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleLogoutClick = async () => {
    await logout();
    showToast('Successfully logged out.', 'info');
    router.push('/');
  };

  const linkStyle = (path: string) => {
    const base = 'hover:text-accent-gold transition-colors duration-300 relative py-1';
    const active = pathname === path ? 'text-accent-gold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-accent-gold' : 'text-fg-luxury';
    return `${base} ${active}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-bg-luxury/90 backdrop-blur-md border-b border-neutral-soft/40 py-5 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        
        {/* Mobile Hamburger & Logo Container */}
        <div className="flex-1 flex justify-start items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="block md:hidden text-fg-luxury hover:text-accent-gold transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
          
          <Link href="/" className="text-xl font-editorial tracking-[0.25em] font-semibold text-fg-luxury hover:opacity-80 transition-opacity">
            FREERT
          </Link>
        </div>

        {/* Nav Menu (Desktop) */}
        <nav className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-light">
          <div onMouseEnter={() => setIsMegaOpen(true)} className="relative py-1 cursor-pointer">
            <Link href="/shop/men" className="text-fg-luxury hover:text-accent-gold transition-colors">MEN</Link>
          </div>
          <div onMouseEnter={() => setIsMegaOpen(true)} className="relative py-1 cursor-pointer">
            <Link href="/shop/women" className="text-fg-luxury hover:text-accent-gold transition-colors">WOMEN</Link>
          </div>
          <div onMouseEnter={() => setIsMegaOpen(true)} className="relative py-1 cursor-pointer">
            <Link href="/shop/accessories" className="text-fg-luxury hover:text-accent-gold transition-colors">ACCESSORIES</Link>
          </div>
          <div onMouseEnter={() => setIsMegaOpen(true)} className="relative py-1 cursor-pointer">
            <Link href="/shop/perfumes" className="text-fg-luxury hover:text-accent-gold transition-colors">PERFUMES</Link>
          </div>
          <Link href="/shop/new-arrivals" className={linkStyle('/shop/new-arrivals')}>
            NEW DROP
          </Link>
          <Link href="/info/about" className={linkStyle('/info/about')}>
            LOOKBOOK
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

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="hover:text-accent-gold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer"
              aria-label="Account dropdown"
            >
              <User size={16} strokeWidth={1.5} />
              {user && (
                <span className="hidden lg:inline text-[9px] uppercase tracking-[0.15em] font-light">
                  {user.fullName?.split(' ')[0] || 'Active User'}
                </span>
              )}
            </button>

            {isAccountDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-bg-luxury border border-neutral-soft/80 p-4 shadow-xl z-50 animate-[fadeIn_0.15s_ease-out] flex flex-col text-left">
                {user ? (
                  <div className="flex flex-col gap-3.5 text-xs text-text-muted">
                    <div className="pb-3 border-b border-neutral-soft/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-soft/20 text-fg-luxury flex items-center justify-center font-semibold text-[10px]">
                        {user.fullName?.substring(0, 2).toUpperCase() || 'OP'}
                      </div>
                      <div>
                        <p className="font-semibold text-fg-luxury truncate max-w-[120px] uppercase text-[10px]">{user.fullName || 'Active User'}</p>
                        <p className="text-[8px] text-text-muted truncate max-w-[120px]">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
                      <User size={12} /> My Profile
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
                      <ClipboardList size={12} /> My Orders
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
                      <Heart size={12} /> Wishlist
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2 hover:text-fg-luxury transition-colors">
                      <Settings size={12} /> Saved Addresses
                    </Link>
                    <button 
                      onClick={() => { handleLogoutClick(); setIsAccountDropdownOpen(false); }}
                      className="flex items-center gap-2 hover:text-red-700 transition-colors text-left w-full mt-1.5 pt-2.5 border-t border-neutral-soft/30 cursor-pointer"
                    >
                      <LogOut size={12} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 text-xs text-text-muted">
                    <Link href="/login" onClick={() => setIsAccountDropdownOpen(false)} className="btn-editorial-solid text-center py-2 text-[9px] font-semibold tracking-widest">
                      Sign In
                    </Link>
                    <Link href="/signup" onClick={() => setIsAccountDropdownOpen(false)} className="btn-editorial text-center py-2 text-[9px] font-semibold tracking-widest">
                      Create Account
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center justify-between hover:text-fg-luxury transition-colors pt-2.5 border-t border-neutral-soft/30">
                      <span className="flex items-center gap-2"><Heart size={12} /> Wishlist</span>
                      <ChevronRight size={10} />
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center justify-between hover:text-fg-luxury transition-colors">
                      <span className="flex items-center gap-2"><ClipboardList size={12} /> Track Order</span>
                      <ChevronRight size={10} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

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
      <div onMouseLeave={() => setIsMegaOpen(false)}>
        <MegaMenu isOpen={isMegaOpen} onClose={() => setIsMegaOpen(false)} />
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Sliding Navigation Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};
