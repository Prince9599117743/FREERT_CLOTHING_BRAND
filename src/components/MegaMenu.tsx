'use client';

import React from 'react';
import Link from 'next/link';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      onMouseLeave={onClose}
      className="absolute left-0 w-full bg-bg-luxury border-b border-neutral-soft/50 shadow-sm z-40 py-16 px-12 md:px-24 flex justify-center animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-5 gap-12 text-left">
        
        {/* Col 1: Men's Silhouette */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
            Men
          </h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            <li><Link href="/shop/men/oversized-t-shirts" onClick={onClose} className="hover:text-accent-gold transition-colors block">Oversized T-Shirts</Link></li>
            <li><Link href="/shop/men/regular-t-shirts" onClick={onClose} className="hover:text-accent-gold transition-colors block">Regular T-Shirts</Link></li>
            <li><Link href="/shop/men/shirts" onClick={onClose} className="hover:text-accent-gold transition-colors block">Shirts</Link></li>
            <li><Link href="/shop/men/hoodies" onClick={onClose} className="hover:text-accent-gold transition-colors block">Hoodies</Link></li>
            <li><Link href="/shop/men/jeans" onClick={onClose} className="hover:text-accent-gold transition-colors block">Jeans</Link></li>
            <li><Link href="/shop/men/cargo-pants" onClick={onClose} className="hover:text-accent-gold transition-colors block">Cargo Pants</Link></li>
          </ul>
        </div>

        {/* Col 2: Women's Silhouette */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
            Women
          </h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            <li><Link href="/shop/women/t-shirts" onClick={onClose} className="hover:text-accent-gold transition-colors block">T-Shirts</Link></li>
            <li><Link href="/shop/women/oversized" onClick={onClose} className="hover:text-accent-gold transition-colors block">Oversized</Link></li>
            <li><Link href="/shop/women/tops" onClick={onClose} className="hover:text-accent-gold transition-colors block">Tops</Link></li>
            <li><Link href="/shop/women/hoodies" onClick={onClose} className="hover:text-accent-gold transition-colors block">Hoodies</Link></li>
            <li><Link href="/shop/women/jeans" onClick={onClose} className="hover:text-accent-gold transition-colors block">Jeans</Link></li>
            <li><Link href="/shop/women/dresses" onClick={onClose} className="hover:text-accent-gold transition-colors block">Dresses</Link></li>
          </ul>
        </div>

        {/* Col 3: Accessories */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
            Accessories
          </h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            <li><Link href="/shop/accessories/caps" onClick={onClose} className="hover:text-accent-gold transition-colors block">Caps</Link></li>
            <li><Link href="/shop/accessories/belts" onClick={onClose} className="hover:text-accent-gold transition-colors block">Belts</Link></li>
            <li><Link href="/shop/accessories/wallets" onClick={onClose} className="hover:text-accent-gold transition-colors block">Wallets</Link></li>
            <li><Link href="/shop/accessories/bags" onClick={onClose} className="hover:text-accent-gold transition-colors block">Bags</Link></li>
            <li><Link href="/shop/accessories/chains" onClick={onClose} className="hover:text-accent-gold transition-colors block">Chains</Link></li>
            <li><Link href="/shop/accessories/rings" onClick={onClose} className="hover:text-accent-gold transition-colors block">Rings</Link></li>
          </ul>
        </div>

        {/* Col 4: Perfumes */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 pb-1.5 border-b border-neutral-soft/30">
            Perfumes
          </h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            <li><Link href="/shop/perfumes/men" onClick={onClose} className="hover:text-accent-gold transition-colors block">Men</Link></li>
            <li><Link href="/shop/perfumes/women" onClick={onClose} className="hover:text-accent-gold transition-colors block">Women</Link></li>
            <li><Link href="/shop/perfumes/unisex" onClick={onClose} className="hover:text-accent-gold transition-colors block">Unisex</Link></li>
            <li><Link href="/shop/perfumes/travel-packs" onClick={onClose} className="hover:text-accent-gold transition-colors block">Travel Packs</Link></li>
          </ul>
        </div>

        {/* Col 5: Campaign banner */}
        <div className="bg-neutral-soft/10 p-6 flex flex-col justify-between border border-neutral-soft/60 aspect-[4/5] max-w-[220px]">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">Spotlight Edit</p>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">The Tailoring Craft</h5>
          </div>
          <Link 
            href="/shop" 
            onClick={onClose}
            className="text-[9px] uppercase tracking-[0.2em] font-medium text-fg-luxury border-b border-fg-luxury pb-1 self-start hover:text-accent-gold hover:border-accent-gold transition-all"
          >
            Explore
          </Link>
        </div>

      </div>
    </div>
  );
};
