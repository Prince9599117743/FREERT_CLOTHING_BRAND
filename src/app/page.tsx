'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fetching, setFetching] = useState<boolean>(true);

  // Simulate a luxury editorial database load
  useEffect(() => {
    const timer = setTimeout(() => {
      setFetching(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category?.slug === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      {/* Hero Visual Section */}
      <section className="relative w-full h-[65vh] bg-neutral-soft/30 overflow-hidden flex items-center justify-center">
        <img 
          src="/assets/trench_coat.jpg" 
          alt="FREERT Editorial Campaign" 
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] opacity-80"
        />
        <div className="absolute inset-0 bg-neutral-900/10" />
        <div className="relative z-10 text-center text-fg-luxury max-w-xl px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-4">Summer / Autunno 2026</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.1em] uppercase mb-4 leading-none">
            FREERT
          </h1>
          <p className="text-xs font-editorial italic text-text-muted mb-8 tracking-widest uppercase">
            BE YOU. BE BOLD. BE FREERT.
          </p>
          <button 
            onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-editorial-solid text-[10px] py-3 px-8 cursor-pointer"
          >
            Explore The Edit
          </button>
        </div>
      </section>

      {/* Brand Statement Banner */}
      <section className="py-24 text-center px-6 border-b border-neutral-soft/30 max-w-3xl mx-auto">
        <h2 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-text-muted mb-6">Philosophy</h2>
        <p className="font-editorial text-2xl md:text-3xl text-fg-luxury leading-relaxed font-light italic">
          &ldquo;We design for the structural space between identity and expression. Minimalist silhouettes tailored from Belgian linens and raw silk. Zero clutter. Pure form.&rdquo;
        </p>
      </section>

      {/* Catalog Workspace Section */}
      <section id="shop-grid" className="py-20 container-editorial">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 border-b border-neutral-soft/40 pb-6">
          {/* Header */}
          <div className="text-left">
            <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-2 font-medium">Garments Database</p>
            <h2 className="text-2xl uppercase tracking-[0.15em] font-light text-fg-luxury">Active Collections</h2>
          </div>

          {/* Filtering & Search panel */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Minimal Search box */}
            <div className="relative border-b border-neutral-soft/80 flex items-center pb-1 max-w-[200px]">
              <Search size={14} className="text-text-muted mr-2" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[11px] placeholder-neutral-400 focus:outline-none w-full text-fg-luxury font-light tracking-wider"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-4 text-[10px] uppercase tracking-widest font-light text-text-muted">
              {['all', 'outerwear', 'tops', 'bottoms', 'dresses'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`hover:text-fg-luxury transition-colors cursor-pointer ${selectedCategory === cat ? 'text-fg-luxury font-medium border-b border-fg-luxury' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid / Skeletons */}
        {fetching ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <Skeleton variant="image" />
                <Skeleton variant="text" className="w-1/2 mt-2" />
                <Skeleton variant="price" className="w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-text-muted font-light text-xs tracking-widest uppercase">
                No garments found matching query parameters
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
      </section>

      {/* Editorial lookbook strip */}
      <section className="py-12 bg-neutral-soft/10 border-t border-b border-neutral-soft/30">
        <div className="container-editorial grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="aspect-[4/3] overflow-hidden relative bg-neutral-soft/20">
            <img 
              src="/assets/linen_blazer.jpg" 
              alt="Tailoring Process" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left md:pl-8 flex flex-col gap-6 max-w-md">
            <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-semibold">Tailoring Craft</p>
            <h3 className="text-3xl font-light uppercase tracking-wide text-fg-luxury">The Tailoring Process</h3>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Each piece in our Linens Edit is cut from ethically sourced Belgian flax, woven into mid-weight fabrics and double-washed for unique organic soft textures. Tailored with care in small batches of 50 units.
            </p>
            <button className="btn-editorial self-start text-[10px] tracking-widest py-3 px-8 mt-2">Read Journal</button>
          </div>
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
