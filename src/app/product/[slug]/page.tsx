'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProducts, getProductBySlug, getProductReviews, createProductReview } from '@/services/database';
import type { Product } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { StructuredData } from '@/components/StructuredData';
import { ArrowLeft, Check, Truck, RotateCcw, ShieldCheck, Heart, Star, AlertTriangle, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface UserReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const item = await getProductBySlug(slug as string);
        setProduct(item);
        if (item) {
          const list = await getProducts();
          setRelatedProducts(list.filter(p => p.parentCategory === item.parentCategory && p.id !== item.id).slice(0, 4));
        }
      } catch (e: any) {
        if (e.message === 'DATABASE_CONNECTION_ERROR') {
          setDbError(true);
        }
      } finally {
        setLoadingProduct(false);
      }
    };
    loadItem();
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.6)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  // Reviews states
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsOffline, setReviewsOffline] = useState(false);

  useEffect(() => {
    if (product) {
      // Attempt to load live reviews from database
      const loadReviews = async () => {
        try {
          const data = await getProductReviews(product.id);
          setReviews(data);
        } catch (err: any) {
          if (err.message === 'DATABASE_OFFLINE') {
            setReviewsOffline(true);
            // Default static luxury reviews to avoid blank details
            setReviews([
              { id: '1', name: 'Aryan Dev', rating: 5, comment: 'Absolutely stunning drape. The organic texture is premium.', date: '2026-07-15' },
              { id: '2', name: 'Meera Sen', rating: 4, comment: 'Slightly oversized, recommend sizing down if you prefer tailored cuts.', date: '2026-07-10' }
            ]);
          }
        }
      };
      loadReviews();
    }
  }, [product]);

  if (dbError) {
    return (
      <div style={{ background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, padding: 20, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontSize: 16 }}>System Maintenance</h2>
        <p style={{ color: '#888', fontSize: 12, maxWidth: 320, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We are currently updating our database clusters. Secure connections will resume shortly.</p>
        <div style={{ width: 20, height: 20, border: '1px solid #333', borderTop: '1px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-bg-luxury flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="w-8 h-8 border border-neutral-soft border-t-fg-luxury rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-luxury">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center py-24">
          <h2 className="text-xl uppercase tracking-widest text-fg-luxury">Garment Not Found</h2>
          <button 
            onClick={() => router.push('/')}
            className="btn-editorial-solid text-xs"
          >
            Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const colors = product.variants ? Array.from(new Set(product.variants.map(v => v.color))) : [product.name];
  const sizes = product.variants ? Array.from(new Set(product.variants.map(v => v.size))) : ['One Size'];

  if (!selectedColor && colors.length > 0) {
    setSelectedColor(colors[0]);
  }
  if (!selectedSize && sizes.length > 0) {
    setSelectedSize(sizes[0]);
  }

  const handleAddToBag = async () => {
    const variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
    
    if (variant) {
      await addToCart({ ...variant, product });
      setAdded(true);
      showToast(`Equipped ${product.name} (${selectedSize}) to shopping bag.`, 'success');
      setTimeout(() => setAdded(false), 2000);
      setIsCartOpen(true);
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id, product.name);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductReview({
        product_id: product.id,
        name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0]
      });

      const newRev: UserReview = {
        id: Math.random().toString(),
        name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0]
      };
      setReviews(prev => [newRev, ...prev]);
      showToast('Review submitted successfully.', 'success');
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      if (err.message === 'DATABASE_OFFLINE') {
        showToast('Submissions offline (Database unconfigured).', 'error');
      } else {
        showToast(err.message || 'Review post failed.', 'error');
      }
    }
  };

  const favorited = isInWishlist(product.id);

  const schemaProduct = {
    name: product.name,
    image: [product.images[0]],
    description: product.description,
    sku: product.variants?.[0]?.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'FREERT'
    },
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock'
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />
      <StructuredData type="Product" data={schemaProduct} />

      <main className="flex-1 container-editorial py-12 md:py-24">
        {/* Back Link */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted hover:text-fg-luxury mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={12} /> Back to Catalog
        </button>

        {/* Asymmetric Editorial Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Image Display & Thumbnails */}
          <div className="flex gap-4 items-start col-span-1">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-16 flex-shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[3/4] border overflow-hidden transition-all duration-300 ${activeImageIndex === idx ? 'border-fg-luxury' : 'border-neutral-soft/50 hover:border-neutral-400'}`}
                >
                  <img src={img} className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-out]" alt="" />
                </button>
              ))}
            </div>

            {/* Main Image Frame (Zoom on hover) */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="flex-1 aspect-[3/4] bg-neutral-soft/30 overflow-hidden relative cursor-zoom-in border border-neutral-soft/30"
            >
              <img 
                src={product.images[activeImageIndex] || product.images[0]} 
                alt={product.name} 
                style={zoomStyle}
                className="w-full h-full object-cover transition-transform duration-200 ease-out animate-[fadeIn_0.3s_ease-out]"
              />
            </div>
          </div>

          {/* Details Content info */}
          <div className="text-left flex flex-col gap-8 max-w-md">
            {/* Headers */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-light">
                {product.category?.name} | {product.collection?.name}
              </p>
              <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide text-fg-luxury leading-tight">
                {product.name}
              </h1>
              {product.mrp && product.mrp > product.basePrice ? (
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-lg font-semibold text-fg-luxury tracking-wider">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-text-muted line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-red-700 font-semibold uppercase tracking-widest">
                    {Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <p className="text-lg font-light text-fg-luxury tracking-wider mt-1">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-text-muted leading-relaxed font-light border-t border-b border-neutral-soft/40 py-6 flex flex-col gap-3">
              <p>{product.description}</p>
              {product.material && (
                <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-text-muted mt-3 pt-3 border-t border-neutral-soft/10">
                  <span className="font-medium text-fg-luxury">Material Composition</span>
                  <span>{product.material}</span>
                </div>
              )}
              <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-text-muted">
                <span className="font-medium text-fg-luxury">Fabric Weave</span>
                <span>Premium Loom Knit</span>
              </div>
              <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-text-muted">
                <span className="font-medium text-fg-luxury">Garment Fit</span>
                <span>Relaxed Architectural Silhouette</span>
              </div>
              <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-text-muted">
                <span className="font-medium text-fg-luxury">Wash Care</span>
                <span>Dry Clean Only / Iron Low</span>
              </div>
              <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-text-muted">
                <span className="font-medium text-fg-luxury">Country of Origin</span>
                <span>{product.brand || 'Made in India'}</span>
              </div>
              {(product.status === 'out-of-stock' || (product.variants ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 10)) === 0 || product.stockQty === 0) ? (
                <span className="text-[10px] uppercase tracking-widest text-red-800 font-semibold bg-red-50 py-1 px-3 w-fit">
                  Out Of Stock
                </span>
              ) : (product.variants ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 10)) <= 5 ? (
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold bg-amber-50 py-1 px-3 w-fit">
                  Only {(product.variants ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 10))} Units Left
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-widest text-green-700 font-semibold bg-green-50 py-1 px-3 w-fit">
                  In Stock
                </span>
              )}
            </div>

            {/* Selection Options */}
            <div className="flex flex-col gap-6">
              {/* Colorways */}
              {colors.length > 0 && colors[0] !== product.name && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-3">Colorway</h4>
                  <div className="flex gap-3">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`text-[10px] uppercase tracking-wider py-1.5 px-4 border cursor-pointer transition-colors ${selectedColor === c ? 'border-fg-luxury text-fg-luxury font-medium' : 'border-neutral-soft/80 text-text-muted hover:border-neutral-400'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizing options */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">Size Module</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[8px] uppercase tracking-wider text-accent-gold hover:text-fg-luxury underline cursor-pointer"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {sizes.map((s) => {
                      const sizeVariant = product.variants?.find(v => v.size === s && v.color === (selectedColor || colors[0]));
                      const isSizeOutOfStock = sizeVariant ? sizeVariant.stockQty === 0 : false;
                      return (
                        <button
                          key={s}
                          disabled={isSizeOutOfStock}
                          onClick={() => setSelectedSize(s)}
                          className={`w-10 h-10 flex items-center justify-center text-[10px] uppercase font-medium border transition-colors ${
                            isSizeOutOfStock ? 'border-neutral-soft/30 text-neutral-300 line-through cursor-not-allowed opacity-50' :
                            selectedSize === s ? 'border-fg-luxury text-fg-luxury bg-fg-luxury/5 cursor-pointer' : 
                            'border-neutral-soft/80 text-text-muted hover:border-neutral-400 cursor-pointer'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Bag and Wishlist Layout */}
            <div className="flex gap-4">
              {(product.status === 'out-of-stock' || (product.variants ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 10)) === 0 || product.stockQty === 0) ? (
                <div className="flex flex-col gap-3 flex-1 text-left">
                  <input 
                    type="email" 
                    placeholder="Enter email to get restock alerts" 
                    className="input-editorial text-xs" 
                    required 
                  />
                  <button 
                    onClick={() => showToast(`We will notify you when ${product.name} restocks.`, 'success')}
                    className="btn-editorial-solid text-xs tracking-[0.25em] font-medium py-4 cursor-pointer"
                  >
                    Notify Me
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAddToBag}
                  disabled={!selectedColor || !selectedSize}
                  className="btn-editorial-solid flex-1 flex items-center justify-center gap-3 text-xs tracking-[0.25em] font-medium py-4 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check size={14} /> Added to Bag
                    </>
                  ) : (
                    'Equip to Shopping Bag'
                  )}
                </button>
              )}
              
              <button 
                onClick={handleWishlistToggle}
                className={`p-4 border transition-colors cursor-pointer flex items-center justify-center ${favorited ? 'border-fg-luxury bg-fg-luxury/5 text-fg-luxury' : 'border-neutral-soft/80 text-text-muted hover:border-fg-luxury hover:text-fg-luxury'}`}
                aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} fill={favorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trust and logistics guarantees */}
            <div className="flex flex-col gap-4 border-t border-neutral-soft/40 pt-8 text-[10px] uppercase tracking-[0.15em] text-text-muted font-light">
              <div className="flex items-center gap-3">
                <Truck size={14} className="text-accent-gold" />
                <span>Delivery expected by {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })} (Complimentary above ₹15,000)</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={14} className="text-accent-gold" />
                <span>Complimentary 14-day drone return pick-up</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={14} className="text-accent-gold" />
                <span>Genuine production verification guaranteed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Size Guide Modal Overlay */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[1500] bg-fg-luxury/45 backdrop-blur-[4px] flex items-center justify-center p-4">
            <div className="bg-bg-luxury border border-neutral-soft/80 max-w-lg w-full p-8 text-left relative shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">Size Reference Guide</h3>
              <p className="text-xs text-text-muted font-light leading-relaxed mb-6">
                FREERT silhouettes are designed with a relaxed, architectural fit. If you prefer a structured look, we recommend sizing down.
              </p>
              <table className="w-full text-[10px] uppercase tracking-wider text-text-muted">
                <thead>
                  <tr className="border-b border-neutral-soft">
                    <th className="py-2 text-left font-medium">Size</th>
                    <th className="py-2 text-left font-medium">Chest (in)</th>
                    <th className="py-2 text-left font-medium">Waist (in)</th>
                    <th className="py-2 text-left font-medium">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="font-light">
                  <tr className="border-b border-neutral-soft/30">
                    <td className="py-2 font-medium text-fg-luxury">S</td>
                    <td className="py-2">36 - 38</td>
                    <td className="py-2">30 - 32</td>
                    <td className="py-2">27.5</td>
                  </tr>
                  <tr className="border-b border-neutral-soft/30">
                    <td className="py-2 font-medium text-fg-luxury">M</td>
                    <td className="py-2">38 - 40</td>
                    <td className="py-2">32 - 34</td>
                    <td className="py-2">28.5</td>
                  </tr>
                  <tr className="border-b border-neutral-soft/30">
                    <td className="py-2 font-medium text-fg-luxury">L</td>
                    <td className="py-2">40 - 42</td>
                    <td className="py-2">34 - 36</td>
                    <td className="py-2">29.5</td>
                  </tr>
                  <tr className="border-b border-neutral-soft/30">
                    <td className="py-2 font-medium text-fg-luxury">XL</td>
                    <td className="py-2">42 - 44</td>
                    <td className="py-2">36 - 38</td>
                    <td className="py-2">30.5</td>
                  </tr>
                </tbody>
              </table>
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="btn-editorial-solid w-full text-[9px] tracking-widest font-semibold py-3 mt-8"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-24 pt-16 border-t border-neutral-soft/40 text-left">
          <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury mb-10">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Reviews List */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {reviewsOffline && (
                <div className="p-4 border border-red-700 bg-red-50 text-left flex items-start gap-3 mb-4">
                  <AlertTriangle size={16} className="text-red-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-red-700 block">Reviews Host Offline</span>
                    <span className="text-[10px] font-light text-red-700/80 leading-relaxed block">
                      Supabase variables are missing. Rendering local lookbook reviews logs as offline fallback.
                    </span>
                  </div>
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="text-xs text-text-muted font-light tracking-widest uppercase">No reviews yet. Be the first to review.</p>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="border-b border-neutral-soft/20 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-fg-luxury">{rev.name}</span>
                        <div className="flex text-accent-gold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={10} className="fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted font-light">{rev.date}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed font-light">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="md:col-span-5 bg-neutral-soft/10 p-8 border border-neutral-soft/40">
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
                Write a Review
              </h3>
              
              <form onSubmit={handlePostReview} className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Identity Name</label>
                  <input 
                    type="text" 
                    required 
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="Receiver"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Garment Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="text-accent-gold cursor-pointer"
                      >
                        <Star size={14} className={reviewRating >= stars ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Review Message</label>
                  <textarea 
                    required 
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input-editorial h-20 resize-none text-xs leading-relaxed"
                    placeholder="Describe drape quality, fit parameter details..."
                  />
                </div>
                
                <button 
                  type="submit"
                  className="btn-editorial-solid w-full text-[10px] tracking-widest font-medium py-3 cursor-pointer mt-2"
                >
                  Submit Review
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Related Products Section */}
        <section className="mt-24 pt-16 border-t border-neutral-soft/40 text-left">
          <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury mb-10">Related Articles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
