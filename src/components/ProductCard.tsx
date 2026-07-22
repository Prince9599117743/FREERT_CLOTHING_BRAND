'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Heart, Star, Eye, ShoppingBag, Bell } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();

  const [activeSize, setActiveSize] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  
  const favorited = isInWishlist(product.id);
  const sizes = product.variants ? Array.from(new Set(product.variants.map(v => v.size))) : [];

  // Stock status logic
  const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 10);
  const isOutOfStock = product.status === 'out-of-stock' || totalStock === 0 || product.stockQty === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  const handleQuickAdd = async (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    const variant = product.variants?.find(v => v.size === size);
    if (variant) {
      await addToCart({ ...variant, product });
      showToast(`Equipped ${product.name} (${size}) to bag.`, 'success');
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    const targetSize = activeSize || sizes[0] || 'One Size';
    const variant = product.variants?.find(v => v.size === targetSize) || product.variants?.[0];
    
    if (variant) {
      await addToCart({ ...variant, product });
      router.push('/checkout');
    }
  };

  // Image hover swap logic
  const displayImage = isHovered && product.images && product.images[1] ? product.images[1] : (product.images && product.images[0] ? product.images[0] : '/assets/trench_coat.jpg');

  // Dynamic tags / badges list
  const badges: string[] = [];
  if (product.tags) {
    if (product.tags.includes('new-arrival') || product.tags.includes('new-arrivals')) badges.push('New Arrival');
    if (product.tags.includes('trending')) badges.push('Trending');
    if (product.tags.includes('best-seller') || product.tags.includes('best-sellers')) badges.push('Best Seller');
    if (product.tags.includes('featured')) badges.push('Featured');
    if (product.tags.includes('limited-edition')) badges.push('Limited Edition');
    if (product.tags.includes('sale')) badges.push('Sale');
  }

  // Price calculations
  const hasDiscount = product.mrp && product.mrp > product.basePrice;
  const discountPercent = hasDiscount ? Math.round(((product.mrp! - product.basePrice) / product.mrp!) * 100) : 0;

  return (
    <div 
      className="group flex flex-col gap-3 relative text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] bg-neutral-soft/30 overflow-hidden cursor-pointer block">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-700 ease-out scale-100 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
        
        {/* Floating Heart icon */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-2 bg-bg-luxury/80 rounded-full text-fg-luxury hover:text-red-700 hover:bg-bg-luxury shadow-sm transition-all duration-300 cursor-pointer z-10"
          aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} fill={favorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Floating Quick View Icon */}
        <Link 
          href={`/product/${product.slug}`}
          className="absolute top-16 right-4 p-2 bg-bg-luxury/80 rounded-full text-fg-luxury hover:text-accent-gold hover:bg-bg-luxury shadow-sm transition-all duration-300 cursor-pointer z-10 opacity-0 group-hover:opacity-100 hidden md:flex"
          aria-label="Quick View product"
        >
          <Eye size={13} strokeWidth={1.5} />
        </Link>

        {/* Hover Slider Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-fg-luxury/90 backdrop-blur-[2px] p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex flex-col gap-3 z-10">
          
          {isOutOfStock ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showToast(`We will notify you when ${product.name} restocks.`, 'success');
              }}
              className="w-full bg-accent-gold text-bg-luxury hover:bg-bg-luxury hover:text-fg-luxury text-[8px] uppercase tracking-wider font-semibold py-2.5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <Bell size={10} /> Notify Me
            </button>
          ) : (
            <>
              {/* Sizing selection trigger */}
              {sizes.length > 0 && (
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[8px] uppercase tracking-widest text-neutral-300 font-light">Quick Equip Size</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={(e) => handleQuickAdd(e, size)}
                        className="text-[8px] font-semibold bg-bg-luxury hover:bg-accent-gold hover:text-bg-luxury text-fg-luxury py-1 px-2 border border-neutral-soft/30 transition-all cursor-pointer"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Buy actions */}
              <div className="flex gap-2">
                <button 
                  onClick={(e) => handleQuickAdd(e, activeSize || sizes[0] || 'One Size')}
                  className="flex-1 bg-bg-luxury text-fg-luxury hover:bg-accent-gold hover:text-bg-luxury text-[8px] uppercase tracking-wider font-semibold py-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag size={10} /> Add Bag
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-accent-gold text-bg-luxury hover:bg-bg-luxury hover:text-fg-luxury text-[8px] uppercase tracking-wider font-semibold py-2 transition-all cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </>
          )}
        </div>

        {/* Editorial tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          {isOutOfStock ? (
            <span className="text-[8px] uppercase tracking-[0.2em] bg-red-800 text-bg-luxury py-1 px-3 font-semibold">
              Sold Out
            </span>
          ) : (
            <>
              {isLowStock && (
                <span className="text-[8px] uppercase tracking-[0.2em] bg-amber-600 text-bg-luxury py-1 px-3 font-semibold">
                  Only {totalStock} Left
                </span>
              )}
              {badges.map((badge, idx) => (
                <span key={idx} className="text-[8px] uppercase tracking-[0.2em] bg-fg-luxury text-bg-luxury py-1 px-3 font-light">
                  {badge}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Product Details info */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-baseline">
          <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-fg-luxury truncate max-w-[70%]">
            <Link href={`/product/${product.slug}`} className="hover:text-accent-gold transition-colors duration-300">
              {product.name}
            </Link>
          </h3>
          
          {hasDiscount ? (
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-semibold text-fg-luxury tracking-wider">
                ₹{product.basePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[8px] text-text-muted line-through">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
              <span className="text-[8px] text-red-700 font-semibold uppercase tracking-wider mt-0.5">
                {discountPercent}% OFF
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-light text-fg-luxury tracking-wider">
              ₹{product.basePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        
        {/* Rating & reviews */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex text-accent-gold">
            <Star size={9} className="fill-current" />
          </div>
          <span className="text-[8px] text-text-muted font-light uppercase tracking-widest">
            {product.rating || 4.5} ({product.reviewsCount || 10} Reviews)
          </span>
        </div>

        {/* Sizes line representation */}
        {sizes.length > 0 && (
          <p className="text-[8px] text-text-muted font-light uppercase tracking-widest mt-1">
            Sizes: {sizes.join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};
