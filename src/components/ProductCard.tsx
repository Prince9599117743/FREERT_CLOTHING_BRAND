'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const favorited = isInWishlist(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  return (
    <div className="group flex flex-col gap-3 relative">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] bg-neutral-soft/30 overflow-hidden cursor-pointer block">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Floating Heart Icon */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-2 bg-bg-luxury/80 rounded-full text-fg-luxury hover:text-red-700 hover:bg-bg-luxury shadow-sm transition-all duration-300 cursor-pointer z-10"
          aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={favorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {product.isPublished && (
          <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest bg-fg-luxury text-bg-luxury py-1 px-3.5 font-light">
            New Edit
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-col gap-1 text-left px-1">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-fg-luxury truncate max-w-[75%]">
            <Link href={`/product/${product.slug}`} className="hover:text-accent-gold transition-colors duration-300">
              {product.name}
            </Link>
          </h3>
          <span className="text-[11px] font-light text-fg-luxury tracking-wider">
            ₹{product.basePrice.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">
          {product.category?.name || 'Garment'}
        </p>
      </div>
    </div>
  );
};
