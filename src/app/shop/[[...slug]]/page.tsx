'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  
  // Resolve slug parameter array
  const slug = params.slug as string[] | undefined;

  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [priceRange, setPriceRange] = useState<number>(20000);
  
  // Category variables derived from slug parameters
  const parentParam = slug?.[0] || '';
  const subParam = slug?.[1] || '';

  useEffect(() => {
    let list = [...MOCK_PRODUCTS];

    // Filter by main category or tags
    if (parentParam) {
      const decodedParent = decodeURIComponent(parentParam).toLowerCase();
      if (['men', 'women', 'accessories', 'perfumes'].includes(decodedParent)) {
        list = list.filter(p => p.parentCategory === decodedParent);
      } else if (decodedParent === 'new-arrivals') {
        list = list.filter(p => p.tags?.includes('new-arrivals'));
      } else if (decodedParent === 'sale') {
        list = list.filter(p => p.tags?.includes('sale'));
      }
    }

    // Filter by sub-category
    if (subParam) {
      const decodedSub = decodeURIComponent(subParam).toLowerCase();
      list = list.filter(p => p.subCategory === decodedSub);
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
  }, [parentParam, subParam, sortBy, priceRange]);

  const getPageTitle = () => {
    if (!parentParam) return 'Shop Catalog';
    const main = parentParam.charAt(0).toUpperCase() + parentParam.slice(1);
    if (!subParam) return main;
    const sub = subParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${main} / ${sub}`;
  };

  const getSubcategories = () => {
    if (parentParam === 'men') {
      return ['Oversized T-Shirts', 'Regular T-Shirts', 'Shirts', 'Hoodies', 'Sweatshirts', 'Jeans', 'Cargo Pants', 'Joggers', 'Shorts', 'Jackets'];
    }
    if (parentParam === 'women') {
      return ['T-Shirts', 'Oversized', 'Tops', 'Hoodies', 'Jeans', 'Dresses', 'Co-ords'];
    }
    if (parentParam === 'accessories') {
      return ['Caps', 'Belts', 'Wallets', 'Bags', 'Chains', 'Rings'];
    }
    if (parentParam === 'perfumes') {
      return ['Men', 'Women', 'Unisex', 'Travel Packs'];
    }
    return [];
  };

  const activeSubcategories = getSubcategories();

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        
        {/* Breadcrumb & Header info */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light">
            <span className="cursor-pointer hover:text-fg-luxury" onClick={() => router.push('/shop')}>Shop</span>
            {parentParam && (
              <>
                <span>/</span>
                <span className="cursor-pointer hover:text-fg-luxury" onClick={() => router.push(`/shop/${parentParam}`)}>{parentParam}</span>
              </>
            )}
            {subParam && (
              <>
                <span>/</span>
                <span className="text-fg-luxury">{subParam}</span>
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
                    const slugified = sub.toLowerCase().replace(/ /g, '-');
                    const isActive = subParam === slugified;
                    return (
                      <button
                        key={sub}
                        onClick={() => router.push(`/shop/${parentParam}/${slugified}`)}
                        className={`text-[10px] uppercase tracking-wider text-left transition-colors cursor-pointer hover:text-accent-gold ${isActive ? 'text-accent-gold font-medium' : 'text-text-muted font-light'}`}
                      >
                        {sub}
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
                {['Men', 'Women', 'Accessories', 'Perfumes', 'Sale', 'New Arrivals'].map((dept) => {
                  const slugified = dept.toLowerCase().replace(/ /g, '-');
                  const isActive = parentParam === slugified;
                  return (
                    <button
                      key={dept}
                      onClick={() => router.push(`/shop/${slugified}`)}
                      className={`text-[10px] uppercase tracking-wider text-left transition-colors cursor-pointer hover:text-accent-gold ${isActive ? 'text-accent-gold font-medium' : 'text-text-muted font-light'}`}
                    >
                      {dept}
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
            <div className="flex justify-between items-center bg-neutral-soft/10 p-4 border border-neutral-soft/30">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-fg-luxury" />
                <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-medium">Sorting Parameters</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown size={12} className="text-text-muted" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] uppercase tracking-wider text-fg-luxury font-light border-0 focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="default">Default Sort</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-neutral-soft/60 flex flex-col justify-center items-center gap-4">
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted font-light">No articles match your parameters</p>
                <button 
                  onClick={() => { setPriceRange(20000); setSortBy('default'); router.push('/shop'); }}
                  className="btn-editorial-solid text-xs py-2 px-6"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
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
