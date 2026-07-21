'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { X, Search } from 'lucide-react';
import type { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
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
    const matches = MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(matches);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] bg-bg-luxury flex flex-col px-6 md:px-24 py-16 animate-[fadeIn_0.25s_ease-out]">
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

        {/* Suggestion tags if empty */}
        {query.trim() === '' ? (
          <div className="text-left">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted mb-4">Suggested lookups</h4>
            <div className="flex flex-wrap gap-3">
              {['linen', 'trench coat', 'raw silk', 'utility', 'hoodie', 'dress'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-[10px] uppercase tracking-wider py-2 px-5 border border-neutral-soft/80 text-text-muted hover:border-fg-luxury hover:text-fg-luxury transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
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
                    onClick={onClose}
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
