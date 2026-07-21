'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/services/database';
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
}

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load Homepage configuration from localStorage if customized
    const saved = localStorage.getItem('freert_homepage_cms_layout');
    if (saved) {
      try {
        setSections(JSON.parse(saved));
      } catch (e) {
        setSections(DEFAULT_SECTIONS);
      }
    }

    const loadData = async () => {
      try {
        const list = await getProducts();
        setAllProducts(list);
      } catch (e) {}
      setFetching(false);
    };
    loadData();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    showToast('Joined the FREERT Dispatch database.', 'success');
    setEmailInput('');
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
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury font-sans selection:bg-accent-gold selection:text-bg-luxury text-fg-luxury">
      <Navbar />

      <HeroSlideshow />

      {/* Dynamic Loops CMS Banners and Grids */}
      {activeSections.map((sec) => {
        // Render New Drop Block
        if (sec.id === 'new-drop') {
          return (
            <section key={sec.id} className="py-24 border-b border-neutral-soft/30 bg-neutral-soft/5">
              <div className="container-editorial flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
                <div className="max-w-xl">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">{sec.subtitle}</p>
                  <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-fg-luxury mb-4">
                    {sec.title}
                  </h2>
                  <p className="text-xs text-text-muted font-light leading-relaxed">
                    Explore our latest drop of organic raw linen kimonos and boxy cotton staples. Structured for flow, detailed with clean pocketing, tailored in small batches.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => router.push(sec.ctaLink)}
                    className="btn-editorial-solid text-[10px] tracking-[0.25em] py-4 px-10 cursor-pointer whitespace-nowrap"
                  >
                    {sec.ctaText}
                  </button>
                </div>
              </div>
            </section>
          );
        }

        // Render Men Asymmetrical Block
        if (sec.id === 'men') {
          const prods = getSectionProducts(sec, 'men', 2);
          return (
            <section key={sec.id} className="py-20 border-b border-neutral-soft/30 container-editorial">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push(sec.ctaLink)}>
                  <img 
                    src={sec.bannerImage || '/assets/trench_coat.jpg'} 
                    alt={sec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                  <div className="absolute bottom-10 left-10 text-left z-10">
                    <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">{sec.title}</h3>
                    <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                      {sec.ctaText}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">{sec.subtitle}</p>
                  {fetching ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {prods.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Render Women Asymmetrical Block
        if (sec.id === 'women') {
          const prods = getSectionProducts(sec, 'women', 2);
          return (
            <section key={sec.id} className="py-20 border-b border-neutral-soft/30 container-editorial">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">{sec.subtitle}</p>
                  {fetching ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {prods.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push(sec.ctaLink)}>
                  <img 
                    src={sec.bannerImage || '/assets/slip_dress.jpg'} 
                    alt={sec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                  <div className="absolute bottom-10 left-10 text-left z-10">
                    <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">{sec.title}</h3>
                    <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                      {sec.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Render Accessories Asymmetrical Block
        if (sec.id === 'accessories') {
          const prods = getSectionProducts(sec, 'accessories', 2);
          return (
            <section key={sec.id} className="py-20 border-b border-neutral-soft/30 container-editorial">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push(sec.ctaLink)}>
                  <img 
                    src={sec.bannerImage || '/assets/cap_1784646670746.png'} 
                    alt={sec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                  <div className="absolute bottom-10 left-10 text-left z-10">
                    <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">{sec.title}</h3>
                    <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                      {sec.ctaText}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-6">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">{sec.subtitle}</p>
                  {fetching ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {prods.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }

        // Render Perfumes Asymmetrical Block
        if (sec.id === 'perfumes') {
          const prods = getSectionProducts(sec, 'perfumes', 2);
          return (
            <section key={sec.id} className="py-20 border-b border-neutral-soft/30 container-editorial">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">{sec.subtitle}</p>
                  {fetching ? (
                    <div className="grid grid-cols-2 gap-6">
                      {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {prods.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push(sec.ctaLink)}>
                  <img 
                    src={sec.bannerImage || '/assets/sneakers_1784646656235.png'} 
                    alt={sec.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
                  <div className="absolute bottom-10 left-10 text-left z-10">
                    <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">{sec.title}</h3>
                    <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                      {sec.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Render Trending Centered Grid
        if (sec.id === 'trending') {
          const prods = getSectionProducts(sec, 'trending', 4);
          return (
            <section key={sec.id} className="py-24 border-b border-neutral-soft/30 container-editorial text-center flex flex-col items-center">
              <div className="mb-12">
                <p className="text-[9px] uppercase tracking-[0.35em] text-text-muted mb-2">{sec.subtitle}</p>
                <h2 className="text-2xl font-light uppercase tracking-widest text-fg-luxury">{sec.title}</h2>
              </div>

              {fetching ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                  {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                  {prods.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}

              <button 
                onClick={() => router.push(sec.ctaLink)}
                className="btn-editorial text-[9.5px] tracking-[0.25em] font-semibold py-3.5 px-10 cursor-pointer"
              >
                {sec.ctaText}
              </button>
            </section>
          );
        }

        // Render Best Sellers Centered Grid
        if (sec.id === 'best-sellers') {
          const prods = getSectionProducts(sec, 'best-sellers', 4);
          return (
            <section key={sec.id} className="py-24 border-b border-neutral-soft/30 container-editorial text-center flex flex-col items-center">
              <div className="mb-12">
                <p className="text-[9px] uppercase tracking-[0.35em] text-text-muted mb-2">{sec.subtitle}</p>
                <h2 className="text-2xl font-light uppercase tracking-widest text-fg-luxury">{sec.title}</h2>
              </div>

              {fetching ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                  {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                  {prods.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}

              <button 
                onClick={() => router.push(sec.ctaLink)}
                className="btn-editorial text-[9.5px] tracking-[0.25em] font-semibold py-3.5 px-10 cursor-pointer"
              >
                {sec.ctaText}
              </button>
            </section>
          );
        }

        return null;
      })}

      {/* Brand story details (Not layout block) */}
      <section className="py-32 text-center px-6 border-b border-neutral-soft/30 max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-6">Our DNA</p>
        <h3 className="font-editorial text-3xl md:text-4xl text-fg-luxury leading-relaxed font-light italic max-w-3xl mb-8">
          &ldquo;We tailor structure for the spaces between expression and identity. Zero clutter. Pure form.&rdquo;
        </h3>
        <p className="text-xs text-text-muted font-light leading-relaxed max-w-lg">
          FREERT was founded in 2026. Every item is cut from organic linen or raw mulberry silk, wash-treated to establish soft, natural drape, and finished with horn buttons. We produce in small runs of 50 units.
        </p>
      </section>

      {/* Lookbook gallery */}
      <section className="py-20 border-b border-neutral-soft/30 container-editorial">
        <div className="mb-10 text-left">
          <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Lookbook gallery</p>
          <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury">Editorial Journal</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-[3/4] overflow-hidden bg-neutral-soft/20">
            <img src="/assets/tee_white.jpg" alt="Staples" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[3/4] overflow-hidden bg-neutral-soft/20">
            <img src="/assets/trench_coat.jpg" alt="Tailoring details" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[3/4] overflow-hidden bg-neutral-soft/20">
            <img src="/assets/silk_trouser.jpg" alt="Drape profile" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[3/4] overflow-hidden bg-neutral-soft/20">
            <img src="/assets/slip_dress.jpg" alt="Mulberry silk dress" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 container-editorial text-center flex flex-col items-center">
        <div className="max-w-md w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted">Stay Connected</p>
            <h3 className="text-xl uppercase tracking-widest font-light text-fg-luxury">The FREERT Dispatch</h3>
          </div>
          <p className="text-[11px] text-text-muted font-light leading-relaxed">
            Subscribe to receive priority notifications for new seasonal drops, limited runs, and editorial lookbooks.
          </p>
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
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
