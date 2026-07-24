'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, getHomepageSections, getEditorialJournal, subscribeNewsletter } from '@/services/database';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  bannerImage?: string;
  ctaText: string;
  ctaLink: string;
  visible: boolean;
  order: number;
  featuredProductIds: string[];
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  imageClickRedirect?: boolean;
  mediaType?: string;
  videoUrl?: string;
  posterUrl?: string;
  focalPoint?: string;
}

interface EditorialItem {
  id: string;
  imageUrl: string;
  linkUrl: string;
  order?: number;
}

const DEFAULT_EDITORIAL: EditorialItem[] = [
  { id: 'ed-1', imageUrl: '/assets/tee_white.jpg', linkUrl: '/shop' },
  { id: 'ed-2', imageUrl: '/assets/trench_coat.jpg', linkUrl: '/shop' },
  { id: 'ed-3', imageUrl: '/assets/silk_trouser.jpg', linkUrl: '/shop' },
  { id: 'ed-4', imageUrl: '/assets/slip_dress.jpg', linkUrl: '/shop' }
];

const DEFAULT_SECTIONS: HomepageSection[] = [
  {
    id: 'new-drop',
    title: 'NEW DROP',
    subtitle: 'Seasonal Highlight',
    bannerImage: '/assets/trench_coat.jpg',
    ctaText: 'Explore Collection',
    ctaLink: '/shop/new-arrivals',
    visible: true,
    order: 0,
    featuredProductIds: []
  },
  {
    id: 'men',
    title: "Men's Silhouette",
    subtitle: 'Tailored for Him',
    bannerImage: '/assets/trench_coat.jpg',
    ctaText: 'Shop Men',
    ctaLink: '/shop/men',
    visible: true,
    order: 1,
    featuredProductIds: ['prod-1', 'prod-2']
  },
  {
    id: 'women',
    title: "Women's Silhouette",
    subtitle: 'Tailored for Her',
    bannerImage: '/assets/slip_dress.jpg',
    ctaText: 'Shop Women',
    ctaLink: '/shop/women',
    visible: true,
    order: 2,
    featuredProductIds: ['prod-23', 'prod-24']
  },
  {
    id: 'accessories',
    title: 'Accessories Edit',
    subtitle: 'Finishing Details',
    bannerImage: '/assets/cap_1784646670746.png',
    ctaText: 'Shop Accessories',
    ctaLink: '/shop/accessories',
    visible: true,
    order: 3,
    featuredProductIds: ['prod-43', 'prod-44']
  },
  {
    id: 'perfumes',
    title: 'Luxury Scent',
    subtitle: 'Aromatic Notes',
    bannerImage: '/assets/sneakers_1784646656235.png',
    ctaText: 'Shop Perfumes',
    ctaLink: '/shop/perfumes',
    visible: true,
    order: 4,
    featuredProductIds: ['prod-59', 'prod-60']
  },
  {
    id: 'trending',
    title: 'Trending Now',
    subtitle: 'High Demand',
    ctaText: 'View All',
    ctaLink: '/shop',
    visible: true,
    order: 5,
    featuredProductIds: ['prod-3', 'prod-4', 'prod-5', 'prod-6']
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    subtitle: 'Timeless Designs',
    ctaText: 'View All',
    ctaLink: '/shop',
    visible: true,
    order: 6,
    featuredProductIds: ['prod-7', 'prod-8', 'prod-9', 'prod-10']
  }
];

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fetching, setFetching] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState('');
  
  // Dynamic layout sections
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [editorialJournal, setEditorialJournal] = useState<EditorialItem[]>(DEFAULT_EDITORIAL);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productList, cmsSections, lookbookItems] = await Promise.all([
          getProducts(),
          getHomepageSections(),
          getEditorialJournal()
        ]);
        setAllProducts(productList);
        if (cmsSections && cmsSections.length > 0) {
          const mapped = cmsSections.map((s: any) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            bannerImage: s.banner_image || s.bannerImage,
            ctaText: s.cta_text || s.ctaText,
            ctaLink: s.cta_link || s.ctaLink,
            visible: s.visible,
            order: s.order,
            featuredProductIds: s.featured_product_ids || s.featuredProductIds || [],
            showTitle: s.show_title ?? s.showTitle ?? true,
            showSubtitle: s.show_subtitle ?? s.showSubtitle ?? true,
            showButton: s.show_button ?? s.showButton ?? true,
            imageClickRedirect: s.image_click_redirect ?? s.imageClickRedirect ?? true,
            mediaType: s.media_type || s.mediaType || 'image',
            videoUrl: s.video_url || s.videoUrl || '',
            posterUrl: s.poster_url || s.posterUrl || '',
            focalPoint: s.focal_point || s.focalPoint || 'center',
          }));
          setSections(mapped);
        }
        if (lookbookItems && lookbookItems.length > 0) {
          const mappedLookbook = lookbookItems.map((item: any) => ({
            id: item.id,
            imageUrl: item.image_url,
            linkUrl: item.link_url,
            order: item.order
          }));
          setEditorialJournal(mappedLookbook);
        }
      } catch (e: any) {
        setDbError(true);
      }
      setFetching(false);
    };
    loadData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    try {
      await subscribeNewsletter(emailInput);
      showToast('Thank you for subscribing to our newsletter!', 'success');
      setEmailInput('');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('unique') || msg.includes('duplicate')) {
        showToast('You are already subscribed to our newsletter!', 'info');
      } else {
        showToast('Thank you for subscribing to our newsletter!', 'success');
      }
      setEmailInput('');
    }
  };

  // Helper to query featured products matching list IDs
  const getSectionProducts = (sec: HomepageSection, fallbackCat: string, maxCount: number): Product[] => {
    const matched = allProducts.filter(p => sec.featuredProductIds.includes(p.id));
    if (matched.length > 0) {
      return matched.slice(0, maxCount);
    }
    // Fallback if none selected or found
    return allProducts.filter(p => p.parentCategory === fallbackCat || p.tags?.includes(fallbackCat)).slice(0, maxCount);
  };

  // Sort and filter active sections list
  const activeSections = sections
    .filter(s => s.visible && s.id !== 'hero')
    .sort((a, b) => a.order - b.order);

  if (dbError) {
    return (
      <div style={{ background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, padding: 20, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontSize: 16 }}>System Maintenance</h2>
        <p style={{ color: '#888', fontSize: 12, maxWidth: 320, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We are currently carrying out system updates. Services will resume shortly.</p>
        <div style={{ width: 20, height: 20, border: '1px solid #333', borderTop: '1px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury font-sans selection:bg-accent-gold selection:text-bg-luxury text-fg-luxury">
      <Navbar />

      <HeroSlideshow />

      {/* Dynamic Loops CMS Banners and Grids */}
      {activeSections.map((sec) => {
        // 1. BRAND STORY BLOCK
        if (sec.id === 'brand-story') {
          if (!sec.showTitle && !sec.showSubtitle && !sec.showButton) return null;
          return (
            <section key={sec.id} className="py-16 md:py-32 text-center px-6 border-b border-neutral-soft/30 max-w-4xl mx-auto flex flex-col items-center">
              {sec.showSubtitle && sec.subtitle && (
                <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-6">{sec.subtitle}</p>
              )}
              {sec.showTitle && sec.title && (
                <h3 className="font-editorial text-3xl md:text-4xl text-fg-luxury leading-relaxed font-light italic max-w-3xl mb-8">
                  &ldquo;{sec.title}&rdquo;
                </h3>
              )}
              {sec.showButton && sec.ctaText && (
                <button 
                  onClick={() => router.push(sec.ctaLink)} 
                  className="btn-editorial py-2 px-6 uppercase tracking-widest text-[9px] cursor-pointer"
                >
                  {sec.ctaText}
                </button>
              )}
            </section>
          );
        }

        // 2. LOOKBOOK EDITORIAL JOURNAL
        if (sec.id === 'editorial-journal') {
          return (
            <section key={sec.id} className="py-10 md:py-20 border-b border-neutral-soft/30 container-editorial">
              {(sec.showSubtitle || sec.showTitle) && (
                <div className="mb-10 text-left">
                  {sec.showSubtitle && sec.subtitle && (
                    <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">{sec.subtitle}</p>
                  )}
                  {sec.showTitle && sec.title && (
                    <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury">{sec.title}</h2>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {editorialJournal.map((item) => {
                  const isVid = item.imageUrl.toLowerCase().endsWith('.mp4') || 
                                item.imageUrl.toLowerCase().endsWith('.webm') || 
                                item.imageUrl.toLowerCase().endsWith('.mov') ||
                                item.imageUrl.includes('video');
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => router.push(item.linkUrl || '/shop')}
                      className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-soft/20 cursor-pointer hover:opacity-90 transition-opacity duration-300"
                    >
                      {isVid ? (
                        <video 
                          src={item.imageUrl} 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <img src={item.imageUrl} alt="Editorial look" className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        // 3. NEWSLETTER DISPATCH
        if (sec.id === 'newsletter') {
          if (!sec.showTitle && !sec.showSubtitle && !sec.showButton) return null;
          return (
            <section key={sec.id} className="py-12 md:py-24 container-editorial text-center flex flex-col items-center">
              <div className="max-w-md w-full flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  {sec.showSubtitle && sec.subtitle && (
                    <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted">{sec.subtitle}</p>
                  )}
                  {sec.showTitle && sec.title && (
                    <h3 className="text-xl uppercase tracking-widest font-light text-fg-luxury">{sec.title}</h3>
                  )}
                </div>
                {sec.showSubtitle && (
                  <p className="text-[11px] text-text-muted font-light leading-relaxed">
                    Subscribe to receive priority notifications for new seasonal drops, limited runs, and editorial lookbooks.
                  </p>
                )}
                {sec.showButton && (
                  <form onSubmit={handleSubscribe} className="flex gap-4 border-b border-neutral-soft/80 pb-2 mt-4">
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ENTER EMAIL ADDRESS" 
                      className="bg-transparent text-[11px] font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury uppercase tracking-wider"
                    />
                    <button type="submit" className="hover:text-accent-gold transition-colors duration-300 cursor-pointer" aria-label="Submit email to newsletter">
                      <ArrowRight size={16} strokeWidth={1.5} />
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        }

        // 4. Skip trending/best-sellers filters if they have duplicate displays
        if (sec.id === 'trending' || sec.id === 'best-sellers') {
          return null;
        }

        // 5. RENDER MEDIA BANNER (Image or Video)
        const hasMedia = sec.bannerImage || sec.videoUrl;
        if (hasMedia) {
          const isVideo = sec.mediaType === 'video' || (sec.bannerImage && (
            sec.bannerImage.toLowerCase().endsWith('.mp4') || 
            sec.bannerImage.toLowerCase().endsWith('.webm') ||
            sec.bannerImage.toLowerCase().endsWith('.mov') ||
            sec.bannerImage.includes('video')
          ));
          const mediaSrc = isVideo ? (sec.videoUrl || sec.bannerImage) : sec.bannerImage;
          const sectionProds = getSectionProducts(sec, sec.id, 4);

          return (
            <section key={sec.id} className="py-8 md:py-16 border-b border-neutral-soft/30 container-editorial">
              <div 
                className={`relative w-full aspect-[4/3] md:aspect-[16/7] overflow-hidden group ${sec.imageClickRedirect ? 'cursor-pointer' : ''}`}
                onClick={sec.imageClickRedirect ? () => router.push(sec.ctaLink) : undefined}
              >
                {isVideo ? (
                  <video 
                    src={mediaSrc}
                    poster={sec.posterUrl} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    style={{ objectPosition: sec.focalPoint || 'center' }}
                  />
                ) : (
                  <img 
                    src={mediaSrc} 
                    alt={sec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                    style={{ objectPosition: sec.focalPoint || 'center' }}
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                
                {/* Content Overlay Box */}
                {(sec.showTitle || sec.showSubtitle || sec.showButton) && (
                  <div className="absolute bottom-10 left-10 text-left z-10">
                    {sec.showSubtitle && sec.subtitle && (
                      <p className="text-[8px] uppercase tracking-[0.3em] text-white/80 mb-2 font-semibold">
                        {sec.subtitle}
                      </p>
                    )}
                    {sec.showTitle && sec.title && (
                      <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">
                        {sec.title}
                      </h3>
                    )}
                    {sec.showButton && sec.ctaText && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(sec.ctaLink);
                        }}
                        className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8 cursor-pointer"
                      >
                        {sec.ctaText}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Product Grid */}
              {sectionProds.length > 0 && (
                <div className="mt-12 animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex justify-between items-baseline mb-6">
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury">Featured Capsule Articles</h4>
                    <Link href={sec.ctaLink} className="text-[9px] uppercase tracking-widest text-text-muted hover:text-accent-gold transition-colors font-medium border-b border-neutral-soft/30 hover:border-accent-gold pb-0.5">
                      Explore All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {sectionProds.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        }

        // 6. RENDER TEXT BANNER (No media fallback)
        if (!sec.showTitle && !sec.showSubtitle && !sec.showButton) return null;
        return (
          <section key={sec.id} className="py-12 md:py-24 border-b border-neutral-soft/30 bg-neutral-soft/5">
            <div className="container-editorial flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
              <div className="max-w-xl">
                {sec.showSubtitle && sec.subtitle && (
                  <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">{sec.subtitle}</p>
                )}
                {sec.showTitle && sec.title && (
                  <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-fg-luxury mb-4">
                    {sec.title}
                  </h2>
                )}
              </div>
              {sec.showButton && sec.ctaText && (
                <div>
                  <button 
                    onClick={() => router.push(sec.ctaLink)}
                    className="btn-editorial-solid text-[10px] tracking-[0.25em] py-4 px-10 cursor-pointer whitespace-nowrap"
                  >
                    {sec.ctaText}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      <CartDrawer />
      <Footer />
    </div>
  );
}
