'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ShoppingBag, User, Search, Menu, Heart, ClipboardList, Settings, LogOut, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { MegaMenu } from './MegaMenu';
import { SearchOverlay } from './SearchOverlay';
import { MobileMenu } from './MobileMenu';

import { useSettings } from '@/contexts/SettingsContext';
import { getCategories } from '@/services/database';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { getSetting } = useSettings();

  const brandName = getSetting('brand_name', 'FREERT');
  
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('freert_promo_dismissed') === 'true';
    if (dismissed) {
      setIsPromoOpen(false);
    }
  }, []);

  const handleDismissPromo = () => {
    setIsPromoOpen(false);
    localStorage.setItem('freert_promo_dismissed', 'true');
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [navDepts, setNavDepts] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show modal if user is logged in but profile fullName is empty
    if (user && !user.fullName) {
      setModalName('');
      setModalPhone(user.phone || '');
      setShowProfileModal(true);
    } else {
      setShowProfileModal(false);
    }
  }, [user]);

  useEffect(() => {
    getCategories()
      .then(list => {
        const depts = list.filter((c: any) => !c.parentCategory);
        setNavDepts(depts);
      })
      .catch(() => {});
  }, []);

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

  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) {
      showToast('Please fill your name.', 'error');
      return;
    }
    setModalSubmitting(true);
    try {
      await updateProfile(modalName.trim(), modalPhone.trim());
      showToast('Profile updated successfully.', 'success');
      setShowProfileModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

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

  const activeDepts = navDepts.length > 0 ? navDepts : [
    { slug: 'men', name: 'MEN' },
    { slug: 'women', name: 'WOMEN' },
    { slug: 'accessories', name: 'ACCESSORIES' },
    { slug: 'perfumes', name: 'PERFUMES' }
  ];

  return (
    <>
      {isPromoOpen && (
        <div className="bg-stone-950 text-bg-luxury py-2 px-6 flex justify-between items-center text-[8.5px] uppercase tracking-[0.25em] z-50 relative border-b border-stone-900 transition-all duration-500 ease-in-out font-medium animate-[fadeIn_0.4s_ease-out] w-full">
          <div className="flex-1 text-center font-semibold">
            Use Promo Code <span className="text-accent-gold font-bold">FREERT20</span> for 20% off • Free Delivery Above ₹499
          </div>
          <button 
            onClick={handleDismissPromo}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer p-0.5 ml-2"
            aria-label="Dismiss Promo Code Alert"
          >
            <X size={10} strokeWidth={2} />
          </button>
        </div>
      )}

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
          
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 group">
            <Image
              src="/freert-logo.svg"
              alt="FREERT"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
            <span className="text-xl font-editorial tracking-[0.25em] font-semibold text-fg-luxury">
              {brandName}
            </span>
          </Link>
        </div>

        {/* Nav Menu (Desktop) */}
        <nav className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-light">
          {activeDepts.map((dept) => (
            <div key={dept.slug || dept.id} onMouseEnter={() => setIsMegaOpen(true)} className="relative py-1 cursor-pointer">
              <Link href={`/shop/${dept.slug}`} className="text-fg-luxury hover:text-accent-gold transition-colors">
                {dept.name}
              </Link>
            </div>
          ))}
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
              <>
                <style>{`
                  @keyframes slideDownFade {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                `}</style>
                <div className="absolute right-0 top-full mt-7 w-64 bg-bg-luxury/95 backdrop-blur-lg border border-neutral-soft/90 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-50 animate-[slideDownFade_0.25s_ease-out] flex flex-col text-left rounded-sm">
                  {/* Pointing Arrow (Styled to bridge the gap cleanly) */}
                  <div className="absolute -top-[5px] right-3.5 w-2.5 h-2.5 bg-bg-luxury border-t border-l border-neutral-soft/90 transform rotate-45 z-50"></div>
                  
                  {user ? (
                    <div className="flex flex-col gap-4 text-[9px] uppercase tracking-widest text-text-muted font-light">
                      <div className="pb-4 border-b border-neutral-soft/30 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-soft/20 text-fg-luxury flex items-center justify-center font-semibold text-[10px] border border-neutral-soft/30">
                          {user.fullName?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="truncate flex-1">
                          <p className="font-semibold text-fg-luxury truncate max-w-[140px] tracking-widest">{user.fullName || 'User Profile'}</p>
                          <p className="text-[7.5px] text-text-muted lowercase truncate max-w-[140px] mt-0.5 tracking-normal">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard?tab=profile" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2.5 py-1 text-fg-luxury hover:text-accent-gold transition-all hover:translate-x-1 duration-200">
                        <User size={12} strokeWidth={1.5} /> My Profile
                      </Link>
                      <Link href="/dashboard?tab=orders" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2.5 py-1 text-fg-luxury hover:text-accent-gold transition-all hover:translate-x-1 duration-200">
                        <ClipboardList size={12} strokeWidth={1.5} /> My Orders
                      </Link>
                      <Link href="/wishlist" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2.5 py-1 text-fg-luxury hover:text-accent-gold transition-all hover:translate-x-1 duration-200">
                        <Heart size={12} strokeWidth={1.5} /> Wishlist
                      </Link>
                      <Link href="/dashboard?tab=addresses" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center gap-2.5 py-1 text-fg-luxury hover:text-accent-gold transition-all hover:translate-x-1 duration-200">
                        <Settings size={12} strokeWidth={1.5} /> Saved Addresses
                      </Link>
                      <button 
                        onClick={() => { handleLogoutClick(); setIsAccountDropdownOpen(false); }}
                        className="flex items-center gap-2.5 hover:text-red-700 transition-colors text-left w-full mt-2 pt-3.5 border-t border-neutral-soft/30 cursor-pointer uppercase text-[9px] tracking-widest font-medium"
                      >
                        <LogOut size={12} strokeWidth={1.5} /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 text-[9px] uppercase tracking-widest text-text-muted font-light">
                      <Link href="/login" onClick={() => setIsAccountDropdownOpen(false)} className="btn-editorial-solid text-center py-3 text-[9px] font-semibold tracking-[0.25em] transition-all hover:opacity-90">
                        Sign In
                      </Link>
                      <Link href="/signup" onClick={() => setIsAccountDropdownOpen(false)} className="btn-editorial text-center py-3 text-[9px] font-semibold tracking-[0.25em] transition-all hover:bg-neutral-soft/10">
                        Create Account
                      </Link>
                      <div className="border-t border-neutral-soft/30 pt-4 flex flex-col gap-3">
                        <Link href="/wishlist" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center justify-between text-fg-luxury hover:text-accent-gold hover:translate-x-1 transition-transform duration-200 py-1">
                          <span className="flex items-center gap-2.5"><Heart size={12} strokeWidth={1.5} /> Wishlist</span>
                          <ChevronRight size={10} />
                        </Link>
                        <Link href="/track-order" onClick={() => setIsAccountDropdownOpen(false)} className="flex items-center justify-between text-fg-luxury hover:text-accent-gold hover:translate-x-1 transition-transform duration-200 py-1">
                          <span className="flex items-center gap-2.5"><ClipboardList size={12} strokeWidth={1.5} /> Track Order</span>
                          <ChevronRight size={10} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Link 
            href="/cart"
            className="hover:text-accent-gold transition-colors duration-300 flex items-center gap-1.5 cursor-pointer relative animate-[fadeIn_0.3s_ease-out]"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span className="text-[10px] font-light tracking-wider">({totalItems})</span>
          </Link>
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

      {/* Profile Completion Modal (Bypasses standard close options, forces completion) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-full max-w-sm bg-bg-luxury border border-neutral-soft/90 p-8 shadow-2xl flex flex-col gap-6 text-left animate-[slideDownFade_0.3s_ease-out]">
            <div className="text-center pb-4 border-b border-neutral-soft/30">
              <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Complete Account</h3>
              <p className="text-[9px] text-text-muted font-light uppercase tracking-widest leading-relaxed mt-1.5">
                Please verify your name and enter your phone number to complete your customer account.
              </p>
            </div>
            
            <form onSubmit={handleProfileComplete} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-semibold">Full Name</label>
                <input 
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="input-editorial text-xs transition-all focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                  placeholder="First Last"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-semibold">Phone Number (Optional)</label>
                <input 
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="input-editorial text-xs transition-all focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <button
                type="submit"
                disabled={modalSubmitting}
                className="btn-editorial-solid w-full text-xs tracking-[0.2em] font-medium py-3.5 mt-2 cursor-pointer transition-all hover:tracking-[0.25em]"
              >
                {modalSubmitting ? 'Saving Profile...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
