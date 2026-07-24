'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProducts, getCategories } from '@/services/database';
import type { Product, Category } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  
  // Resolve slug parameter array
  const slug = params.slug as string[] | undefined;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(20000);
  const [dbError, setDbError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Category variables derived from slug parameters
  const [activeParent, setActiveParent] = useState(slug?.[0] || '');
  const [activeSub, setActiveSub] = useState(slug?.[1] || '');

  useEffect(() => {
    setActiveParent(slug?.[0] || '');
    setActiveSub(slug?.[1] || '');
  }, [slug]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [list, cats] = await Promise.all([getProducts(), getCategories()]);
        setAllProducts(list);
        setDbCategories(cats);
        setFilteredProducts(list);
      } catch (e: any) {
        setDbError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let list = [...allProducts];

    // Filter by main category or tags
    if (activeParent) {
      const decodedParent = decodeURIComponent(activeParent).toLowerCase();
      if (['men', 'women', 'accessories', 'perfumes'].includes(decodedParent)) {
        list = list.filter(p => p.parentCategory === decodedParent);
      } else if (decodedParent === 'new-arrivals') {
        list = list.filter(p => p.tags?.includes('new-arrivals'));
      } else if (decodedParent === 'sale') {
        list = list.filter(p => p.tags?.includes('sale'));
      }
    }

    // Filter by sub-category
    if (activeSub) {
      const decodedSub = decodeURIComponent(activeSub).toLowerCase();
      list = list.filter(p => 
        p.subCategory === decodedSub || 
        p.subCategory?.toLowerCase().replace(/\s+/g, '-') === decodedSub
      );
    }

    // Filter by price range
    list = list.filter(p => p.basePrice <= priceRange);

    // Apply sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(list);
  }, [allProducts, activeParent, activeSub, sortBy, priceRange]);

  const getPageTitle = () => {
    if (!activeParent) return 'Shop Catalog';
    const main = activeParent.charAt(0).toUpperCase() + activeParent.slice(1);
    if (!activeSub) return main;
    const sub = activeSub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${main} / ${sub}`;
  };

  const getSubcategories = (): { name: string; slug: string }[] => {
    if (!activeParent) return [];
    const parent = activeParent.toLowerCase();
    const filtered = dbCategories.filter(c => c.parentCategory === parent);
    if (dbCategories.length > 0) {
      return filtered.map(c => ({ name: c.name, slug: c.slug }));
    }
    
    // Fallback static arrays only if database categories are completely unpopulated
    let fallbackNames: string[] = [];
    if (parent === 'men') {
      fallbackNames = ['Oversized T-Shirts', 'Regular T-Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jeans', 'Cargo Pants', 'Joggers', 'Shorts', 'Jackets'];
    } else if (parent === 'women') {
      fallbackNames = ['T-Shirts', 'Oversized', 'Tops', 'Hoodies', 'Jeans', 'Dresses', 'Co-ords'];
    } else if (parent === 'accessories') {
      fallbackNames = ['Caps', 'Belts', 'Wallets', 'Bags', 'Chains', 'Rings'];
    } else if (parent === 'perfumes') {
      fallbackNames = ['Men', 'Women', 'Unisex', 'Travel Packs'];
    }
    return fallbackNames.map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }));
  };

  const activeSubcategories = getSubcategories();

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
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        
        {/* Breadcrumb & Header info */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light">
            <span className="cursor-pointer hover:text-fg-luxury" onClick={() => { setActiveParent(''); setActiveSub(''); window.history.pushState(null, '', '/shop'); }}>Shop</span>
            {activeParent && (
              <>
                <span>/</span>
                <span className="cursor-pointer hover:text-fg-luxury" onClick={() => { setActiveSub(''); window.history.pushState(null, '', `/shop/${activeParent}`); }}>{activeParent}</span>
              </>
            )}
            {activeSub && (
              <>
                <span>/</span>
                <span className="text-fg-luxury">{activeSub}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-fg-luxury">
            {getPageTitle()}
          </h1>
          <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">
            Displaying {filteredProducts.length} Premium Articles
          </p>
        </div>

        {/* Subcategory index filter bar (wrapping flex layout) */}
        {activeParent && activeSubcategories.length > 0 && (
          <div className="mb-8 border-b border-neutral-soft/20 pb-4 flex flex-wrap gap-2 md:gap-3 text-[9px] uppercase tracking-widest">
            <button
              onClick={() => { setActiveSub(''); window.history.pushState(null, '', `/shop/${activeParent}`); }}
              className={`px-4 py-2 border transition-all cursor-pointer ${
                !activeSub 
                  ? 'border-fg-luxury bg-fg-luxury text-bg-luxury font-medium' 
                  : 'border-neutral-soft/40 text-text-muted hover:border-fg-luxury hover:text-fg-luxury bg-transparent'
              }`}
            >
              All {activeParent}
            </button>
            {activeSubcategories.map((sub) => {
              const isActive = activeSub === sub.slug;
              return (
                <button
                  key={sub.slug}
                  onClick={() => { setActiveSub(sub.slug); window.history.pushState(null, '', `/shop/${activeParent}/${sub.slug}`); }}
                  className={`px-4 py-2 border transition-all cursor-pointer ${
                    isActive 
                      ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-medium' 
                      : 'border-neutral-soft/40 text-text-muted hover:border-fg-luxury hover:text-fg-luxury bg-transparent'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Sidebar & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Filter sidebar panel (Desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-8 border-r border-neutral-soft/30 pr-6 hidden lg:flex">
            
            {/* Nested Subcategories index list */}
            {activeSubcategories.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 pb-1 border-b border-neutral-soft/30">
                  Sub-collections
                </h4>
                <div className="flex flex-col gap-2.5">
                  {activeSubcategories.map((sub) => {
                    const isActive = activeSub === sub.slug;
                    return (
                      <button
                        key={sub.slug}
                        onClick={() => { setActiveSub(sub.slug); window.history.pushState(null, '', `/shop/${activeParent}/${sub.slug}`); }}
                        className={`text-[10px] uppercase tracking-wider text-left transition-colors cursor-pointer hover:text-accent-gold ${isActive ? 'text-accent-gold font-medium' : 'text-text-muted font-light'}`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General categories list */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 pb-1 border-b border-neutral-soft/30">
                Departments
              </h4>
              <div className="flex flex-col gap-2.5">
                {/* Dynamic departments from DB */}
                {dbCategories.filter(c => !c.parentCategory).map((dept) => {
                  const isActive = activeParent === dept.slug;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => { setActiveParent(dept.slug); setActiveSub(''); window.history.pushState(null, '', `/shop/${dept.slug}`); }}
                      className={`text-[10px] uppercase tracking-wider text-left transition-colors cursor-pointer hover:text-accent-gold ${isActive ? 'text-accent-gold font-medium' : 'text-text-muted font-light'}`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
                {/* Static special filters */}
                {[{ name: 'Sale', slug: 'sale' }, { name: 'New Arrivals', slug: 'new-arrivals' }].map((item) => {
                  const isActive = activeParent === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => { setActiveParent(item.slug); setActiveSub(''); window.history.pushState(null, '', `/shop/${item.slug}`); }}
                      className={`text-[10px] uppercase tracking-wider text-left transition-colors cursor-pointer hover:text-accent-gold ${isActive ? 'text-accent-gold font-medium' : 'text-text-muted font-light'}`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price limits slider */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 pb-1 border-b border-neutral-soft/30">
                Price Cap (INR)
              </h4>
              <div className="flex flex-col gap-2">
                <input 
                  type="range" 
                  min="2000" 
                  max="20000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-fg-luxury bg-neutral-soft h-1 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] uppercase tracking-widest text-text-muted mt-1 font-light">
                  <span>₹2,000</span>
                  <span className="font-semibold text-fg-luxury">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Catalog grid and header toolbar panel */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-bg-luxury p-4 border border-neutral-soft/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-fg-luxury" />
                <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-medium">Filter Parameters</span>
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-transparent text-[10px] uppercase tracking-widest text-fg-luxury font-medium border border-neutral-soft/80 py-2 px-4 hover:border-fg-luxury transition-all cursor-pointer focus:outline-none select-none"
                >
                  <ArrowUpDown size={10} className="text-text-muted" />
                  <span>
                    {sortBy === 'default' ? 'Default Sort' :
                     sortBy === 'price-low' ? 'Price: Low to High' :
                     sortBy === 'price-high' ? 'Price: High to Low' :
                     'Top Rated'}
                  </span>
                  <ChevronDown size={10} className={`text-text-muted transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                    <div className="absolute right-0 mt-1 bg-bg-luxury border border-neutral-soft shadow-xl z-30 min-w-[180px] flex flex-col py-1 animate-[fadeIn_0.15s_ease-out] select-none text-left">
                      {[
                        { value: 'default', label: 'Default Sort' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'rating', label: 'Top Rated' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value as any);
                            setIsSortOpen(false);
                          }}
                          className={`text-[9px] uppercase tracking-wider text-left py-2.5 px-4 hover:bg-neutral-soft/30 hover:text-accent-gold transition-colors ${sortBy === opt.value ? 'text-accent-gold font-semibold bg-neutral-soft/10' : 'text-text-muted'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out_infinite_alternate]">
                    <div className="bg-neutral-soft/30 aspect-[3/4] w-full rounded-sm" />
                    <div className="bg-neutral-soft/30 h-3 w-3/4" />
                    <div className="bg-neutral-soft/30 h-3 w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-neutral-soft/60 flex flex-col justify-center items-center gap-4">
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-light">No articles match your parameters</p>
                <button 
                  onClick={() => { setPriceRange(20000); setSortBy('default'); setActiveParent(''); setActiveSub(''); window.history.pushState(null, '', '/shop'); }}
                  className="btn-editorial-solid text-xs py-2 px-6"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div 
                key={`${activeParent || 'shop'}-${activeSub || 'all'}-${sortBy}-${priceRange}`}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-catalog-fade"
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
