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
      className="absolute left-0 w-full bg-bg-luxury border-b border-neutral-soft/50 shadow-sm z-40 py-12 px-12 md:px-24 flex justify-center animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        
        {/* Col 1: Linens Edit */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-5 pb-1 border-b border-neutral-soft/30">
            Linens Edit
          </h4>
          <ul className="text-[11px] space-y-3 font-light text-text-muted">
            <li>
              <Link href="/product/linen-trench-coat" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Linen Trench Coat
              </Link>
            </li>
            <li>
              <Link href="/product/structured-kimono-shirt" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Structured Kimono Shirt
              </Link>
            </li>
            <li>
              <Link href="/product/modular-linen-blazer" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Modular Linen Blazer
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 2: Minimal Staples */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-5 pb-1 border-b border-neutral-soft/30">
            Minimal Staples
          </h4>
          <ul className="text-[11px] space-y-3 font-light text-text-muted">
            <li>
              <Link href="/product/raw-silk-utility-trouser" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Raw Silk Utility Trouser
              </Link>
            </li>
            <li>
              <Link href="/product/premium-knit-shroud-hoodie" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Premium Knit Shroud Hoodie
              </Link>
            </li>
            <li>
              <Link href="/product/monolithic-slip-dress" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Monolithic Slip Dress
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Editorial Node */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-5 pb-1 border-b border-neutral-soft/30">
            Editorial Node
          </h4>
          <ul className="text-[11px] space-y-3 font-light text-text-muted">
            <li>
              <Link href="/" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Campaign Journal
              </Link>
            </li>
            <li>
              <Link href="/" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Lookbook Vol. I
              </Link>
            </li>
            <li>
              <Link href="/" onClick={onClose} className="hover:text-accent-gold transition-colors">
                Lookbook Vol. II
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Campaign Banner */}
        <div className="bg-neutral-soft/20 p-6 flex flex-col justify-between border border-neutral-soft/40 aspect-[4/3] max-w-[240px]">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">Spotlight Edit</p>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">The Tailoring Craft</h5>
          </div>
          <Link 
            href="/" 
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
