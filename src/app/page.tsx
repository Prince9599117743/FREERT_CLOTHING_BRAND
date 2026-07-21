'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fetching, setFetching] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFetching(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter collections strictly according to limits
  const newDrop = MOCK_PRODUCTS.filter(p => p.tags?.includes('new-arrivals')).slice(0, 1)[0];
  const menProducts = MOCK_PRODUCTS.filter(p => p.parentCategory === 'men').slice(0, 2);
  const womenProducts = MOCK_PRODUCTS.filter(p => p.parentCategory === 'women').slice(0, 2);
  const accessoriesProducts = MOCK_PRODUCTS.filter(p => p.parentCategory === 'accessories').slice(0, 2);
  const perfumesProducts = MOCK_PRODUCTS.filter(p => p.parentCategory === 'perfumes').slice(0, 2);
  const trendingProducts = MOCK_PRODUCTS.filter(p => p.tags?.includes('trending')).slice(0, 4);
  const bestSellersProducts = MOCK_PRODUCTS.filter(p => p.tags?.includes('best-sellers')).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    showToast('Joined the FREERT Dispatch database.', 'success');
    setEmailInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury font-sans selection:bg-accent-gold selection:text-bg-luxury text-fg-luxury">
      <Navbar />

      <HeroSlideshow />

      {/* 2. NEW DROP Banner */}
      <section className="py-24 border-b border-neutral-soft/30 bg-neutral-soft/5">
        <div className="container-editorial flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
          <div className="max-w-xl">
            <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">Seasonal Highlight</p>
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-fg-luxury mb-4">
              NEW DROP
            </h2>
            <p className="text-xs text-text-muted font-light leading-relaxed">
              Explore our latest drop of organic raw linen kimonos and boxy cotton staples. Structured for flow, detailed with clean pocketing, tailored in small batches.
            </p>
          </div>
          <div>
            <button 
              onClick={() => router.push('/shop/new-arrivals')}
              className="btn-editorial-solid text-[10px] tracking-[0.25em] py-4 px-10 cursor-pointer whitespace-nowrap"
            >
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* 3. MEN COLLECTION Asymmetric Section */}
      <section className="py-20 border-b border-neutral-soft/30 container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Campaign Block */}
          <div className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push('/shop/men')}>
            <img 
              src="/assets/trench_coat.jpg" 
              alt="Men's Campaign" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
            <div className="absolute bottom-10 left-10 text-left z-10">
              <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">Men's Silhouette</h3>
              <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                Shop Men
              </button>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">Featured Articles</p>
            {fetching ? (
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {menProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. WOMEN COLLECTION Asymmetric Section */}
      <section className="py-20 border-b border-neutral-soft/30 container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Product Grid */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">Featured Articles</p>
            {fetching ? (
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {womenProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>

          {/* Right Campaign Block */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push('/shop/women')}>
            <img 
              src="/assets/slip_dress.jpg" 
              alt="Women's Campaign" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
            <div className="absolute bottom-10 left-10 text-left z-10">
              <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">Women's Silhouette</h3>
              <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                Shop Women
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACCESSORIES Asymmetric Section */}
      <section className="py-20 border-b border-neutral-soft/30 container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Campaign Block */}
          <div className="lg:col-span-7 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push('/shop/accessories')}>
            <img 
              src="/assets/cap_1784646670746.png" 
              alt="Accessories Campaign" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
            <div className="absolute bottom-10 left-10 text-left z-10">
              <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">Accessories Edit</h3>
              <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                Shop Accessories
              </button>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">Featured Articles</p>
            {fetching ? (
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {accessoriesProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. PERFUMES Asymmetric Section */}
      <section className="py-20 border-b border-neutral-soft/30 container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Product Grid */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6">
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted text-left font-semibold">Featured Articles</p>
            {fetching ? (
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map(idx => <Skeleton key={idx} variant="image" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {perfumesProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>

          {/* Right Campaign Block */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group cursor-pointer" onClick={() => router.push('/shop/perfumes')}>
            <img 
              src="/assets/sneakers_1784646656235.png" 
              alt="Perfumes Campaign" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-500" />
            <div className="absolute bottom-10 left-10 text-left z-10">
              <h3 className="text-2xl font-light uppercase tracking-widest text-white mb-4">Luxury Scent</h3>
              <button className="bg-white/95 text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[9px] uppercase tracking-widest font-semibold py-3 px-8">
                Shop Perfumes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRENDING NOW (Max 4 products) */}
      <section className="py-24 border-b border-neutral-soft/30 container-editorial text-center flex flex-col items-center">
        <div className="mb-12">
          <p className="text-[9px] uppercase tracking-[0.35em] text-text-muted mb-2">High Demand</p>
          <h2 className="text-2xl font-light uppercase tracking-widest text-fg-luxury">Trending Now</h2>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {trendingProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <button 
          onClick={() => router.push('/shop')}
          className="btn-editorial text-[9.5px] tracking-[0.25em] font-semibold py-3.5 px-10 cursor-pointer"
        >
          View All
        </button>
      </section>

      {/* 8. BEST SELLERS (Max 4 products) */}
      <section className="py-24 border-b border-neutral-soft/30 container-editorial text-center flex flex-col items-center">
        <div className="mb-12">
          <p className="text-[9px] uppercase tracking-[0.35em] text-text-muted mb-2">Timeless Designs</p>
          <h2 className="text-2xl font-light uppercase tracking-widest text-fg-luxury">Best Sellers</h2>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {bestSellersProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <button 
          onClick={() => router.push('/shop')}
          className="btn-editorial text-[9.5px] tracking-[0.25em] font-semibold py-3.5 px-10 cursor-pointer"
        >
          View All
        </button>
      </section>

      {/* 9. BRAND STORY */}
      <section className="py-32 text-center px-6 border-b border-neutral-soft/30 max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-6">Our DNA</p>
        <h3 className="font-editorial text-3xl md:text-4xl text-fg-luxury leading-relaxed font-light italic max-w-3xl mb-8">
          &ldquo;We tailor structure for the spaces between expression and identity. Zero clutter. Pure form.&rdquo;
        </h3>
        <p className="text-xs text-text-muted font-light leading-relaxed max-w-lg">
          FREERT was founded in 2026. Every item is cut from organic linen or raw mulberry silk, wash-treated to establish soft, natural drape, and finished with horn buttons. We produce in small runs of 50 units.
        </p>
      </section>

      {/* 10. INSTAGRAM / LOOKBOOK */}
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

      {/* 11. NEWSLETTER */}
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
