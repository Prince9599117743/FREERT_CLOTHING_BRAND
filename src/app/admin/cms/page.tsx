'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Save, ChevronUp, ChevronDown, Trash2, Plus, Eye } from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'hs-1', image: '/assets/trench_coat.jpg', heading: 'BE YOU.', subtitle: 'BE BOLD. BE FREERT.', ctaText: 'Shop Now', ctaLink: '/shop', enabled: true },
  { id: 'hs-2', image: '/assets/slip_dress.jpg', heading: 'New Season Collection', subtitle: 'Autumn / Winter Edit 2026', ctaText: 'Explore Collection', ctaLink: '/shop/new-arrivals', enabled: true },
  { id: 'hs-3', image: '/assets/kimono_shirt.jpg', heading: 'Luxury Everyday Wear', subtitle: 'Comfort Tailored in Small Batches', ctaText: 'Discover More', ctaLink: '/shop', enabled: true },
  { id: 'hs-4', image: '/assets/silk_trouser.jpg', heading: 'Timeless Streetwear', subtitle: 'Structure for Identity and Expression', ctaText: 'Shop Bottoms', ctaLink: '/shop/men/cargo-pants', enabled: true },
  { id: 'hs-5', image: '/assets/knit_hoodie.jpg', heading: 'Minimal Luxury', subtitle: 'Organic Weaves and Soft Textures', ctaText: 'Shop Knitwear', ctaLink: '/shop/men/hoodies', enabled: true },
  { id: 'hs-6', image: '/assets/cap_1784646670746.png', heading: 'Modern Identity', subtitle: 'Finishing Details for the Modern Wardrobe', ctaText: 'Shop Accessories', ctaLink: '/shop/accessories', enabled: true },
  { id: 'hs-7', image: '/assets/sneakers_1784646656235.png', heading: 'Premium Essentials', subtitle: 'Sandalwood Santal & Intense Scents', ctaText: 'Shop Perfumes', ctaLink: '/shop/perfumes', enabled: true }
];

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
  
  // State for Pages CMS
  const [pagesContent, setPagesContent] = useState<Record<string, { title: string; content: string }>>(DEFAULT_PAGES);
  const [selectedPageKey, setSelectedPageKey] = useState<string>('about');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  // State for Hero Slideshow Manager
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);

  useEffect(() => {
    // Load pages content
    const savedPages = localStorage.getItem('freert_cms_pages');
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        const merged = { ...DEFAULT_PAGES, ...parsed };
        setPagesContent(merged);
      } catch (e) {
        setPagesContent(DEFAULT_PAGES);
      }
    }

    // Load hero slides content
    const savedSlides = localStorage.getItem('freert_hero_slides');
    if (savedSlides) {
      try {
        setHeroSlides(JSON.parse(savedSlides));
      } catch (e) {
        setHeroSlides(DEFAULT_SLIDES);
      }
    }
  }, []);

  useEffect(() => {
    setEditingTitle(pagesContent[selectedPageKey]?.title || '');
    setEditingContent(pagesContent[selectedPageKey]?.content || '');
  }, [selectedPageKey, pagesContent]);

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

  // Hero Slides Operations
  const handleUpdateSlide = (id: string, field: keyof HeroSlide, value: any) => {
    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const updated = [...heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setHeroSlides(updated);
    }
  };

  const handleDeleteSlide = (id: string) => {
    setHeroSlides(prev => prev.filter(s => s.id !== id));
    showToast('Slide removed from list buffer.', 'info');
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `hs-${Math.random().toString(36).substring(2, 9)}`,
      image: '/assets/tee_white.jpg',
      heading: 'New Campaign Heading',
      subtitle: 'Premium Capsule Edit',
      ctaText: 'Shop Now',
      ctaLink: '/shop',
      enabled: true
    };
    setHeroSlides(prev => [...prev, newSlide]);
    showToast('Appended new slide template.', 'success');
  };

  const handleSaveHeroCMS = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('freert_hero_slides', JSON.stringify(heroSlides));
    showToast('Hero Slideshow configurations deployed to live site.', 'success');
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Homepage & Pages CMS</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Configure editorial slideshow banners, policy contents and informational guides</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Hero Slideshow Manager (Col span 7) */}
        <form onSubmit={handleSaveHeroCMS} className="lg:col-span-7 flex flex-col gap-8 bg-bg-luxury border border-neutral-soft/80 p-8">
          <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-3">
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury">
              Hero Banner Manager
            </h2>
            <button 
              type="button"
              onClick={handleAddSlide}
              className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-accent-gold hover:text-fg-luxury transition-colors cursor-pointer font-semibold"
            >
              <Plus size={14} /> Add Slide
            </button>
          </div>

          <div className="flex flex-col gap-8 max-h-[600px] overflow-y-auto pr-2">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="p-5 border border-neutral-soft bg-neutral-soft/5 flex flex-col gap-4 relative">
                
                {/* Actions row */}
                <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-2">
                  <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Slide 0{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1 hover:text-accent-gold text-text-muted disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === heroSlides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1 hover:text-accent-gold text-text-muted disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1 hover:text-red-700 text-text-muted cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Heading</label>
                    <input 
                      type="text" 
                      value={slide.heading}
                      onChange={(e) => handleUpdateSlide(slide.id, 'heading', e.target.value)}
                      className="input-editorial text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Subtitle</label>
                    <input 
                      type="text" 
                      value={slide.subtitle}
                      onChange={(e) => handleUpdateSlide(slide.id, 'subtitle', e.target.value)}
                      className="input-editorial text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Image URL / Path</label>
                    <input 
                      type="text" 
                      value={slide.image}
                      onChange={(e) => handleUpdateSlide(slide.id, 'image', e.target.value)}
                      className="input-editorial text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">CTA Text</label>
                      <input 
                        type="text" 
                        value={slide.ctaText}
                        onChange={(e) => handleUpdateSlide(slide.id, 'ctaText', e.target.value)}
                        className="input-editorial text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">CTA Link</label>
                      <input 
                        type="text" 
                        value={slide.ctaLink}
                        onChange={(e) => handleUpdateSlide(slide.id, 'ctaLink', e.target.value)}
                        className="input-editorial text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Enable toggle */}
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input 
                    type="checkbox"
                    checked={slide.enabled}
                    onChange={(e) => handleUpdateSlide(slide.id, 'enabled', e.target.checked)}
                    className="accent-fg-luxury"
                  />
                  <span className="text-[9px] uppercase tracking-widest text-fg-luxury">Enable Slide in rotation</span>
                </label>

              </div>
            ))}
          </div>

          <button 
            type="submit"
            className="btn-editorial-solid flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-medium text-xs cursor-pointer mt-2"
          >
            <Save size={14} /> Deploy Slideshow Configurations
          </button>
        </form>

        {/* Right: Policy & Info Pages CMS Editor (Col span 5) */}
        <form onSubmit={handleSavePageCMS} className="lg:col-span-5 flex flex-col gap-8 bg-bg-luxury border border-neutral-soft/80 p-8">
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
              rows={14}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="input-editorial h-64 resize-none text-xs leading-relaxed"
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
