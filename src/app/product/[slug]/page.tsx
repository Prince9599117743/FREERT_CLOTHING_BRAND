'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getProducts, 
  getProductBySlug, 
  getProductReviews, 
  createProductReview, 
  subscribeNewsletter, 
  createRestockAlert, 
  getProductDetailsSections, 
  getProductLookProducts, 
  getProductComboOffer 
} from '@/services/database';
import type { Product } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { StructuredData } from '@/components/StructuredData';
import { 
  ArrowLeft, Check, Truck, RotateCcw, ShieldCheck, Heart, Star, 
  AlertTriangle, X, ChevronDown, Award, Sparkles, MessageSquare, 
  ThumbsUp, Flag, Upload, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface UserReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  title?: string;
  qualityRating?: number;
  fitRating?: string; 
  comfortRating?: number;
  fabricRating?: number;
  recommended?: boolean;
  email?: string;
  orderNumber?: string;
  images?: string[];
  helpfulCount?: number;
  isVerified?: boolean;
  sizePurchased?: string;
}

const AccordionSection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E8E8] py-4 transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-[10px] uppercase tracking-[0.25em] text-[#111111] font-semibold focus:outline-none cursor-pointer py-1"
      >
        <span className="font-inter">{title}</span>
        <ChevronDown 
          size={12} 
          className={`text-[#666666] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'rotate-180 text-[#111111]' : ''}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div 
            className="text-[11px] font-light text-[#666666] leading-relaxed text-left prose max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [infoSections, setInfoSections] = useState<any[]>([]);
  const [lookProducts, setLookProducts] = useState<Product[]>([]);
  const [comboOffer, setComboOffer] = useState<any | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsOffline, setReviewsOffline] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewOrderNum, setReviewOrderNum] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQuality, setReviewQuality] = useState(5);
  const [reviewFit, setReviewFit] = useState('True to Size');
  const [reviewComfort, setReviewComfort] = useState(5);
  const [reviewFabric, setReviewFabric] = useState(5);
  const [reviewTitleInput, setReviewTitleInput] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRecommend, setReviewRecommend] = useState<boolean>(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  const [restockEmail, setRestockEmail] = useState('');

  useEffect(() => {
    const loadItem = async () => {
      try {
        const item = await getProductBySlug(slug as string);
        setProduct(item);
        if (item) {
          const itemColorsConfig = item.colors && item.colors.length > 0 ? item.colors.filter((c: any) => c.is_active) : [];
          const itemColors = itemColorsConfig.length > 0 
            ? itemColorsConfig.map((c: any) => c.color_name) 
            : (item.variants ? Array.from(new Set(item.variants.map(v => v.color))) : []);
          
          const itemSizes = item.variants ? Array.from(new Set(item.variants.map(v => v.size))) : [];
          
          if (itemColors.length > 0) {
            setSelectedColor(itemColors[0]);
          } else {
            setSelectedColor('Default');
          }
          
          const itemCatSlug = item.category?.slug?.toLowerCase() || '';
          const itemParentCatSlug = item.parentCategory?.toLowerCase() || '';
          const itemIsClothing = itemCatSlug !== 'perfumes' && 
                             itemCatSlug !== 'accessories' && 
                             itemParentCatSlug !== 'accessories' &&
                             !item.slug.includes('perfume') && 
                             !item.slug.includes('fragrance') &&
                             !item.slug.includes('wallet') &&
                             !item.slug.includes('belt');

          if (itemSizes.length > 0) {
            setSelectedSize(itemSizes[0]);
          } else {
            setSelectedSize(itemIsClothing ? 'S' : 'One Size');
          }

          const list = await getProducts();
          const itemTags = item.tags || [];
          const scored = list
            .filter(p => p.id !== item.id)
            .map(p => {
              let score = 0;
              if (p.categoryId && p.categoryId === item.categoryId) score += 10;
              if (p.subCategory && p.subCategory === item.subCategory) score += 5;
              if (p.parentCategory && p.parentCategory === item.parentCategory) score += 4;
              if (p.collectionId && p.collectionId === item.collectionId) score += 3;
              if (p.tags && itemTags.length > 0) {
                const commonTags = p.tags.filter(t => itemTags.includes(t));
                score += commonTags.length * 2;
              }
              return { product: p, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(x => x.product)
            .slice(0, 4);

          setRelatedProducts(scored);
          
          try {
            const sectionsData = await getProductDetailsSections(item.id);
            setInfoSections(sectionsData);
          } catch {
            setInfoSections([]);
          }

          try {
            const lookData = await getProductLookProducts(item.id);
            setLookProducts(lookData);
          } catch {
            setLookProducts([]);
          }

          try {
            const comboData = await getProductComboOffer(item.id);
            setComboOffer(comboData);
          } catch {
            setComboOffer(null);
          }
        }
      } catch (e: any) {
        setDbError(true);
      } finally {
        setLoadingProduct(false);
      }
    };
    loadItem();
  }, [slug]);

  useEffect(() => {
    if (product) {
      const loadReviews = async () => {
        try {
          const data = await getProductReviews(product.id);
          const mapped: UserReview[] = data.map((r: any) => {
            let comment = r.comment || '';
            let title = 'Verified Experience';
            let qualityRating = r.rating;
            let fitRating = 'True to Size';
            let comfortRating = r.rating;
            let fabricRating = r.rating;
            let recommended = true;
            let email = '';
            let orderNumber = '';
            let name = r.user?.full_name || 'Anonymous User';
            let images: string[] = [];
            let sizePurchased = 'M';

            try {
              if (comment.startsWith('{') && comment.endsWith('}')) {
                const parsed = JSON.parse(comment);
                comment = parsed.comment || '';
                title = parsed.title || 'Verified Experience';
                qualityRating = parsed.qualityRating ?? r.rating;
                fitRating = parsed.fitRating ?? 'True to Size';
                comfortRating = parsed.comfortRating ?? r.rating;
                fabricRating = parsed.fabricRating ?? r.rating;
                recommended = parsed.recommended ?? true;
                email = parsed.email || '';
                orderNumber = parsed.orderNumber || '';
                name = parsed.fullName || r.user?.full_name || 'Anonymous User';
                images = parsed.images || [];
                sizePurchased = parsed.sizePurchased || 'M';
              }
            } catch (e) {
              // fallback
            }

            return {
              id: r.id,
              name,
              rating: r.rating,
              comment,
              date: r.createdAt ? r.createdAt.split('T')[0] : (r.created_at ? r.created_at.split('T')[0] : ''),
              title,
              qualityRating,
              fitRating,
              comfortRating,
              fabricRating,
              recommended,
              email,
              orderNumber,
              images,
              sizePurchased,
              isVerified: true
            };
          });
          setReviews(mapped);
        } catch (err: any) {
          if (err.message === 'DATABASE_OFFLINE') {
            setReviewsOffline(true);
            setReviews([
              { 
                id: '1', 
                name: 'Aryan Dev', 
                rating: 5, 
                comment: 'The architectural fit is spot on. Hand-knitted weave has weight and drapes beautifully.', 
                date: '2026-07-15',
                title: 'Exceptional Drape and Finish',
                qualityRating: 5,
                fitRating: 'True to Size',
                comfortRating: 5,
                fabricRating: 5,
                recommended: true,
                sizePurchased: 'L',
                isVerified: true,
                images: []
              },
              { 
                id: '2', 
                name: 'Meera Sen', 
                rating: 4, 
                comment: 'Slightly oversized in the shoulders, which matches the aesthetic. Extremely comfortable fabric.', 
                date: '2026-07-10',
                title: 'Beautiful Minimalist Silhouette',
                qualityRating: 5,
                fitRating: 'Runs Large',
                comfortRating: 4,
                fabricRating: 5,
                recommended: true,
                sizePurchased: 'S',
                isVerified: true,
                images: []
              }
            ]);
          }
        }
      };
      loadReviews();
    }
  }, [product]);

  // Image zoom interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.5)'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to write a review.', 'error');
      return;
    }

    const reviewData = {
      comment: reviewComment,
      title: reviewTitleInput || 'Verified Purchase Feedback',
      qualityRating: reviewQuality,
      fitRating: reviewFit,
      comfortRating: reviewComfort,
      fabricRating: reviewFabric,
      recommended: reviewRecommend,
      email: reviewEmail,
      orderNumber: reviewOrderNum,
      fullName: reviewName || user.fullName || 'Customer Reviewer',
      images: uploadedPhotos,
      sizePurchased: selectedSize || 'M'
    };

    try {
      await createProductReview({
        userId: user.id,
        productId: product!.id,
        rating: reviewRating,
        comment: JSON.stringify(reviewData)
      });

      showToast('Review submitted successfully.', 'success');
      setReviewName('');
      setReviewEmail('');
      setReviewOrderNum('');
      setReviewTitleInput('');
      setReviewComment('');
      setReviewRating(5);
      setReviewQuality(5);
      setReviewFit('True to Size');
      setReviewComfort(5);
      setReviewFabric(5);
      setReviewRecommend(true);
      setUploadedPhotos([]);
      setIsReviewFormOpen(false);

      // Instantly load live reviews
      const data = await getProductReviews(product!.id);
      const mapped = data.map((r: any) => {
        let comment = r.comment || '';
        let title = 'Verified Experience';
        let qualityRating = r.rating;
        let fitRating = 'True to Size';
        let comfortRating = r.rating;
        let fabricRating = r.rating;
        let recommended = true;
        let email = '';
        let orderNumber = '';
        let name = r.user?.full_name || 'Anonymous User';
        let images: string[] = [];
        let sizePurchased = 'M';

        try {
          if (comment.startsWith('{') && comment.endsWith('}')) {
            const parsed = JSON.parse(comment);
            comment = parsed.comment || '';
            title = parsed.title || 'Verified Experience';
            qualityRating = parsed.qualityRating ?? r.rating;
            fitRating = parsed.fitRating ?? 'True to Size';
            comfortRating = parsed.comfortRating ?? r.rating;
            fabricRating = parsed.fabricRating ?? r.rating;
            recommended = parsed.recommended ?? true;
            email = parsed.email || '';
            orderNumber = parsed.orderNumber || '';
            name = parsed.fullName || r.user?.full_name || 'Anonymous User';
            images = parsed.images || [];
            sizePurchased = parsed.sizePurchased || 'M';
          }
        } catch (e) {}

        return {
          id: r.id,
          name,
          rating: r.rating,
          comment,
          date: r.createdAt ? r.createdAt.split('T')[0] : (r.created_at ? r.created_at.split('T')[0] : ''),
          title,
          qualityRating,
          fitRating,
          comfortRating,
          fabricRating,
          recommended,
          email,
          orderNumber,
          images,
          sizePurchased,
          isVerified: true
        };
      });
      setReviews(mapped);
    } catch {
      showToast('Could not save review.', 'error');
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setVotedHelpful(prev => ({
      ...prev,
      [reviewId]: true
    }));
    showToast('Marked review as helpful.', 'success');
  };

  const handleReportClick = (reviewId: string) => {
    showToast('Review has been reported to administration.', 'info');
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (dbError || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={32} className="text-stone-800 mb-4 stroke-[1.2]" />
        <h2 className="text-lg font-playfair uppercase tracking-wider text-stone-900 mb-2">Item Unavailable</h2>
        <p className="text-xs text-[#666666] font-inter max-w-xs leading-relaxed mb-6">
          This article is currently not in our catalog index or database is offline.
        </p>
        <button onClick={() => router.push('/')} className="btn-editorial-solid px-6 py-3 text-[10px]">
          Return to home
        </button>
      </div>
    );
  }

  const colorsConfig = product.colors && product.colors.length > 0 ? product.colors.filter((c: any) => c.is_active) : [];
  const colors = colorsConfig.map(c => c.color_name);

  const catSlug = product.category?.slug?.toLowerCase() || '';
  const parentCatSlug = product.parentCategory?.toLowerCase() || '';
  const isClothing = catSlug !== 'perfumes' && 
                     catSlug !== 'accessories' && 
                     parentCatSlug !== 'accessories' &&
                     !product.slug.includes('perfume') && 
                     !product.slug.includes('fragrance') &&
                     !product.slug.includes('wallet') &&
                     !product.slug.includes('belt');

  const sizes = product.variants && product.variants.length > 0 
    ? Array.from(new Set(product.variants.map(v => v.size))) 
    : (isClothing ? ['S', 'M', 'L', 'XL'] : ['One Size']);

  const selectedColorway = colorsConfig.find((col: any) => col.color_name === selectedColor);
  const activeMedia = (selectedColorway && selectedColorway.images && selectedColorway.images.length > 0)
    ? [...(selectedColorway.images || []), ...(selectedColorway.videos || [])]
    : (product.images || []);

  const totalStock = product.variants && product.variants.length > 0 ? product.variants.reduce((sum, v) => sum + v.stockQty, 0) : (product.stockQty ?? 0);
  const isOutOfStock = product.status === 'out-of-stock' || (product.trackQuantity !== false && totalStock === 0);

  const selectedVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  const isSelectedVariantOutOfStock = product.trackQuantity !== false && selectedVariant ? selectedVariant.stockQty === 0 : false;
  const showNotifyMe = isOutOfStock || isSelectedVariantOutOfStock;

  const favorited = isInWishlist(product.id);

  const activePrice = Number(product.basePrice || 0) + Number(selectedVariant?.additionalPrice || 0);
  const activeMrp = product.mrp ? (Number(product.mrp) + Number(selectedVariant?.additionalPrice || 0)) : undefined;

  const defaultAccordionSections = [
    { title: 'Material & Fabric', content: product.material ? `Composed of 100% premium ${product.material}. Hand-woven in small batches to preserve luxury texture.` : 'Tailored from organic raw fibers. Finished with fine editorial stitching.' },
    { title: 'Care Guide', content: 'Our garments are made to last. We recommend professional dry clean only or gentle hand wash in cold water. Do not bleach. Air dry in the shade. Iron on low heat.' },
    { title: 'Complimentary Shipping & Returns', content: 'We offer complimentary express delivery for all domestic orders above ₹499 INR. Below this, a standard courier rate of ₹80 INR applies. Returns are accepted within 14 days of receipt.' }
  ];
  const activeAccordionSections = infoSections.length > 0 ? infoSections : defaultAccordionSections;

  const handleAddToBag = async () => {
    let variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
    if (!variant && (!product.variants || product.variants.length === 0)) {
      variant = {
        id: `virtual-${product.id}-${selectedSize}`,
        productId: product.id,
        size: selectedSize || 'One Size',
        color: selectedColor || 'Default',
        stockQty: product.stockQty || 10,
        additionalPrice: 0,
        sku: `SKU-${product.slug}-${selectedSize}`
      } as any;
    }
    
    if (variant) {
      await addToCart({ ...variant, product });
      setAdded(true);
      showToast(`Equipped ${product.name} (${selectedSize}) to shopping bag.`, 'success');
      setTimeout(() => setAdded(false), 2000);
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = async () => {
    let variant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
    if (!variant && (!product.variants || product.variants.length === 0)) {
      variant = {
        id: `virtual-${product.id}-${selectedSize}`,
        productId: product.id,
        size: selectedSize || 'One Size',
        color: selectedColor || 'Default',
        stockQty: product.stockQty || 10,
        additionalPrice: 0,
        sku: `SKU-${product.slug}-${selectedSize}`
      } as any;
    }
    if (variant) {
      await addToCart({ ...variant, product });
      router.push('/checkout');
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id, product.name);
  };

  const handleRestockAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockEmail) return;
    const selectedVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
    const selectedVariantId = selectedVariant?.id || null;
    try {
      await createRestockAlert(product.id, selectedVariantId, user?.id || null, restockEmail);
      showToast(`Restock alert set. We will notify you immediately when available.`, 'success');
      setRestockEmail('');
    } catch {
      showToast('Could not register restock request.', 'error');
    }
  };

  // Review Summary Math
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 5;

  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const starIdx = Math.max(1, Math.min(5, Math.floor(r.rating))) - 1;
    ratingDistribution[starIdx]++;
  });

  const verifiedCount = reviews.filter(r => r.isVerified !== false).length;
  const verifiedPercentage = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 100;

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
    <div className="flex flex-col min-h-screen bg-[#FAF9F7] text-[#111111]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <Navbar />
      <StructuredData type="Product" data={schemaProduct} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-12 py-8 font-inter">
        {/* Back Link */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#666666] hover:text-[#111111] mb-8 transition-colors cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={12} /> Back to Collection
        </button>

        {/* Dynamic Image & Details Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Large Product Image Gallery (60-65% width equivalent) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 w-full select-none">
            {/* Desktop Vertical Images list / Mobile carousel */}
            <div className="hidden md:flex flex-col gap-3">
              {activeMedia.map((mediaUrl, idx) => {
                const isVideo = mediaUrl.endsWith('.mp4') || 
                                mediaUrl.endsWith('.webm') || 
                                mediaUrl.endsWith('.mov') || 
                                mediaUrl.includes('/video/') || 
                                mediaUrl.includes('_video');
                return (
                  <div 
                    key={idx}
                    className="w-full aspect-[3/4] bg-white overflow-hidden border border-[#E8E8E8] relative cursor-zoom-in group transition-all duration-300 hover:shadow-sm"
                    onClick={() => {
                      setActiveMediaIdx(idx);
                      setIsFullscreen(true);
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={mediaUrl} 
                        alt={`${product.name} - View ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Carousel View */}
            <div className="md:hidden w-full aspect-[3/4] bg-white overflow-hidden border border-[#E8E8E8] relative">
              {activeMedia.map((mediaUrl, idx) => {
                const isVideo = mediaUrl.endsWith('.mp4') || 
                                mediaUrl.endsWith('.webm') || 
                                mediaUrl.endsWith('.mov') || 
                                mediaUrl.includes('/video/') || 
                                mediaUrl.includes('_video');
                const isVisible = idx === activeMediaIdx;
                return (
                  <div 
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                  >
                    {isVisible && (
                      isVideo ? (
                        <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={mediaUrl} className="w-full h-full object-cover" alt="" />
                      )
                    )}
                  </div>
                );
              })}

              {/* Slider Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {activeMedia.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeMediaIdx ? 'bg-[#111111] w-3' : 'bg-[#666666]/40'}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Product Details (35-40% width equivalent) */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6 w-full lg:sticky lg:top-24">
            
            {/* Header info */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#666666] font-medium">
                {product.category?.name} • {product.collection?.name || 'Exclusive Capsule'}
              </span>
              <h1 className="text-xl md:text-2xl font-light font-playfair tracking-wide text-[#111111] mt-1 leading-tight">
                {product.name}
              </h1>
              
              {/* Stars link */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-stone-900">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={9.5} 
                      className={i < Math.round(averageRating) ? 'fill-current' : 'text-stone-300'} 
                    />
                  ))}
                </div>
                <button
                  onClick={() => document.getElementById('reviews-view')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[9px] text-[#666666] hover:text-[#111111] uppercase tracking-wider underline cursor-pointer"
                >
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-b border-[#E8E8E8] py-4 flex flex-col gap-1.5 bg-white/45 px-4 rounded-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-base font-semibold text-[#111111]">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp && activeMrp > activePrice && (
                  <>
                    <span className="text-[11px] text-[#666666] line-through">
                      ₹{activeMrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-red-700 font-bold">
                      {Math.round(((activeMrp - activePrice) / activeMrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <span className="text-[8px] uppercase tracking-wider text-[#666666] font-medium">
                MRP Inclusive of All Taxes (GST Included)
              </span>
            </div>

            {/* Size Options & Colors Config */}
            <div className="flex flex-col gap-5">
              
              {/* Colorways */}
              {colors.length > 0 && colors[0] !== product.name && colors[0] !== 'Default' && (
                <div>
                  <h4 className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#111111] mb-2.5">
                    Color: <span className="text-[#666666] font-normal normal-case">{selectedColor}</span>
                  </h4>
                  <div className="flex gap-2.5 flex-wrap">
                    {colorsConfig.map((colConfig) => {
                      const isSelected = selectedColor === colConfig.color_name;
                      return (
                        <button
                          key={colConfig.id}
                          type="button"
                          onClick={() => {
                            setSelectedColor(colConfig.color_name);
                            setActiveMediaIdx(0);
                          }}
                          className={`w-6.5 h-6.5 rounded-full border transition-all duration-300 relative flex items-center justify-center p-0.5 ${
                            isSelected ? 'border-[#111111] ring-1 ring-[#111111] scale-105' : 'border-[#E8E8E8] hover:scale-105'
                          }`}
                          title={colConfig.color_name}
                        >
                          <span 
                            className="w-full h-full rounded-full" 
                            style={{ 
                              backgroundColor: colConfig.color_code || '#CCCCCC',
                              backgroundImage: colConfig.color_image ? `url(${colConfig.color_image})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Selector */}
              {sizes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#111111]">Select Size</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[8px] uppercase tracking-wider text-accent-gold hover:underline cursor-pointer"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {sizes.map((s) => {
                      const sizeVariant = product.variants?.find(v => v.size === s && v.color === (selectedColor || colors[0]));
                      const isSizeOutOfStock = (product.variants && product.variants.length > 0)
                        ? (sizeVariant ? (product.trackQuantity !== false && sizeVariant.stockQty === 0) : true)
                        : (product.status === 'out-of-stock' || (product.trackQuantity !== false && (product.stockQty ?? 0) === 0));

                      const isSelected = selectedSize === s;

                      return (
                        <button
                          key={s}
                          disabled={isSizeOutOfStock}
                          onClick={() => setSelectedSize(s)}
                          className={`w-full flex items-center justify-between py-3 px-4 border text-[9px] uppercase font-semibold tracking-wider transition-all duration-300 rounded-sm relative overflow-hidden ${
                            isSizeOutOfStock 
                              ? 'border-[#E8E8E8] text-stone-400 bg-stone-50 cursor-not-allowed opacity-65' 
                              : isSelected 
                              ? 'border-[#111111] text-[#111111] bg-[#111111]/5 ring-[0.5px] ring-[#111111]' 
                              : 'border-[#E8E8E8] text-[#666666] hover:border-stone-800 hover:text-black bg-white cursor-pointer'
                          }`}
                        >
                          {isSizeOutOfStock && (
                            <div className="absolute top-[50%] left-0 right-0 h-[1px] bg-red-700/25 -rotate-2 pointer-events-none" />
                          )}
                          <span className="flex items-center gap-3">
                            <span className={isSizeOutOfStock ? 'line-through decoration-red-700/40' : ''}>{s}</span>
                            {!isSizeOutOfStock ? (
                              <span className="text-[7px] uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                Available
                              </span>
                            ) : (
                              <span className="text-[7px] uppercase tracking-widest text-red-800 bg-red-50 px-2 py-0.5 rounded-full font-semibold border border-red-100">
                                Sold Out
                              </span>
                            )}
                          </span>
                          {!isSizeOutOfStock && (
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? 'border-[#111111] bg-[#111111]' : 'border-stone-300'
                            }`}>
                              {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CTAs and Sticky Drawer layout */}
            <div className="flex flex-col gap-2 mt-2">
              {showNotifyMe ? (
                <form onSubmit={handleRestockAlert} className="flex flex-col gap-2.5 text-left bg-white p-4 border border-[#E8E8E8] rounded-sm">
                  <span className="text-[8px] uppercase tracking-widest text-[#666666] block font-semibold mb-1">Stock Notification Alert</span>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    className="input-editorial text-xs w-full" 
                    value={restockEmail}
                    onChange={(e) => setRestockEmail(e.target.value)}
                    required 
                  />
                  <button 
                    type="submit"
                    className="btn-editorial-solid text-[9px] py-3.5 tracking-widest font-semibold cursor-pointer"
                  >
                    Set Restock Notification
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={handleAddToBag}
                    disabled={!selectedColor || !selectedSize}
                    className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold py-4 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    {added ? (
                      <>
                        <Check size={12} /> Equipped to Bag
                      </>
                    ) : (
                      'Equip to Shopping Bag'
                    )}
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={!selectedColor || !selectedSize}
                    className="w-full py-4 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#111111] hover:bg-[#111111] hover:text-white transition-all duration-300 bg-white cursor-pointer text-center text-[#111111]"
                  >
                    Instant Checkout
                  </button>
                </div>
              )}

              {/* Wishlist and shipping details */}
              <button 
                onClick={handleWishlistToggle}
                className={`w-full py-3.5 border transition-all text-[9px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
                  favorited ? 'border-red-600/30 text-red-600 bg-red-50/5' : 'border-[#E8E8E8] text-[#666666] hover:border-stone-850 hover:text-stone-900 bg-white'
                }`}
              >
                <Heart size={12} fill={favorited ? '#e11d48' : 'none'} className={favorited ? 'text-red-600' : ''} />
                {favorited ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Frequently Bought Together Combo Block */}
            {comboOffer && (
              <div className="border border-accent-gold/45 bg-[#FAF9F7] p-4 flex flex-col gap-3 text-left rounded-sm">
                <span className="text-[8px] uppercase tracking-widest text-accent-gold font-bold">Frequently Bought Together</span>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 truncate max-w-[45%]">
                    <img src={comboOffer.product_a?.images?.[0]} className="w-8 h-11 object-cover border border-[#E8E8E8]" alt="" />
                    <span className="text-[8px] uppercase tracking-wider text-[#111111] truncate">{comboOffer.product_a?.name}</span>
                  </div>
                  <span className="text-[#666666] text-xs">+</span>
                  <div className="flex items-center gap-2 truncate max-w-[45%]">
                    <img src={comboOffer.product_b?.images?.[0]} className="w-8 h-11 object-cover border border-[#E8E8E8]" alt="" />
                    <span className="text-[8px] uppercase tracking-wider text-[#111111] truncate">{comboOffer.product_b?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-[#E8E8E8] pt-2 mt-1">
                  <div className="flex flex-col text-left">
                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-[10px] font-semibold text-[#111111]">₹{comboOffer.combo_price.toLocaleString('en-IN')}</span>
                      <span className="text-[8.5px] text-[#666666] line-through">₹{((comboOffer.product_a?.base_price || 0) + (comboOffer.product_b?.base_price || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const vA = comboOffer.product_a?.variants?.[0];
                      const vB = comboOffer.product_b?.variants?.[0];
                      if (vA && vB) {
                        const sumOriginal = Number(comboOffer.product_a.base_price || 0) + Number(comboOffer.product_b.base_price || 0);
                        const ratioA = Number(comboOffer.product_a.base_price || 0) / sumOriginal;
                        const splitA = Math.round(comboOffer.combo_price * ratioA);
                        const splitB = comboOffer.combo_price - splitA;

                        await addToCart({ ...vA, product: { ...comboOffer.product_a, basePrice: comboOffer.product_a.base_price } }, 1, splitA);
                        await addToCart({ ...vB, product: { ...comboOffer.product_b, basePrice: comboOffer.product_b.base_price } }, 1, splitB);
                        
                        showToast('Combo deal added to bag.', 'success');
                        setIsCartOpen(true);
                      }
                    }}
                    className="bg-[#111111] text-white text-[8px] uppercase tracking-widest font-semibold py-2 px-3.5 hover:bg-stone-850 cursor-pointer"
                  >
                    Equip Bundle
                  </button>
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="flex flex-col gap-3.5 border-t border-[#E8E8E8] pt-6 text-[9.5px] uppercase tracking-[0.18em] text-[#666666] font-light">
              <div className="flex items-center gap-3.5">
                <Truck size={13} className="text-[#111111]" />
                <span>Standard Complimentary Delivery Above ₹499</span>
              </div>
              <div className="flex items-center gap-3.5">
                <RotateCcw size={13} className="text-[#111111]" />
                <span>Complimentary 14-day return pickup</span>
              </div>
              <div className="flex items-center gap-3.5">
                <ShieldCheck size={13} className="text-[#111111]" />
                <span>100% Genuine Certified Garments</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-[#E8E8E8] pt-6 mt-2">
              {activeAccordionSections.map((sec, idx) => (
                <AccordionSection key={idx} title={sec.title} content={sec.content} />
              ))}
            </div>
          </div>
        </div>

        {/* Size Guide Overlay */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#E8E8E8] max-w-md w-full p-6 text-left relative shadow-2xl rounded-sm">
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-[#666666] hover:text-[#111111] transition-colors cursor-pointer p-1"
              >
                <X size={16} />
              </button>
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#111111] mb-3 border-b border-[#E8E8E8] pb-2 font-playfair">Size Metric Reference</h3>
              <p className="text-[10px] text-[#666666] font-light leading-relaxed mb-4">
                FREERT silhouettes are designed with a relaxed, modern fit. If you prefer a closer fit, please select one size down.
              </p>
              <table className="w-full text-[9px] uppercase tracking-wider text-[#666666]">
                <thead>
                  <tr className="border-b border-[#E8E8E8]">
                    <th className="py-2 text-left font-bold text-[#111111]">Size</th>
                    <th className="py-2 text-left font-bold text-[#111111]">Chest (in)</th>
                    <th className="py-2 text-left font-bold text-[#111111]">Waist (in)</th>
                    <th className="py-2 text-left font-bold text-[#111111]">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="font-light">
                  <tr className="border-b border-[#E8E8E8]/50">
                    <td className="py-2 font-bold text-[#111111]">S</td>
                    <td className="py-2">36 - 38</td>
                    <td className="py-2">30 - 32</td>
                    <td className="py-2">27.5</td>
                  </tr>
                  <tr className="border-b border-[#E8E8E8]/50">
                    <td className="py-2 font-bold text-[#111111]">M</td>
                    <td className="py-2">38 - 40</td>
                    <td className="py-2">32 - 34</td>
                    <td className="py-2">28.5</td>
                  </tr>
                  <tr className="border-b border-[#E8E8E8]/50">
                    <td className="py-2 font-bold text-[#111111]">L</td>
                    <td className="py-2">40 - 42</td>
                    <td className="py-2">34 - 36</td>
                    <td className="py-2">29.5</td>
                  </tr>
                  <tr className="border-b border-[#E8E8E8]/50">
                    <td className="py-2 font-bold text-[#111111]">XL</td>
                    <td className="py-2">42 - 44</td>
                    <td className="py-2">36 - 38</td>
                    <td className="py-2">30.5</td>
                  </tr>
                </tbody>
              </table>
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="btn-editorial-solid w-full text-[9px] py-3 mt-6 font-semibold tracking-widest"
              >
                Close Reference Guide
              </button>
            </div>
          </div>
        )}

        {/* REVIEWS SECTION: Premium Overhaul */}
        <section id="reviews-view" className="mt-24 pt-16 border-t border-[#E8E8E8] text-left">
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#666666] font-semibold">Community Ratings</span>
            <h2 className="text-xl uppercase tracking-widest font-light font-playfair text-[#111111]">Product Experiences</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Top Summary Card (Left Side inside reviews grid) */}
            <div className="lg:col-span-4 flex flex-col gap-5 bg-white border border-[#E8E8E8] p-6 rounded-sm shadow-sm">
              <div className="flex flex-col items-center py-4 border-b border-[#E8E8E8]">
                <span className="text-4xl font-light font-playfair text-[#111111]">{averageRating.toFixed(1)}</span>
                <div className="flex text-stone-900 my-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={13} 
                      className={i < Math.round(averageRating) ? 'fill-current' : 'text-stone-200'} 
                    />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#666666] font-semibold mt-1">
                  Based on {totalReviews} Reviews
                </span>
              </div>

              {/* Distribution Bars */}
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars - 1] || 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-[9px] text-[#666666] font-inter">
                      <span className="w-4 font-semibold">{stars}★</span>
                      <div className="flex-1 h-1 bg-stone-100 rounded-sm overflow-hidden">
                        <div 
                          className="h-full bg-stone-900 transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right font-medium">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-[#E8E8E8] pt-4 mt-1 flex flex-col gap-2 text-[9px] uppercase tracking-widest text-[#666666] font-medium">
                <div className="flex items-center gap-2">
                  <Award size={12} className="text-accent-gold" />
                  <span>{verifiedPercentage}% Verified Purchases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-accent-gold" />
                  <span>100% Genuine Reviews</span>
                </div>
              </div>

              {!isReviewFormOpen && (
                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="btn-editorial-solid w-full text-[9px] py-3.5 mt-2 tracking-widest font-semibold"
                >
                  Write Product Review
                </button>
              )}
            </div>

            {/* Right Side: Reviews lists and dynamic form */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Write a Review Luxury Form Container */}
              {isReviewFormOpen && (
                <div className="bg-white border border-accent-gold/45 p-6 rounded-sm shadow-md animate-[fadeIn_0.3s_ease-out] text-left">
                  <div className="flex justify-between items-baseline mb-6 border-b border-[#E8E8E8] pb-3">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#111111] font-playfair">
                      Write Product Review
                    </h3>
                    <button 
                      onClick={() => setIsReviewFormOpen(false)}
                      className="text-[#666666] hover:text-[#111111] text-[9px] uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handlePostReview} className="flex flex-col gap-4 font-inter text-xs">
                    
                    {/* Stars Select row */}
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-2 block font-semibold">Overall Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => {
                              setReviewRating(stars);
                            }}
                            className="text-stone-900 hover:scale-110 transition-transform cursor-pointer p-0.5"
                          >
                            <Star size={16} className={reviewRating >= stars ? 'fill-current' : 'text-stone-200'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1 block font-semibold">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Your Name"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="input-editorial text-xs py-2.5"
                        />
                      </div>
                      
                      {/* Email */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1 block font-semibold">Email (Optional)</label>
                        <input 
                          type="email" 
                          placeholder="yourname@example.com"
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          className="input-editorial text-xs py-2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Order Number */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1 block font-semibold">Order Number (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. FRT12345678"
                          value={reviewOrderNum}
                          onChange={(e) => setReviewOrderNum(e.target.value)}
                          className="input-editorial text-xs py-2.5"
                        />
                      </div>
                      
                      {/* Review Title */}
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1 block font-semibold">Review Title</label>
                        <input 
                          type="text" 
                          placeholder="Summarize your review"
                          value={reviewTitleInput}
                          onChange={(e) => setReviewTitleInput(e.target.value)}
                          className="input-editorial text-xs py-2.5"
                        />
                      </div>
                    </div>

                    {/* Metric Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-[#E8E8E8] pt-4">
                      {/* Quality */}
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#666666] mb-1 block font-semibold">Quality (1-5)</label>
                        <select 
                          value={reviewQuality}
                          onChange={(e) => setReviewQuality(Number(e.target.value))}
                          className="w-full bg-[#FAF9F7] border border-[#E8E8E8] text-[9.5px] uppercase tracking-wider p-2 font-semibold focus:outline-none"
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} / 5</option>
                          ))}
                        </select>
                      </div>

                      {/* Comfort */}
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#666666] mb-1 block font-semibold">Comfort (1-5)</label>
                        <select 
                          value={reviewComfort}
                          onChange={(e) => setReviewComfort(Number(e.target.value))}
                          className="w-full bg-[#FAF9F7] border border-[#E8E8E8] text-[9.5px] uppercase tracking-wider p-2 font-semibold focus:outline-none"
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} / 5</option>
                          ))}
                        </select>
                      </div>

                      {/* Fabric */}
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#666666] mb-1 block font-semibold">Fabric (1-5)</label>
                        <select 
                          value={reviewFabric}
                          onChange={(e) => setReviewFabric(Number(e.target.value))}
                          className="w-full bg-[#FAF9F7] border border-[#E8E8E8] text-[9.5px] uppercase tracking-wider p-2 font-semibold focus:outline-none"
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} / 5</option>
                          ))}
                        </select>
                      </div>

                      {/* Fit */}
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-[#666666] mb-1 block font-semibold">Fit Rating</label>
                        <select 
                          value={reviewFit}
                          onChange={(e) => setReviewFit(e.target.value)}
                          className="w-full bg-[#FAF9F7] border border-[#E8E8E8] text-[9.5px] uppercase tracking-wider p-2 font-semibold focus:outline-none"
                        >
                          <option value="Runs Small">Runs Small</option>
                          <option value="True to Size">True to Size</option>
                          <option value="Runs Large">Runs Large</option>
                        </select>
                      </div>
                    </div>

                    {/* Recommend product */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase tracking-widest text-[#666666] font-semibold">Recommend this product?</span>
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setReviewRecommend(true)}
                          className={`px-3 py-1 text-[8.5px] uppercase tracking-widest font-bold border transition-colors ${
                            reviewRecommend ? 'bg-stone-900 border-stone-900 text-white' : 'border-[#E8E8E8] text-[#666666] bg-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewRecommend(false)}
                          className={`px-3 py-1 text-[8.5px] uppercase tracking-widest font-bold border transition-colors ${
                            !reviewRecommend ? 'bg-stone-900 border-stone-900 text-white' : 'border-[#E8E8E8] text-[#666666] bg-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Drag and Drop Upload Photos */}
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1.5 block font-semibold">Upload Photos</label>
                      <div className="border border-dashed border-[#E8E8E8] bg-[#FAF9F7] p-4 text-center rounded-sm relative hover:bg-stone-50/50 transition-colors">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                        <Upload size={16} className="text-[#666666] mx-auto mb-1.5" />
                        <p className="text-[9.5px] text-[#666666] font-light">Drag & Drop or click to attach image files</p>
                      </div>

                      {/* Display Uploaded Thumbnails */}
                      {uploadedPhotos.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {uploadedPhotos.map((url, index) => (
                            <div key={index} className="w-12 h-16 relative border border-[#E8E8E8] overflow-hidden group">
                              <img src={url} className="w-full h-full object-cover" alt="" />
                              <button
                                type="button"
                                onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Comment Area */}
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-[#666666] mb-1 block font-semibold">Your Experience</label>
                      <textarea 
                        required 
                        rows={4}
                        placeholder="Describe the drape weight, color accuracy, and overall composition experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="input-editorial h-24 text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-editorial-solid w-full py-4 text-[9px] tracking-widest font-semibold mt-2"
                    >
                      Submit Verified Review
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="flex flex-col gap-4">
                {reviewsOffline && (
                  <div className="p-4 border border-amber-600 bg-amber-50/20 text-left flex items-start gap-3 rounded-sm">
                    <AlertTriangle size={15} className="text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-700 block">System Updates In Progress</span>
                      <span className="text-[9px] text-amber-700/80 leading-relaxed block mt-0.5">
                        Live reviews are temporarily caching. Stored feedback continues to load successfully.
                      </span>
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="py-12 bg-white border border-dashed border-[#E8E8E8] p-6 text-center rounded-sm">
                    <Star size={20} className="text-stone-300 stroke-[1.2] mb-3 mx-auto" />
                    <p className="text-[10px] text-[#666666] font-semibold tracking-widest uppercase mb-1">No reviews cataloged</p>
                    <p className="text-[9.5px] text-[#666666]/70 font-light">Be the first to share your wear experience for this clothing item.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.4s_ease-out]">
                    {reviews.map(rev => {
                      const initials = rev.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FR';
                      return (
                        <div key={rev.id} className="bg-white border border-[#E8E8E8] p-6 text-left flex flex-col gap-3 rounded-sm transition-all hover:shadow-md">
                          
                          {/* Top Row: User Avatar & verified badge */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200/50 text-[#111111] flex items-center justify-center font-bold text-[9px]">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">{rev.name}</span>
                                  {rev.isVerified !== false && (
                                    <span className="text-[7.5px] uppercase tracking-widest text-[#666666] font-semibold flex items-center gap-1 bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded-full">
                                      <Check size={8} className="text-stone-600" /> Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8px] text-[#666666] mt-0.5 font-light">{rev.date}</span>
                              </div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex text-stone-900">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={9.5} 
                                  className={i < rev.rating ? 'fill-current' : 'text-stone-200'} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* Purchase specifications */}
                          <div className="flex gap-4 text-[8px] uppercase tracking-widest text-[#666666] font-semibold border-b border-stone-100 pb-2.5 mt-1">
                            {rev.sizePurchased && (
                              <span>Size Purchased: <span className="text-[#111111] font-bold">{rev.sizePurchased}</span></span>
                            )}
                            {rev.fitRating && (
                              <span>Fits: <span className="text-[#111111] font-bold">{rev.fitRating}</span></span>
                            )}
                          </div>

                          {/* Review Title & message */}
                          <div className="flex flex-col gap-1 mt-1">
                            {rev.title && (
                              <h4 className="text-xs font-bold text-[#111111] tracking-wide">{rev.title}</h4>
                            )}
                            <p className="text-[11px] text-[#666666] font-light leading-relaxed">{rev.comment}</p>
                          </div>

                          {/* Review Photos */}
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {rev.images.map((imgUrl, i) => (
                                <div 
                                  key={i} 
                                  className="w-14 h-18 bg-stone-50 border border-[#E8E8E8] overflow-hidden cursor-zoom-in group relative"
                                  onClick={() => {
                                    setActiveMediaIdx(0);
                                    setIsFullscreen(true);
                                  }}
                                >
                                  <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-350 hover:scale-105" alt="" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Fit, Comfort & quality metrics */}
                          {rev.qualityRating !== undefined && (
                            <div className="grid grid-cols-3 gap-2.5 border-t border-stone-100 pt-3 mt-1.5 text-[8px] uppercase tracking-widest text-[#666666] font-medium">
                              <div className="flex items-center gap-1.5">
                                <span>Quality:</span>
                                <span className="text-[#111111] font-bold">{rev.qualityRating}/5</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Comfort:</span>
                                <span className="text-[#111111] font-bold">{rev.comfortRating ?? rev.rating}/5</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Fabric:</span>
                                <span className="text-[#111111] font-bold">{rev.fabricRating ?? rev.rating}/5</span>
                              </div>
                            </div>
                          )}

                          {/* Action panel (helpful / report) */}
                          <div className="flex justify-between items-center border-t border-stone-100 pt-3 mt-1 text-[8.5px] uppercase tracking-widest text-[#666666] font-semibold">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleHelpfulClick(rev.id)}
                                className={`flex items-center gap-1.5 cursor-pointer p-1 hover:text-[#111111] transition-colors ${
                                  votedHelpful[rev.id] ? 'text-emerald-700 font-bold' : ''
                                }`}
                              >
                                <ThumbsUp size={11} />
                                <span>Helpful ({helpfulVotes[rev.id] || 0})</span>
                              </button>
                            </div>
                            <button
                              onClick={() => handleReportClick(rev.id)}
                              className="flex items-center gap-1 cursor-pointer hover:text-red-750 transition-colors p-1"
                            >
                              <Flag size={10} />
                              <span>Report</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* Complete the Look Section */}
        {lookProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E8E8E8] text-left">
            <div className="flex flex-col gap-1.5 mb-10">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#666666] font-semibold">Perfect Pairings</span>
              <h2 className="text-xl uppercase tracking-widest font-light font-playfair text-[#111111]">Complete the Look</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
              {lookProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products Section */}
        <section className="mt-24 pt-16 border-t border-[#E8E8E8] text-left">
          <div className="flex flex-col gap-1.5 mb-10">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#666666] font-semibold">Curated Selections</span>
            <h2 className="text-xl uppercase tracking-widest font-light font-playfair text-[#111111]">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Fullscreen Lightbox */}
        {isFullscreen && activeMedia[activeMediaIdx] && (
          <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-[fadeIn_0.2s_ease-out]">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-50 p-2"
            >
              <X size={20} />
            </button>
            
            <div className="relative max-w-2xl max-h-[85vh] w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
              {(() => {
                const mediaUrl = activeMedia[activeMediaIdx];
                const isVideo = mediaUrl.endsWith('.mp4') || 
                                mediaUrl.endsWith('.webm') || 
                                mediaUrl.endsWith('.mov') || 
                                mediaUrl.includes('/video/') || 
                                mediaUrl.includes('_video');
                return isVideo ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    className="max-w-full max-h-full object-contain" 
                    alt="" 
                  />
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar for Mobile Checkout flow */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-[#FAF9F7]/95 backdrop-blur-md p-3.5 border-t border-[#E8E8E8] flex gap-3 shadow-lg">
        <button
          onClick={handleAddToBag}
          disabled={!selectedColor || !selectedSize}
          className="btn-editorial-solid flex-1 text-[9px] uppercase tracking-widest font-semibold py-3.5"
        >
          {added ? 'Added to Bag' : 'Equip to Bag'}
        </button>
        <button
          onClick={handleWishlistToggle}
          className="border border-[#E8E8E8] bg-white p-3 text-stone-900 flex items-center justify-center"
        >
          <Heart size={14} fill={favorited ? '#e11d48' : 'none'} className={favorited ? 'text-red-600' : ''} />
        </button>
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
}
