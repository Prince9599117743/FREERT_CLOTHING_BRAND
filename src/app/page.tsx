'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [fetching, setFetching] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFetching(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Filtered collections helpers
  const newArrivals = MOCK_PRODUCTS.filter(p => p.tags?.includes('new-arrivals')).slice(0, 4);
  const bestSellers = MOCK_PRODUCTS.filter(p => p.tags?.includes('best-sellers')).slice(0, 4);
  const trending = MOCK_PRODUCTS.filter(p => p.tags?.includes('trending')).slice(0, 4);
  const featured = MOCK_PRODUCTS.filter(p => p.tags?.includes('featured-collection')).slice(0, 4);
  
  // Search products
  const searchedProducts = MOCK_PRODUCTS.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const shopCategories = [
    { name: 'Men', image: '/assets/trench_coat.jpg', href: '/shop/men' },
    { name: 'Women', image: '/assets/slip_dress.jpg', href: '/shop/women' },
    { name: 'Accessories', image: '/assets/cap_1784646670746.png', href: '/shop/accessories' },
    { name: 'Perfumes', image: '/assets/sneakers_1784646656235.png', href: '/shop/perfumes' }
  ];

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
      <section className="py-20 text-center px-6 border-b border-neutral-soft/30 max-w-3xl mx-auto">
        <h2 className="text-[9px] uppercase tracking-[0.25em] font-semibold text-text-muted mb-4">Philosophy</h2>
        <p className="font-editorial text-2xl md:text-3xl text-fg-luxury leading-relaxed font-light italic">
          &ldquo;We design for the structural space between identity and expression. Minimalist silhouettes tailored from organic linen, raw silk, and premium knits. Zero clutter. Pure form.&rdquo;
        </p>
      </section>

      {/* 1. New Arrivals */}
      <section id="new-arrivals" className="py-16 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">New Drops</p>
            <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">New Arrivals</h2>
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
      <section className="py-16 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Curated Staples</p>
            <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">Best Sellers</h2>
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

      {/* 3. Shop by Category */}
      <section className="py-16 container-editorial text-left border-b border-neutral-soft/30">
        <div className="mb-10">
          <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Departments</p>
          <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">Shop By Category</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {shopCategories.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => router.push(cat.href)}
              className="relative aspect-[3/4] overflow-hidden group cursor-pointer bg-neutral-soft/20"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-fg-luxury/10 group-hover:bg-fg-luxury/30 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 text-left z-10">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                  {cat.name}
                </h3>
                <span className="text-[9px] uppercase tracking-widest text-neutral-300 font-light group-hover:text-accent-gold transition-colors duration-300 flex items-center gap-1 mt-1">
                  Browse Edit <ChevronRight size={10} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Trending Now */}
      <section className="py-16 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">In High Demand</p>
            <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">Trending Now</h2>
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

      {/* 5. Featured Collection */}
      <section className="py-16 container-editorial text-left border-b border-neutral-soft/30">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Seasonal Edit</p>
            <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">Featured Collection</h2>
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

      {/* 6. General Catalog & Search */}
      <section className="py-16 container-editorial text-left">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 border-b border-neutral-soft/40 pb-6">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-text-muted mb-1">Full Inventory</p>
            <h2 className="text-xl md:text-2xl uppercase tracking-widest font-light text-fg-luxury">Recently Added</h2>
          </div>

          {/* Search tool */}
          <div className="relative border-b border-neutral-soft/80 flex items-center pb-1.5 max-w-[220px]">
            <Search size={14} className="text-text-muted mr-2" />
            <input 
              type="text" 
              placeholder="Search garments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] placeholder-neutral-400 focus:outline-none w-full text-fg-luxury font-light tracking-wider uppercase"
            />
          </div>
        </div>

        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map(idx => <Skeleton key={idx} variant="image" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {searchedProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-text-muted font-light text-[10px] tracking-widest uppercase">
                No items match your search
              </div>
            ) : (
              searchedProducts.map(p => <ProductCard key={p.id} product={p} />)
            )}
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
              Each piece in our collections is crafted from organic flax fibers, woven in small batches of 50 units, and pre-washed to ensure maximum drape and softness. Designed for expression.
            </p>
            <button onClick={() => router.push('/shop')} className="btn-editorial-solid self-start text-[10px] tracking-widest py-3 px-8 mt-2 cursor-pointer">
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
