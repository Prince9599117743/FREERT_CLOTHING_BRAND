'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFetching(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Filtered collections helpers
  const newArrivals = MOCK_PRODUCTS.filter(p => p.tags?.includes('new-arrivals')).slice(0, 4);
  const bestSellers = MOCK_PRODUCTS.filter(p => p.tags?.includes('best-sellers')).slice(0, 4);
  const trending = MOCK_PRODUCTS.filter(p => p.tags?.includes('trending')).slice(0, 4);
  const featured = MOCK_PRODUCTS.filter(p => p.tags?.includes('featured-collection')).slice(0, 4);
  
  // Department-specific collections
  const menCollection = MOCK_PRODUCTS.filter(p => p.parentCategory === 'men').slice(0, 4);
  const womenCollection = MOCK_PRODUCTS.filter(p => p.parentCategory === 'women').slice(0, 4);
  const accessories = MOCK_PRODUCTS.filter(p => p.parentCategory === 'accessories').slice(0, 4);
  const perfumes = MOCK_PRODUCTS.filter(p => p.parentCategory === 'perfumes').slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      {/* Campaign Hero Block */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-neutral-soft/30 overflow-hidden flex items-center justify-center">
        <img 
          src="/assets/trench_coat.jpg" 
          alt="FREERT Autumn/Winter Campaign" 
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] opacity-85"
        />
        <div className="absolute inset-0 bg-neutral-900/10" />
        <div className="relative z-10 text-center text-fg-luxury max-w-xl px-6">
          <p className="text-[9px] uppercase tracking-[0.35em] text-neutral-300 mb-4">Autumn / Winter Edit</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.1em] uppercase mb-4 leading-none text-white">
            FREERT
          </h1>
          <p className="text-[10px] font-editorial italic text-neutral-200 mb-8 tracking-widest uppercase">
            BE YOU. BE BOLD. BE FREERT.
          </p>
          <button 
            onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury transition-all text-[10px] uppercase tracking-widest py-3.5 px-10 cursor-pointer font-medium"
          >
            Explore The Edit
          </button>
        </div>
      </section>

      {/* Brand Statement Banner */}
      <section className="py-16 text-center px-6 border-b border-neutral-soft/30 max-w-3xl mx-auto">
        <h2 className="text-[9px] uppercase tracking-[0.25em] font-semibold text-text-muted mb-4">Philosophy</h2>
        <p className="font-editorial text-2xl md:text-3xl text-fg-luxury leading-relaxed font-light italic">
          &ldquo;We design for the structural space between identity and expression. Minimalist silhouettes tailored from organic linen, raw silk, and premium knits. Zero clutter. Pure form.&rdquo;
        </p>
      </section>

      {/* 1. New Arrivals */}
      <section id="new-arrivals" className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">New Drops</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">New Arrivals</h2>
          </div>
          <button onClick={() => router.push('/shop/new-arrivals')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 2. Best Sellers */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Curated Staples</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Best Sellers</h2>
          </div>
          <button onClick={() => router.push('/shop')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 3. Men's Collection */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Tailored for Him</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Men's Collection</h2>
          </div>
          <button onClick={() => router.push('/shop/men')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {menCollection.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 4. Women's Collection */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Tailored for Her</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Women's Collection</h2>
          </div>
          <button onClick={() => router.push('/shop/women')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {womenCollection.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 5. Accessories */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Finishing Details</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Accessories</h2>
          </div>
          <button onClick={() => router.push('/shop/accessories')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {accessories.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 6. Perfumes */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Aromatic Notes</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Perfumes</h2>
          </div>
          <button onClick={() => router.push('/shop/perfumes')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perfumes.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 7. Trending Products */}
      <section className="py-12 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">High Demand</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Trending Products</h2>
          </div>
          <button onClick={() => router.push('/shop')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* 8. Featured Products */}
      <section className="py-12 container-editorial text-left">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Spotlight</p>
            <h2 className="text-lg md:text-xl uppercase tracking-widest font-light text-fg-luxury">Featured Products</h2>
          </div>
          <button onClick={() => router.push('/shop')} className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Lookbook section */}
      <section className="py-16 bg-neutral-soft/10 border-t border-b border-neutral-soft/30">
        <div className="container-editorial grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="aspect-[4/3] overflow-hidden relative bg-neutral-soft/20">
            <img 
              src="/assets/linen_blazer.jpg" 
              alt="Tailoring craftsmanship" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left md:pl-8 flex flex-col gap-6 max-w-md">
            <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-semibold">The Journal</p>
            <h3 className="text-3xl font-light uppercase tracking-wide text-fg-luxury">Organic Weaving</h3>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Each piece in our collections is crafted from organic flax fibers, woven in small batches of 50 units, and pre-washed to ensure maximum drape and softness.
            </p>
            <button onClick={() => router.push('/shop')} className="btn-editorial-solid self-start text-[10px] tracking-widest py-3 px-8 mt-2 cursor-pointer font-medium">
              Shop The Edit
            </button>
          </div>
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
