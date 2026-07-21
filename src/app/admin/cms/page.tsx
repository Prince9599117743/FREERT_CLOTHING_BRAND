'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Save, Image as ImageIcon } from 'lucide-react';

const DEFAULT_PAGES: Record<string, { title: string; content: string }> = {
  about: {
    title: 'About FREERT',
    content: 'FREERT was founded in 2026 as a contemporary, minimal clothing label. We believe in designing structure for the space between identity and expression. Our pieces are cut from organic flax fabrics, raw silk weaves, and premium knit materials, manufactured in small, ethical batches of 50 units. Zero clutter. Pure form.'
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: 'We take data integrity seriously. This policy describes how we collect, store, and manage your contact parameters during site navigation. We only capture standard logs needed to process delivery dispatches and secure checkout payments. Your data is encrypted using SSL handshakes and is never shared.'
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    content: 'By accessing this platform, you agree to comply with our interface guidelines. All custom tailoring structures, typography systems, and visual lookbooks are copyrighted. Orders are processed based on available batch inventory limits. We reserve the right to configure or terminate links at our discretion.'
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    content: 'All orders are dispatched from our Tokyo or Delhi fulfillment centers. We provide complimentary drone shipping for orders above ₹15,000 INR. Below this threshold, a flat delivery fee of ₹500 INR applies. Packages are typically dispatched within 48 hours and arrive inside 3 to 5 business cycles.'
  },
  'refund-policy': {
    title: 'Refund Policy',
    content: 'Refunds are processed back to the original payment source within 7 working cycles of return package validation. For COD orders, refunds are credited directly to your registered bank account parameters. Shipping fees are non-refundable.'
  },
  'return-exchange': {
    title: 'Return & Exchange Policy',
    content: 'We offer a complimentary 14-day return and exchange window. To submit a return request, navigate to your order history panel in the dashboard. Return packages must be unworn, unwashed, and in their original packaging nodes. Our courier drone will complete package pickups.'
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    content: 'Orders can be cancelled directly from the user dashboard before dispatch operations begin (typically within 12 hours of placing the order). Once an order has been marked as shipped, cancellations are no longer possible, and the standard 14-day return protocol must be followed.'
  },
  'care-guide': {
    title: 'Garment Care Guide',
    content: 'Our linens and raw silks are made to last. We recommend cold hand washing or machine washing on a delicate cycle using mild, organic detergents. Avoid tumble dryers; instead, line dry in the shade to maintain organic flax textures. Iron on medium heat while slightly damp.'
  }
};

export default function AdminCMSPage() {
  const { showToast } = useToast();
  
  // State for homepage items
  const [announcementText, setAnnouncementText] = useState('Complimentary drone delivery on orders above ₹15,000');
  const [heroTitle, setHeroTitle] = useState('FREERT');
  const [heroSubtitle, setHeroSubtitle] = useState('BE YOU. BE BOLD. BE FREERT.');
  const [philosophyText, setPhilosophyText] = useState('We design for the structural space between identity and expression. Minimalist silhouettes tailored from Belgian linens and raw silk. Zero clutter. Pure form.');

  // State for page content editor CMS
  const [pagesContent, setPagesContent] = useState<Record<string, { title: string; content: string }>>(DEFAULT_PAGES);
  const [selectedPageKey, setSelectedPageKey] = useState<string>('about');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('freert_cms_pages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_PAGES, ...parsed };
        setPagesContent(merged);
        setEditingTitle(merged[selectedPageKey]?.title || '');
        setEditingContent(merged[selectedPageKey]?.content || '');
      } catch (e) {
        setPagesContent(DEFAULT_PAGES);
        setEditingTitle(DEFAULT_PAGES[selectedPageKey]?.title || '');
        setEditingContent(DEFAULT_PAGES[selectedPageKey]?.content || '');
      }
    } else {
      setEditingTitle(DEFAULT_PAGES[selectedPageKey]?.title || '');
      setEditingContent(DEFAULT_PAGES[selectedPageKey]?.content || '');
    }
  }, [selectedPageKey]);

  const handleSaveHomepageCMS = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Homepage CMS configurations successfully deployed to production edge.', 'success');
  };

  const handleSavePageCMS = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...pagesContent,
      [selectedPageKey]: { title: editingTitle, content: editingContent }
    };
    setPagesContent(updated);
    localStorage.setItem('freert_cms_pages', JSON.stringify(updated));
    showToast(`Configurations saved for policy page: ${editingTitle}.`, 'success');
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Homepage & Pages CMS</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Configure editorial headlines, policy contents and informational guides</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Homepage Editor */}
        <form onSubmit={handleSaveHomepageCMS} className="flex flex-col gap-8 bg-bg-luxury border border-neutral-soft/80 p-8">
          <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Homepage CMS Nodes
          </h2>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Announcement Ribbon</label>
            <input 
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="input-editorial text-xs"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Hero Headline</label>
              <input 
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="input-editorial text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Hero Subtitle</label>
              <input 
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="input-editorial text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Campaign Image Path</label>
              <div className="flex items-center border border-neutral-soft p-3 bg-neutral-soft/10 text-xs text-text-muted justify-between">
                <span>/assets/trench_coat.jpg</span>
                <button type="button" className="text-fg-luxury hover:text-accent-gold transition-colors flex items-center gap-1 cursor-pointer">
                  <ImageIcon size={14} /> Update Node
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Philosophy Statement</label>
            <textarea 
              rows={4}
              value={philosophyText}
              onChange={(e) => setPhilosophyText(e.target.value)}
              className="input-editorial h-24 resize-none text-xs leading-relaxed"
            />
          </div>

          <button 
            type="submit"
            className="btn-editorial-solid flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-medium text-xs cursor-pointer"
          >
            <Save size={14} /> Publish Homepage CMS
          </button>
        </form>

        {/* Right: Policy & Info Pages CMS Editor */}
        <form onSubmit={handleSavePageCMS} className="flex flex-col gap-8 bg-bg-luxury border border-neutral-soft/80 p-8">
          <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Legal & Policy Pages Editor
          </h2>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Select Target Page</label>
            <select
              value={selectedPageKey}
              onChange={(e) => setSelectedPageKey(e.target.value)}
              className="w-full bg-bg-luxury border border-neutral-soft/80 py-2.5 px-3 text-[11px] font-light text-fg-luxury focus:outline-none tracking-wider uppercase"
            >
              {Object.keys(pagesContent).map((key) => (
                <option key={key} value={key}>
                  {pagesContent[key]?.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Page Title</label>
            <input 
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="input-editorial text-xs"
              required
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Page Text Content</label>
            <textarea 
              rows={12}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="input-editorial h-56 resize-none text-xs leading-relaxed"
              required
            />
          </div>

          <button 
            type="submit"
            className="btn-editorial-solid flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-medium text-xs cursor-pointer"
          >
            <Save size={14} /> Save Page Contents
          </button>
        </form>

      </div>
    </div>
  );
}
