'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/database';
import { X, Search, Clock, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
      // Load recent searches
      const saved = localStorage.getItem('freert_recent_searches');
      if (saved) {
        try { setRecentSearches(JSON.parse(saved)); } catch (e) {}
      }
      const fetchList = async () => {
        try {
          const list = await getProducts();
          setAllProducts(list);
        } catch (e) {}
      };
      fetchList();
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const matches = allProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );
    setResults(matches);
  }, [query, allProducts]);

  const handleResultClick = (searchVal: string) => {
    // Add to recent searches
    const clean = searchVal.trim();
    if (!clean) return;
    const filtered = recentSearches.filter(s => s !== clean);
    const updated = [clean, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('freert_recent_searches', JSON.stringify(updated));
    onClose();
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem('freert_recent_searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-bg-luxury flex flex-col px-6 md:px-24 py-16 animate-[fadeIn_0.25s_ease-out] overflow-y-auto">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
        aria-label="Close search overlay"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-12 mt-12">
        {/* Big Search Input */}
        <div className="border-b border-neutral-soft/80 flex items-center pb-4">
          <Search size={22} className="text-text-muted mr-4" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="TYPE TO SEARCH GARMENTS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-xl md:text-2xl uppercase tracking-widest focus:outline-none w-full text-fg-luxury font-light placeholder-neutral-300"
          />
        </div>

        {/* Suggestion block if empty query */}
        {query.trim() === '' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
            
            {/* Left: Suggested tags & recents (Col span 5) */}
            <div className="md:col-span-5 flex flex-col gap-8">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted">Recent searches</h4>
                    <button onClick={handleClearRecents} className="text-[8px] uppercase tracking-wider text-red-700 font-semibold cursor-pointer">Clear</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recentSearches.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2 text-[10px] text-text-muted hover:text-fg-luxury text-left font-light"
                      >
                        <Clock size={11} /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">Suggested categories</h4>
                <div className="flex flex-col gap-2">
                  {['men', 'women', 'accessories', 'perfumes'].map((cat) => (
                    <Link 
                      key={cat} 
                      href={`/shop/${cat}`} 
                      onClick={onClose}
                      className="text-[10px] uppercase tracking-widest text-text-muted hover:text-fg-luxury flex justify-between items-center py-0.5 border-b border-neutral-soft/10"
                    >
                      <span>{cat} Collection</span>
                      <ArrowRight size={10} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Popular / Spotlight products suggestions (Col span 7) */}
            <div className="md:col-span-7">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted mb-4">Spotlight Suggestions</h4>
              <div className="grid grid-cols-2 gap-4">
                {allProducts.slice(0, 2).map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    onClick={() => handleResultClick(product.name)}
                    className="group flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-neutral-soft/20 overflow-hidden">
                      <img 
                        src={product.images && product.images[0] ? product.images[0] : '/assets/trench_coat.jpg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                    <div>
                      <h5 className="text-[9.5px] uppercase tracking-wider font-semibold text-fg-luxury truncate">{product.name}</h5>
                      <p className="text-[9px] text-text-muted mt-0.5">₹{product.basePrice.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Results grid */
          <div className="text-left">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted mb-6">
              Search Results ({results.length})
            </h4>

            {results.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted uppercase tracking-widest font-light">
                No items match query parameters
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    onClick={() => handleResultClick(product.name)}
                    className="group flex flex-col gap-2 cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-neutral-soft/20 overflow-hidden">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase tracking-wider font-medium text-fg-luxury truncate">{product.name}</h5>
                      <p className="text-[9px] font-light text-text-muted mt-0.5">₹{product.basePrice.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
