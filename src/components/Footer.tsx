'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export const Footer: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      showToast('Comms node successfully registered to grid broadcast.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-bg-luxury border-t border-neutral-soft/60 pt-20 pb-10 px-6 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Block */}
        <div className="flex flex-col gap-6">
          <div className="text-lg font-editorial tracking-[0.2em] font-semibold text-fg-luxury">
            FREERT
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-light max-w-xs">
            BE YOU. BE BOLD. BE FREERT. A global luxury clothing label designing minimalist structures and organic linens.
          </p>
        </div>

        {/* Categories Links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6 text-fg-luxury">Collections</h4>
          <ul className="text-[11px] space-y-3 font-light text-text-muted">
            <li><Link href="/" className="hover:text-accent-gold transition-colors duration-300">Belgian Linens</Link></li>
            <li><Link href="/" className="hover:text-accent-gold transition-colors duration-300">Structured Trench</Link></li>
            <li><Link href="/" className="hover:text-accent-gold transition-colors duration-300">Raw Silk Series</Link></li>
            <li><Link href="/" className="hover:text-accent-gold transition-colors duration-300">Merino Lounge</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6 text-fg-luxury">Customer Care</h4>
          <ul className="text-[11px] space-y-3 font-light text-text-muted">
            <li><Link href="/support" className="hover:text-accent-gold transition-colors duration-300">Shipping Drones</Link></li>
            <li><Link href="/support" className="hover:text-accent-gold transition-colors duration-300">Care and Returns</Link></li>
            <li><Link href="/support" className="hover:text-accent-gold transition-colors duration-300">Size Module Grid</Link></li>
            <li><Link href="/support" className="hover:text-accent-gold transition-colors duration-300">Contact Node</Link></li>
          </ul>
        </div>

        {/* Newsletter Box */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury">Grid Broadcasts</h4>
          <p className="text-[11px] text-text-muted font-light leading-relaxed">
            Subscribe to receive priority invitations to limited collections drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 border-b border-neutral-soft/80 pb-2 mt-2">
            <input 
              type="email" 
              placeholder="operator@freert.net" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-[11px] font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury"
              required
            />
            <button 
              type="submit" 
              className="text-[9px] uppercase tracking-widest text-fg-luxury hover:text-accent-gold transition-colors duration-300"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="max-w-7xl mx-auto border-t border-neutral-soft/30 pt-8 flex flex-col sm:flex-row justify-between items-center text-[9px] uppercase tracking-[0.25em] text-text-muted gap-4">
        <div>
          &copy; {new Date().getFullYear()} FREERT Clothing House. All Rights Reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-accent-gold transition-colors duration-300">Instagram</a>
          <a href="#" className="hover:text-accent-gold transition-colors duration-300">Discord</a>
          <a href="#" className="hover:text-accent-gold transition-colors duration-300">Node Status</a>
        </div>
      </div>
    </footer>
  );
};
