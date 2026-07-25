'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ShoppingBag, User, Search, Menu, Heart, ClipboardList, Settings, LogOut, ChevronRight, X, Truck, MapPin, Tag, CreditCard, Phone, HelpCircle } from 'lucide-react';
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
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
                  @keyframes luxuryDropdownFadeIn {
                    from {
                      opacity: 0;
                      transform: scale(0.96) translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                    }
                  }
                  @keyframes luxuryItemSlideIn {
                    from {
                      opacity: 0;
                      transform: translateY(5px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  .animate-stagger-item {
                    animation: luxuryItemSlideIn 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    opacity: 0;
                  }
                `}</style>
                <div className="absolute right-[-45px] sm:right-0 top-full mt-4 w-[310px] sm:w-[340px] bg-[#FFFCF8] border border-neutral-soft/20 rounded-[20px] shadow-[0_20px_50px_rgba(26,26,26,0.06),_0_1px_3px_rgba(0,0,0,0.02)] p-6 z-50 animate-[luxuryDropdownFadeIn_200ms_cubic-bezier(0.22,1,0.36,1)_forwards] backdrop-blur-[12px] flex flex-col text-left origin-top-right">
                  {user ? (
                    <div className="flex flex-col">
                      {/* Logged In Layout Header */}
                      <div className="pb-4 border-b border-neutral-200/50 flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#FFF9F2] text-neutral-800 flex items-center justify-center font-medium text-xs border border-neutral-200/60 shadow-sm flex-shrink-0">
                          {user.fullName?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="truncate flex-1">
                          <p className="font-serif text-sm text-neutral-900 font-normal tracking-wide truncate max-w-[170px]">{user.fullName || 'User Profile'}</p>
                          <p className="text-[9px] text-neutral-500 font-light truncate max-w-[170px] mt-0.5 tracking-wider">{user.email}</p>
                        </div>
                      </div>

                      {/* Logged In Items */}
                      <div className="flex flex-col gap-1 mt-4">
                        {[
                          { name: 'My Orders', href: '/dashboard?tab=orders', icon: <ClipboardList size={12} strokeWidth={1.5} /> },
                          { name: 'Wishlist', href: '/wishlist', icon: <Heart size={12} strokeWidth={1.5} /> },
                          { name: 'Saved Addresses', href: '/dashboard?tab=addresses', icon: <MapPin size={12} strokeWidth={1.5} /> },
                          { name: 'Coupons', href: '/dashboard?tab=coupons', icon: <Tag size={12} strokeWidth={1.5} /> },
                          { name: 'Account Settings', href: '/dashboard?tab=profile', icon: <Settings size={12} strokeWidth={1.5} /> },
                          { name: 'Saved Payments', href: '/dashboard?tab=payments', icon: <CreditCard size={12} strokeWidth={1.5} /> }
                        ].map((item, index) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsAccountDropdownOpen(false)}
                              className={`group flex items-center justify-between py-2 px-3 rounded-[8px] transition-all duration-300 cursor-pointer animate-stagger-item ${
                                isActive ? 'bg-[#FFF9F2] text-neutral-950 font-normal' : 'hover:bg-[#FFF9F2]/75 text-neutral-600 hover:text-neutral-900'
                              }`}
                              style={{ animationDelay: `${(index + 1) * 30}ms` }}
                            >
                              <span className="flex items-center gap-3 text-[10.5px] uppercase tracking-wider font-light">
                                <span className="text-neutral-400 group-hover:text-neutral-800 transition-transform duration-300 group-hover:translate-x-[2px] flex items-center justify-center">
                                  {item.icon}
                                </span>
                                {item.name}
                              </span>
                              <ChevronRight size={10} className="text-neutral-300 group-hover:text-neutral-800 transition-transform duration-300 group-hover:translate-x-[2px]" />
                            </Link>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-neutral-200/50 w-full my-4" />

                      {/* Sign Out Button */}
                      <button 
                        onClick={() => { handleLogoutClick(); setIsAccountDropdownOpen(false); }}
                        className="group flex items-center gap-3 py-2 px-3 hover:bg-red-50/50 rounded-[8px] text-left w-full cursor-pointer transition-all duration-300 uppercase text-[10px] tracking-widest font-medium text-neutral-700 hover:text-red-700 animate-stagger-item"
                        style={{ animationDelay: `210ms` }}
                      >
                        <span className="text-neutral-400 group-hover:text-red-600 transition-transform duration-300 group-hover:translate-x-[2px] flex items-center justify-center">
                          <LogOut size={12} strokeWidth={1.5} />
                        </span>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* Logged Out Header */}
                      <div className="pb-4">
                        <h3 className="font-serif text-sm font-normal tracking-wide text-neutral-900 mb-1">
                          Welcome to FREERT
                        </h3>
                        <p className="text-[10px] text-neutral-500 font-light leading-relaxed tracking-wider">
                          Sign in to manage your orders, wishlist and account.
                        </p>
                      </div>

                      {/* Auth Buttons */}
                      <div className="flex flex-col gap-2 mt-2">
                        <Link 
                          href="/login" 
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="w-full bg-[#1a1a1a] text-[#FFFCF8] font-medium uppercase tracking-[0.2em] text-[9.5px] py-3 text-center transition-all hover:bg-neutral-800 duration-300 rounded-[10px] shadow-sm cursor-pointer"
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/signup" 
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="w-full border border-neutral-200 text-neutral-800 font-medium uppercase tracking-[0.2em] text-[9.5px] py-3 text-center transition-all hover:border-neutral-950 duration-300 rounded-[10px] cursor-pointer bg-transparent"
                        >
                          Create Account
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-neutral-200/50 w-full my-4" />

                      {/* Logged Out Items */}
                      <div className="flex flex-col gap-1">
                        {[
                          { name: 'Wishlist', href: '/wishlist', icon: <Heart size={12} strokeWidth={1.5} /> },
                          { name: 'Track Order', href: '/track-order', icon: <Truck size={12} strokeWidth={1.5} /> },
                          { name: 'Help Center', href: '/support', icon: <HelpCircle size={12} strokeWidth={1.5} /> },
                          { name: 'Contact Support', href: '/support', icon: <Phone size={12} strokeWidth={1.5} /> }
                        ].map((item, index) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="group flex items-center justify-between py-2 px-3 hover:bg-[#FFF9F2] rounded-[8px] transition-all duration-300 cursor-pointer animate-stagger-item"
                            style={{ animationDelay: `${(index + 1) * 35}ms` }}
                          >
                            <span className="flex items-center gap-3 text-[10.5px] uppercase tracking-wider text-neutral-600 font-light group-hover:text-neutral-950">
                              <span className="text-neutral-400 group-hover:text-neutral-800 transition-transform duration-300 group-hover:translate-x-[2px] flex items-center justify-center">
                                {item.icon}
                              </span>
                              {item.name}
                            </span>
                            <ChevronRight size={10} className="text-neutral-300 group-hover:text-neutral-800 transition-transform duration-300 group-hover:translate-x-[2px]" />
                          </Link>
                        ))}
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
