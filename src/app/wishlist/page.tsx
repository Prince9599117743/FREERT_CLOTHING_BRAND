'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProducts } from '@/services/database';
import type { Product } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allProds = await getProducts();
        const filtered = allProds.filter(p => wishlist.includes(p.id));
        setWishlistProducts(filtered);
      } catch (err) {
        console.error('Failed to load wishlist items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (wishlist && wishlist.length > 0) {
      fetchProducts();
    } else {
      setWishlistProducts([]);
      setLoading(false);
    }
  }, [wishlist]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        {/* Page Title Header */}
        <div className="flex flex-col gap-2 mb-10 border-b border-neutral-soft/20 pb-6">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-fg-luxury">
            My Wishlist
          </h1>
          <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">
            {loading ? 'Verifying items...' : `Saved items (${wishlistProducts.length})`}
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-6 h-6 border border-neutral-soft border-t-fg-luxury rounded-full animate-spin mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium">Loading Editorial Wishlist...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Sleek Luxury Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
            <div className="w-12 h-12 rounded-full border border-neutral-soft/50 flex items-center justify-center mb-6">
              <Heart size={16} className="text-text-muted stroke-[1.2]" />
            </div>
            <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-3">Your Wishlist is Empty</h2>
            <p className="text-[10px] uppercase tracking-widest text-text-muted leading-relaxed mb-8 max-w-[280px]">
              Explore our capsule collections to add and curate your favorite editorial articles.
            </p>
            <Link href="/shop" className="btn-editorial-solid text-[9px] py-3.5 px-8 font-semibold tracking-[0.25em] uppercase">
              Shop Collections
            </Link>
          </div>
        ) : (
          /* Products Grid list */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 animate-[fadeIn_0.4s_ease-out]">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
