import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCategories } from '@/services/database';

export const Footer: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [footerDepts, setFooterDepts] = useState<any[]>([]);
  const { getSetting } = useSettings();

  const brandName = getSetting('brand_name', 'FREERT');
  const storeEmail = getSetting('store_email', 'contact@freert.com');
  const storePhone = getSetting('store_phone', '+91 98765 43210');
  const storeAddress = getSetting('store_address', 'FREERT Headquarters, New Delhi, India');
  const instagramUrl = getSetting('instagram_url', 'https://instagram.com/freert');
  const pinterestUrl = getSetting('pinterest_url', 'https://pinterest.com');
  const copyrightText = getSetting('copyright', `© ${new Date().getFullYear()} FREERT Clothing House. All Rights Reserved.`);
  const footerInfo = getSetting('footer_info', 'BE YOU. BE BOLD. BE FREERT. A global luxury clothing label designing minimalist structures and organic linens in small batches.');

  useEffect(() => {
    getCategories()
      .then(list => {
        const depts = list.filter((c: any) => !c.parentCategory);
        setFooterDepts(depts);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      const { subscribeNewsletter } = require('@/services/database');
      subscribeNewsletter(email, 'footer')
        .then(() => {
          showToast('Thank you for subscribing to our newsletter.', 'success');
          setEmail('');
        })
        .catch(() => {
          showToast('Subscription registered.', 'success');
          setEmail('');
        });
    }
  };

  const activeDepts = footerDepts.length > 0 ? footerDepts : [
    { slug: 'men', name: 'Men' },
    { slug: 'women', name: 'Women' },
    { slug: 'accessories', name: 'Accessories' },
    { slug: 'perfumes', name: 'Perfumes' }
  ];

  return (
    <footer className="bg-bg-luxury border-t border-neutral-soft/50 pt-24 pb-12 px-6 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-left">
        
        {/* Brand Block */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <Image
              src="/freert-logo-light.png"
              alt="FREERT"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-sm font-semibold tracking-[0.3em] text-fg-luxury uppercase">
              {brandName}
            </span>
          </Link>
          <p className="text-[11px] text-text-muted leading-relaxed font-light max-w-xs">
            {footerInfo}
          </p>
          <div className="text-[10px] text-text-muted font-light mt-1 flex flex-col gap-1.5">
            <p>Phone: {storePhone}</p>
            <p>Email: {storeEmail}</p>
            <p className="max-w-[200px] leading-relaxed">{storeAddress}</p>
          </div>
        </div>

        {/* Categories Links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6 text-fg-luxury">Shop</h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            {activeDepts.map((dept) => (
              <li key={dept.slug || dept.id}>
                <Link href={`/shop/${dept.slug}`} className="hover:text-accent-gold transition-colors duration-300">
                  {dept.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6 text-fg-luxury">Legal & Care</h4>
          <ul className="text-[11px] space-y-3.5 font-light text-text-muted">
            <li><Link href="/info/about" className="hover:text-accent-gold transition-colors duration-300">About {brandName}</Link></li>
            <li><Link href="/info/faq" className="hover:text-accent-gold transition-colors duration-300">FAQ</Link></li>
            <li><Link href="/info/privacy-policy" className="hover:text-accent-gold transition-colors duration-300">Privacy Policy</Link></li>
            <li><Link href="/info/shipping-policy" className="hover:text-accent-gold transition-colors duration-300">Shipping Policy</Link></li>
            <li><Link href="/info/refund-policy" className="hover:text-accent-gold transition-colors duration-300">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter Box */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury">Newsletter</h4>
          <p className="text-[11px] text-text-muted font-light leading-relaxed">
            Subscribe to receive priority invitations to limited collections drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 border-b border-neutral-soft/80 pb-2 mt-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-[11px] font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury uppercase tracking-wider"
              required
            />
            <button 
              type="submit" 
              className="text-[9px] uppercase tracking-widest text-fg-luxury hover:text-accent-gold transition-colors duration-300 font-semibold cursor-pointer"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="max-w-7xl mx-auto border-t border-neutral-soft/30 pt-10 flex flex-col sm:flex-row justify-between items-center text-[9px] uppercase tracking-[0.25em] text-text-muted gap-4">
        <div>
          {copyrightText}
        </div>
        <div className="flex gap-6">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors duration-300">Instagram</a>
          <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors duration-300">Pinterest</a>
        </div>
      </div>
    </footer>
  );
};
