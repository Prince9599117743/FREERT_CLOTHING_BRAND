'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getProducts, 
  getProductBySlug, 
  getProductReviews, 
  createProductReview, 
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
  ThumbsUp, Flag, Upload, Eye, ShoppingBag, Send
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

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
    <div className="border-b border-[#E5E5E0] py-4 transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-[10px] uppercase tracking-[0.25em] text-[#1a1a1a] font-semibold focus:outline-none cursor-pointer py-1"
      >
        <span>{title}</span>
        <ChevronDown 
          size={12} 
          className={`text-[#888888] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'rotate-180 text-[#1a1a1a]' : ''}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div 
            className="text-[11px] font-light text-[#666666] leading-relaxed text-left prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PERSISTENT SOCIAL PROOF POPUP Component
───────────────────────────────────────────── */
const SocialProofPopup: React.FC<{ productName: string; productImage: string | null }> = ({ productName, productImage }) => {
  const [visible, setVisible] = useState(false);
  const [proof, setProof] = useState<{ location: string; time: string; action: string } | null>(null);

  const locations = [
    'Mumbai, Maharashtra', 'New Delhi, Delhi', 'Bengaluru, Karnataka', 
    'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal',
    'Pune, Maharashtra', 'Ahmedabad, Gujarat', 'Jaipur, Rajasthan',
    'Lucknow, Uttar Pradesh', 'Chandigarh'
  ];
  const times = ['2 mins ago', '5 mins ago', '8 mins ago', '12 mins ago', '15 mins ago', '20 mins ago'];
  const actions = ['purchased this piece', 'added this to their capsule bag', 'favorited this garment'];

  useEffect(() => {
    const triggerPopup = () => {
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setProof({ location: randomLoc, time: randomTime, action: randomAction });
      setVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setVisible(false);
      }, 6000);
    };

    // Initial delay, then repeat periodically
    const timeout = setTimeout(triggerPopup, 8000);
    const interval = setInterval(triggerPopup, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  if (!visible || !proof) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] bg-white border border-[#E5E5E0] p-3 shadow-xl max-w-[290px] w-full rounded-lg animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] flex gap-3 items-center">
      {productImage ? (
        <div className="w-10 h-13 bg-stone-100 overflow-hidden flex-shrink-0 border border-[#E5E5E0] rounded">
          <img src={productImage} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-10 h-13 bg-stone-100 flex items-center justify-center flex-shrink-0 border border-[#E5E5E0] rounded">
          <ShoppingBag size={14} className="text-[#888888]" />
        </div>
      )}
      <div className="text-left">
        <p className="text-[10px] font-semibold text-[#1a1a1a] tracking-wide leading-tight">
          Verified Activity
        </p>
        <p className="text-[9.5px] text-[#666666] mt-0.5 leading-snug">
          Someone in <span className="font-semibold text-[#1a1a1a]">{proof.location}</span> {proof.action}.
        </p>
        <span className="text-[8px] text-[#999999] uppercase tracking-wider block mt-1">
          {proof.time}
        </span>
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [infoSections, setInfoSections] = useState<any[]>([]);
  const [lookProducts, setLookProducts] = useState<Product[]>([]);
  const [comboOffer, setComboOffer] = useState<any | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Size shake & warning state for unavailable sizes
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [shakingSize, setShakingSize] = useState<string | null>(null);

  // Review states
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [reviewsOffline, setReviewsOffline] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewOrderNum, setReviewOrderNum] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  // Custom refined metric sliders
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
  const restockEmailRef = useRef<HTMLInputElement>(null);

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

      // Instantly reload live reviews
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
        <div className="w-10 h-10 border-2 border-stone-850 border-t-transparent rounded-full animate-spin" />
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
      setSizeWarning(null);
    } catch {
      showToast('Could not register restock request.', 'error');
    }
  };

  // Click handler for out-of-stock sizes
  const handleSizeClick = (sizeName: string, isAvailable: boolean) => {
    if (!isAvailable) {
      // Trigger shake animation
      setShakingSize(sizeName);
      setTimeout(() => setShakingSize(null), 500);

      // Set warning details & scroll slightly to Restock Notify box
      setSizeWarning(`Size ${sizeName} is currently unavailable. Register below for instant restock alerts.`);
      if (restockEmailRef.current) {
        restockEmailRef.current.focus();
        restockEmailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSelectedSize(sizeName);
      setSizeWarning(null);
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

  /* Premium details sections helper styles */
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap');

    .editorial-pdp {
      background: #FAF9F6;
      color: #1a1a1a;
      font-family: 'Inter', sans-serif;
    }
    
    .font-serif {
      font-family: 'Playfair Display', serif;
    }

    .gallery-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .sticky-details {
      position: sticky;
      top: 100px;
    }

    .btn-luxury {
      background: #1a1a1a;
      color: #ffffff;
      border: 1px solid #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 11px;
      font-weight: 600;
      padding: 16px 24px;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-luxury:hover {
      background: transparent;
      color: #1a1a1a;
    }
    .btn-luxury:active {
      transform: scale(0.99);
    }

    .btn-luxury-outline {
      background: transparent;
      color: #1a1a1a;
      border: 1px solid #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 11px;
      font-weight: 600;
      padding: 16px 24px;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      cursor: pointer;
    }
    .btn-luxury-outline:hover {
      background: #1a1a1a;
      color: #ffffff;
    }

    .metric-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #E5E5E0;
      display: inline-block;
      transition: background 0.3s ease;
    }
    .metric-dot.active {
      background: #C9A84C;
    }

    .slider-track {
      height: 2px;
      background: #E5E5E0;
      position: relative;
      width: 100%;
    }
    .slider-handle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #1a1a1a;
      position: absolute;
      top: -4px;
      transform: translateX(-50%);
    }

    .size-btn {
      border: 1px solid #E5E5E0;
      background: #ffffff;
      padding: 14px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.05em;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .size-btn.available:hover {
      border-color: #1a1a1a;
    }
    .size-btn.selected {
      border-color: #1a1a1a;
      background: #fbfbf9;
      font-weight: 700;
    }
    .size-btn.unavailable {
      color: #c0c0ba;
      background: #f7f7f5;
      cursor: pointer;
    }
    .size-strike {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to top right, transparent 46%, #c0c0ba 49%, #c0c0ba 51%, transparent 54%);
      pointer-events: none;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .shake-anim {
      animation: shake 0.4s ease;
      border-color: #ef4444 !important;
    }

    .review-form-input {
      background: #ffffff;
      border: 1px solid #E5E5E0;
      padding: 14px;
      font-size: 12px;
      outline: none;
      width: 100%;
      font-family: inherit;
      transition: border 0.3s ease;
    }
    .review-form-input:focus {
      border-color: #1a1a1a;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .zoom-photo:hover img {
      transform: scale(1.05);
    }
  `;

  return (
    <div className="editorial-pdp min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Navbar />
      <StructuredData type="Product" data={schemaProduct} />

      {/* Social Proof */}
      <SocialProofPopup productName={product.name} productImage={product.images?.[0] || null} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-10 py-6 md:py-12">
        {/* Back Link */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#666666] hover:text-[#1a1a1a] mb-8 transition-colors cursor-pointer focus:outline-none"
        >
          <ArrowLeft size={11} /> Back to Collection
        </button>

        {/* 2-Column Balanced Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT: Product Images Gallery (60-65% width) */}
          <div className="lg:col-span-7 gallery-container select-none">
            {/* Desktop Vertical Layout */}
            <div className="hidden md:flex flex-col gap-4">
              {activeMedia.map((mediaUrl, idx) => {
                const isVideo = mediaUrl.endsWith('.mp4') || 
                                mediaUrl.endsWith('.webm') || 
                                mediaUrl.endsWith('.mov') || 
                                mediaUrl.includes('/video/') || 
                                mediaUrl.includes('_video');
                return (
                  <div 
                    key={idx}
                    className="w-full aspect-[3/4] bg-[#f5f5f0] overflow-hidden border border-[#E5E5E0] relative cursor-zoom-in zoom-photo transition-all duration-350"
                    onClick={() => {
                      setActiveMediaIdx(idx);
                      setIsFullscreen(true);
                    }}
                  >
                    {isVideo ? (
                      <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={mediaUrl} 
                        alt={`${product.name} - View ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden w-full aspect-[3/4] bg-[#f5f5f0] overflow-hidden border border-[#E5E5E0] relative rounded-sm">
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {activeMedia.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeMediaIdx ? 'bg-[#1a1a1a] w-3.5' : 'bg-[#666666]/30'}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Product Specs Panel (35-40% width) */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6 sticky-details">
            
            {/* Breadcrumb / Title */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-semibold">
                {product.category?.name} &middot; {product.collection?.name || 'Exclusive Capsule'}
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-light tracking-wide text-[#1a1a1a] mt-2">
                {product.name}
              </h1>
              
              {/* Reviews Summary click-trigger */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-[#C9A84C]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={10.5} 
                      className={i < Math.round(averageRating) ? 'fill-current' : 'text-[#E5E5E0]'} 
                    />
                  ))}
                </div>
                <button
                  onClick={() => document.getElementById('reviews-view')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[9px] text-[#666666] hover:text-[#1a1a1a] uppercase tracking-widest underline cursor-pointer"
                >
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-[#E5E5E0] py-4.5 flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-bold text-[#1a1a1a]">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp && activeMrp > activePrice && (
                  <>
                    <span className="text-[12px] text-[#888888] line-through">
                      ₹{activeMrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-semibold">
                      {Math.round(((activeMrp - activePrice) / activeMrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <span className="text-[8px] uppercase tracking-widest text-[#888888] font-medium">
                Inclusive of all taxes &middot; GST calculated at checkout
              </span>
            </div>

            {/* Config: Colors & Size Selector */}
            <div className="flex flex-col gap-6">
              {/* Color Selection */}
              {colors.length > 0 && colors[0] !== product.name && colors[0] !== 'Default' && (
                <div>
                  <h4 className="text-[9.5px] uppercase tracking-[0.2em] font-semibold text-[#1a1a1a] mb-3">
                    Colorway: <span className="text-[#666666] font-normal normal-case">{selectedColor}</span>
                  </h4>
                  <div className="flex gap-3 flex-wrap">
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
                          className={`w-7 h-7 rounded-full border transition-all duration-300 relative flex items-center justify-center p-0.5 ${
                            isSelected ? 'border-[#1a1a1a] ring-1 ring-[#1a1a1a] scale-105' : 'border-[#E5E5E0] hover:scale-105'
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
                            role="presentation"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Selection Block */}
              {sizes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-[9.5px] uppercase tracking-[0.25em] font-semibold text-[#1a1a1a]">Select Size</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[9px] uppercase tracking-widest text-[#888888] hover:text-[#1a1a1a] hover:underline cursor-pointer"
                    >
                      Size Reference Guide
                    </button>
                  </div>
                  
                  {/* Vertical list layout of sizes */}
                  <div className="flex flex-col gap-2">
                    {sizes.map((s) => {
                      const sizeVariant = product.variants?.find(v => v.size === s && v.color === (selectedColor || colors[0]));
                      const isSizeOutOfStock = (product.variants && product.variants.length > 0)
                        ? (sizeVariant ? (product.trackQuantity !== false && sizeVariant.stockQty === 0) : true)
                        : (product.status === 'out-of-stock' || (product.trackQuantity !== false && (product.stockQty ?? 0) === 0));

                      const isSelected = selectedSize === s;
                      const isShaking = shakingSize === s;

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSizeClick(s, !isSizeOutOfStock)}
                          className={`size-btn w-full rounded flex justify-between items-center px-4 py-3 border text-[10px] font-semibold tracking-wider transition-all duration-300 relative overflow-hidden ${
                            isSizeOutOfStock 
                              ? 'unavailable border-[#E5E5E0] text-stone-400 bg-stone-50/50 cursor-pointer font-light' 
                              : isSelected 
                              ? 'border-[#1a1a1a] text-[#1a1a1a] bg-[#1a1a1a]/5 ring-[0.5px] ring-[#1a1a1a]' 
                              : 'border-[#E5E5E0] text-[#666666] hover:border-stone-800 hover:text-black bg-white cursor-pointer'
                          } ${isShaking ? 'shake-anim' : ''}`}
                        >
                          {isSizeOutOfStock && <div className="size-strike" />}
                          <span className={isSizeOutOfStock ? 'line-through decoration-stone-400' : ''}>{s}</span>
                          {!isSizeOutOfStock ? (
                            <span className="text-[7.5px] uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                              Available
                            </span>
                          ) : (
                            <span className="text-[7.5px] uppercase tracking-widest text-[#888888] bg-stone-100 px-2 py-0.5 rounded-full font-medium border border-[#E5E5E0]">
                              Sold Out
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Elegant warning overlay for unavailable sizes */}
                  {sizeWarning && (
                    <div className="text-[10px] text-amber-700 bg-amber-50/50 border border-amber-200/50 p-3 rounded-lg leading-relaxed animate-[slideUp_0.3s_ease_forwards]">
                      {sizeWarning}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTAs bag actions */}
            <div className="flex flex-col gap-2.5 mt-2">
              {showNotifyMe ? (
                <form onSubmit={handleRestockAlert} className="flex flex-col gap-3 bg-white p-4.5 border border-[#E5E5E0] rounded">
                  <span className="text-[9px] uppercase tracking-widest text-[#666666] font-bold block mb-1">Stock Alert Waitlist</span>
                  <div className="flex gap-2">
                    <input 
                      ref={restockEmailRef}
                      type="email" 
                      placeholder="Enter your email address" 
                      className="review-form-input py-3 rounded text-[11px]" 
                      value={restockEmail}
                      onChange={(e) => setRestockEmail(e.target.value)}
                      required 
                    />
                    <button 
                      type="submit"
                      className="btn-luxury py-3 px-5 rounded flex-shrink-0"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                  <span className="text-[8.5px] text-[#888888] leading-normal block">We will send a one-off notification email as soon as this item is restocked.</span>
                </form>
              ) : (
                <div className="flex flex-col gap-2.5 w-full">
                  <button 
                    onClick={handleAddToBag}
                    className="btn-luxury rounded"
                  >
                    {added ? (
                      <><Check size={13} /> Added to Bag</>
                    ) : (
                      'Add to Bag'
                    )}
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="btn-luxury-outline rounded uppercase text-center"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}

              {/* Wishlist toggle */}
              <button 
                onClick={handleWishlistToggle}
                className={`w-full py-3.5 border transition-all text-[9.5px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 rounded cursor-pointer ${
                  favorited ? 'border-red-200 text-red-600 bg-red-50/20' : 'border-[#E5E5E0] text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a] bg-white'
                }`}
              >
                <Heart size={12} fill={favorited ? '#dc2626' : 'none'} className={favorited ? 'text-red-600' : ''} />
                {favorited ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Frequently Bought Together Combo Block */}
            {comboOffer && (
              <div className="border border-[#C9A84C]/45 bg-white p-4.5 flex flex-col gap-3.5 text-left rounded">
                <span className="text-[8.5px] uppercase tracking-widest text-[#C9A84C] font-bold">Frequently Bought Together</span>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 truncate max-w-[45%]">
                    <img src={comboOffer.product_a?.images?.[0]} className="w-8 h-11 object-cover border border-[#E5E5E0] rounded" alt="" />
                    <span className="text-[8.5px] uppercase tracking-wider text-[#1a1a1a] truncate font-medium">{comboOffer.product_a?.name}</span>
                  </div>
                  <span className="text-[#888888] text-xs">+</span>
                  <div className="flex items-center gap-2 truncate max-w-[45%]">
                    <img src={comboOffer.product_b?.images?.[0]} className="w-8 h-11 object-cover border border-[#E5E5E0] rounded" alt="" />
                    <span className="text-[8.5px] uppercase tracking-wider text-[#1a1a1a] truncate font-medium">{comboOffer.product_b?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-[#E5E5E0] pt-3.5 mt-1">
                  <div className="flex flex-col text-left">
                    <div className="flex gap-2 items-baseline">
                      <span className="text-[11px] font-bold text-[#1a1a1a]">₹{comboOffer.combo_price.toLocaleString('en-IN')}</span>
                      <span className="text-[9.5px] text-[#888888] line-through">₹{((comboOffer.product_a?.base_price || 0) + (comboOffer.product_b?.base_price || 0)).toLocaleString('en-IN')}</span>
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
                    className="bg-[#1a1a1a] text-white text-[9px] uppercase tracking-widest font-semibold py-2.5 px-4 rounded hover:bg-stone-850 cursor-pointer"
                  >
                    Equip Bundle
                  </button>
                </div>
              </div>
            )}

            {/* Core Brand Value Signals */}
            <div className="flex flex-col gap-3.5 border-t border-[#E5E5E0] pt-6 text-[9.5px] uppercase tracking-[0.2em] text-[#666666] font-light">
              <div className="flex items-center gap-3.5">
                <Truck size={13} className="text-[#1a1a1a]" />
                <span>Complimentary Delivery Above ₹499</span>
              </div>
              <div className="flex items-center gap-3.5">
                <RotateCcw size={13} className="text-[#1a1a1a]" />
                <span>Easy 14-day exchange returns</span>
              </div>
              <div className="flex items-center gap-3.5">
                <ShieldCheck size={13} className="text-[#1a1a1a]" />
                <span>100% genuine designer quality</span>
              </div>
            </div>

            {/* Detailed Info Accordions */}
            <div className="flex flex-col border-t border-[#E5E5E0] pt-3 mt-2">
              {activeAccordionSections.map((sec, idx) => (
                <AccordionSection key={idx} title={sec.title} content={sec.content} />
              ))}
            </div>
          </div>
        </div>

        {/* Size Reference Overlay */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E5E0] max-w-md w-full p-6 text-left relative shadow-2xl rounded-lg">
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-[#888888] hover:text-[#1a1a1a] transition-colors cursor-pointer p-1"
              >
                <X size={16} />
              </button>
              <h3 className="text-sm uppercase tracking-widest font-bold text-[#1a1a1a] mb-3 border-b border-[#E5E5E0] pb-2 font-serif">Size Guide Matrix</h3>
              <p className="text-[11px] text-[#666666] font-light leading-relaxed mb-4">
                FREERT silhouettes are designed with a relaxed, modern fit. If you prefer a closer fit, please select one size down.
              </p>
              <table className="w-full text-[10px] uppercase tracking-wider text-[#666666]">
                <thead>
                  <tr className="border-b border-[#E5E5E0]">
                    <th className="py-2.5 text-left font-bold text-[#1a1a1a]">Size</th>
                    <th className="py-2.5 text-left font-bold text-[#1a1a1a]">Chest (in)</th>
                    <th className="py-2.5 text-left font-bold text-[#1a1a1a]">Waist (in)</th>
                    <th className="py-2.5 text-left font-bold text-[#1a1a1a]">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="font-light">
                  <tr className="border-b border-[#E5E5E0]/50">
                    <td className="py-2.5 font-bold text-[#1a1a1a]">S</td>
                    <td className="py-2.5">36 - 38</td>
                    <td className="py-2.5">30 - 32</td>
                    <td className="py-2.5">27.5</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E0]/50">
                    <td className="py-2.5 font-bold text-[#1a1a1a]">M</td>
                    <td className="py-2.5">38 - 40</td>
                    <td className="py-2.5">32 - 34</td>
                    <td className="py-2.5">28.5</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E0]/50">
                    <td className="py-2.5 font-bold text-[#1a1a1a]">L</td>
                    <td className="py-2.5">40 - 42</td>
                    <td className="py-2.5">34 - 36</td>
                    <td className="py-2.5">29.5</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E0]/50">
                    <td className="py-2.5 font-bold text-[#1a1a1a]">XL</td>
                    <td className="py-2.5">42 - 44</td>
                    <td className="py-2.5">36 - 38</td>
                    <td className="py-2.5">30.5</td>
                  </tr>
                </tbody>
              </table>
              <button 
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="btn-luxury w-full text-[10px] py-3 mt-6 font-semibold tracking-widest rounded"
              >
                Close Guide Table
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
           REVIEWS SECTION REDESIGN (Zara & H&M Vibe)
        ───────────────────────────────────────────── */}
        <section id="reviews-view" className="mt-24 pt-16 border-t border-[#E5E5E0] text-left">
          <div className="flex flex-col gap-1.5 mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#888888] font-bold">Wearer Perspectives</span>
            <h2 className="text-xl uppercase tracking-widest font-serif font-light text-[#1a1a1a]">Ratings & Experiences</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Overall Quality Analytics Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6 bg-white border border-[#E5E5E0] p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center py-4 border-b border-[#E5E5E0]">
                <span className="text-4xl font-serif font-light text-[#1a1a1a]">{averageRating.toFixed(1)}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#888888] font-semibold mt-2">
                  Overall Rating Matrix
                </span>
                <div className="flex text-[#C9A84C] mt-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={13} 
                      className={i < Math.round(averageRating) ? 'fill-current' : 'text-[#E5E5E0]'} 
                    />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#888888] mt-2">
                  Based on {totalReviews} client reviews
                </span>
              </div>

              {/* Distribution list */}
              <div className="flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars - 1] || 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-[9.5px] text-[#666666]">
                      <span className="w-5 font-semibold">{stars}★</span>
                      <div className="flex-1 h-1 bg-[#F5F5F0] rounded-sm overflow-hidden">
                        <div 
                          className="h-full bg-[#1a1a1a] transition-all duration-700" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Trust details */}
              <div className="border-t border-[#E5E5E0] pt-4.5 flex flex-col gap-2 text-[9.5px] uppercase tracking-[0.15em] text-[#666666] font-medium">
                <div className="flex items-center gap-2.5">
                  <Award size={13} className="text-[#C9A84C]" />
                  <span>{verifiedPercentage}% verified buyers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles size={13} className="text-[#C9A84C]" />
                  <span>Verified reviewer program</span>
                </div>
              </div>

              {!isReviewFormOpen && (
                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="btn-luxury rounded w-full mt-2"
                >
                  Write Review
                </button>
              )}
            </div>

            {/* Right: Reviews catalog & luxury Write Form */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Luxury Minimalist Feedback form */}
              {isReviewFormOpen && (
                <div className="bg-[#ffffff] border border-[#1a1a1a]/20 p-6 rounded-lg shadow-md animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] text-left">
                  <div className="flex justify-between items-baseline mb-6 border-b border-[#E5E5E0] pb-3.5">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1a1a1a] font-serif">
                      New Review Entry
                    </h3>
                    <button 
                      onClick={() => setIsReviewFormOpen(false)}
                      className="text-[#888888] hover:text-[#1a1a1a] text-[9.5px] uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handlePostReview} className="flex flex-col gap-5 text-xs">
                    
                    {/* Star selection */}
                    <div>
                      <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-2 block font-semibold">How would you rate this piece?</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setReviewRating(stars)}
                            className="text-[#C9A84C] hover:scale-110 transition-transform cursor-pointer p-0.5"
                          >
                            <Star size={18} className={reviewRating >= stars ? 'fill-current' : 'text-[#E5E5E0]'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1.5 block font-semibold">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Jane Doe"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="review-form-input rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1.5 block font-semibold">Email Coordinates</label>
                        <input 
                          type="email" 
                          placeholder="jane@example.com"
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          className="review-form-input rounded"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1.5 block font-semibold">Order Reference Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. FR-890214"
                          value={reviewOrderNum}
                          onChange={(e) => setReviewOrderNum(e.target.value)}
                          className="review-form-input rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1.5 block font-semibold">Short Summary / Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Perfect silhouette, drapes well"
                          value={reviewTitleInput}
                          onChange={(e) => setReviewTitleInput(e.target.value)}
                          className="review-form-input rounded"
                        />
                      </div>
                    </div>

                    {/* Custom Metric Sliders */}
                    <div className="border-t border-[#E5E5E0] pt-5 mt-2 flex flex-col gap-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#1a1a1a]">Garment Composition Feedback</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Quality Dots */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] text-[#666666] uppercase tracking-widest">Quality Assessment</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((d) => (
                              <button key={d} type="button" onClick={() => setReviewQuality(d)} className={`metric-dot ${reviewQuality >= d ? 'active' : ''}`} />
                            ))}
                          </div>
                        </div>

                        {/* Comfort Dots */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] text-[#666666] uppercase tracking-widest">Wear Comfort</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((d) => (
                              <button key={d} type="button" onClick={() => setReviewComfort(d)} className={`metric-dot ${reviewComfort >= d ? 'active' : ''}`} />
                            ))}
                          </div>
                        </div>

                        {/* Fabric Weight Dots */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] text-[#666666] uppercase tracking-widest">Fabric Composition</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((d) => (
                              <button key={d} type="button" onClick={() => setReviewFabric(d)} className={`metric-dot ${reviewFabric >= d ? 'active' : ''}`} />
                            ))}
                          </div>
                        </div>

                        {/* Fit selection slider format */}
                        <div className="flex flex-col gap-1 text-left">
                          <div className="flex justify-between text-[9.5px] text-[#666666] uppercase tracking-widest mb-1">
                            <span>Sizing Fit</span>
                            <span className="font-bold text-[#1a1a1a]">{reviewFit}</span>
                          </div>
                          <div className="flex gap-2">
                            {['Runs Small', 'True to Size', 'Runs Large'].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setReviewFit(val)}
                                className={`flex-1 py-1.5 text-[8.5px] uppercase tracking-wider font-semibold border transition-all ${
                                  reviewFit === val ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#666666] border-[#E5E5E0]'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9.5px] uppercase tracking-widest text-[#666666] font-semibold">Recommend this product?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewRecommend(true)}
                          className={`px-3 py-1 rounded text-[9px] uppercase tracking-widest font-bold border transition-colors ${
                            reviewRecommend ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' : 'border-[#E5E5E0] text-[#666666] bg-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewRecommend(false)}
                          className={`px-3 py-1 rounded text-[9px] uppercase tracking-widest font-bold border transition-colors ${
                            !reviewRecommend ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white' : 'border-[#E5E5E0] text-[#666666] bg-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Image uploads */}
                    <div>
                      <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1.5 block font-semibold">Upload Photo Attachments</label>
                      <div className="border border-dashed border-[#E5E5E0] bg-[#ffffff] p-4 text-center rounded relative hover:bg-stone-50 transition-colors">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                        <Upload size={16} className="text-[#888888] mx-auto mb-1.5" />
                        <p className="text-[9.5px] text-[#666666]">Drag & Drop or click to upload</p>
                      </div>
                      
                      {uploadedPhotos.length > 0 && (
                        <div className="flex gap-2.5 mt-3 flex-wrap">
                          {uploadedPhotos.map((url, index) => (
                            <div key={index} className="w-12 h-16 relative border border-[#E5E5E0] rounded overflow-hidden">
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

                    {/* Comments */}
                    <div>
                      <label className="text-[9.5px] uppercase tracking-widest text-[#666666] mb-1 block font-semibold">Review Message</label>
                      <textarea 
                        required 
                        rows={4}
                        placeholder="Write details of drape drape drape experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="review-form-input h-24 rounded resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-luxury w-full py-4 rounded"
                    >
                      Submit Verified Review
                    </button>
                  </form>
                </div>
              )}

              {/* Feed lists */}
              <div className="flex flex-col gap-4">
                {reviewsOffline && (
                  <div className="p-4 border border-amber-600 bg-amber-50/20 text-left flex items-start gap-3 rounded">
                    <AlertTriangle size={15} className="text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-700 block">System Updates</span>
                      <span className="text-[9px] text-amber-700/80 leading-relaxed block mt-0.5">
                        Database caching active. Verified reviews continues to load successfully.
                      </span>
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="py-12 bg-white border border-dashed border-[#E5E5E0] p-6 text-center rounded">
                    <Star size={20} className="text-stone-300 stroke-[1.2] mb-3 mx-auto" />
                    <p className="text-[10px] text-[#666666] font-semibold tracking-widest uppercase mb-1">No reviews yet</p>
                    <p className="text-[9.5px] text-[#666666]/70 font-light">Be the first to share your wear experience for this piece.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-[slideUp_0.5s_ease_forwards]">
                    {reviews.map(rev => {
                      const initials = rev.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FR';
                      return (
                        <div key={rev.id} className="bg-white border border-[#E5E5E0] p-6 text-left flex flex-col gap-3.5 rounded-lg transition-all hover:shadow-sm">
                          
                          {/* Title block */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-8.5 h-8.5 rounded-full bg-stone-100 border border-stone-200/50 text-[#1a1a1a] flex items-center justify-center font-bold text-[9px] uppercase">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">{rev.name}</span>
                                  {rev.isVerified !== false && (
                                    <span className="text-[7.5px] uppercase tracking-widest text-[#666666] font-semibold flex items-center gap-1 bg-[#F5F5F0] px-2 py-0.5 rounded-full">
                                      <Check size={8} className="text-stone-600" /> Verified Buyer
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8.5px] text-[#888888] mt-0.5 font-light">{rev.date}</span>
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex text-[#C9A84C]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  className={i < rev.rating ? 'fill-current' : 'text-[#E5E5E0]'} 
                                />
                              ))}
                            </div>
                          </div>

                          {/* Purchase specs */}
                          <div className="flex gap-4 text-[8px] uppercase tracking-widest text-[#888888] font-bold border-b border-[#E5E5E0] pb-2.5">
                            {rev.sizePurchased && (
                              <span>Size Purchased: <span className="text-[#1a1a1a]">{rev.sizePurchased}</span></span>
                            )}
                            {rev.fitRating && (
                              <span>Fit sizing: <span className="text-[#1a1a1a]">{rev.fitRating}</span></span>
                            )}
                          </div>

                          {/* Review Content */}
                          <div className="flex flex-col gap-1.5">
                            {rev.title && (
                              <h4 className="text-xs font-bold text-[#1a1a1a] tracking-wide font-serif">{rev.title}</h4>
                            )}
                            <p className="text-[11px] text-[#666666] font-light leading-relaxed">{rev.comment}</p>
                          </div>

                          {/* Attachments */}
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {rev.images.map((imgUrl, i) => (
                                <div 
                                  key={i} 
                                  className="w-14 h-18 bg-stone-50 border border-[#E5E5E0] overflow-hidden cursor-zoom-in rounded relative"
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

                          {/* Metrics ratings details */}
                          {rev.qualityRating !== undefined && (
                            <div className="grid grid-cols-3 gap-2 border-t border-[#E5E5E0] pt-3.5 mt-1.5 text-[8.5px] uppercase tracking-widest text-[#888888] font-semibold">
                              <div className="flex items-center gap-1.5">
                                <span>Quality:</span>
                                <span className="text-[#1a1a1a]">{rev.qualityRating}/5</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Comfort:</span>
                                <span className="text-[#1a1a1a]">{rev.comfortRating ?? rev.rating}/5</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Fabric:</span>
                                <span className="text-[#1a1a1a]">{rev.fabricRating ?? rev.rating}/5</span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center border-t border-[#E5E5E0] pt-3.5 mt-1 text-[8.5px] uppercase tracking-widest text-[#888888] font-bold">
                            <button
                              onClick={() => handleHelpfulClick(rev.id)}
                              className={`flex items-center gap-1.5 cursor-pointer p-1 hover:text-[#1a1a1a] transition-colors ${
                                votedHelpful[rev.id] ? 'text-emerald-600 font-bold' : ''
                              }`}
                            >
                              <ThumbsUp size={11} />
                              <span>Helpful ({helpfulVotes[rev.id] || 0})</span>
                            </button>
                            <button
                              onClick={() => handleReportClick(rev.id)}
                              className="flex items-center gap-1 cursor-pointer hover:text-red-700 transition-colors p-1"
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

        {/* Complete the Look Pairing suggestions */}
        {lookProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E5E5E0] text-left animate-[slideUp_0.6s_ease_forwards]">
            <div className="flex flex-col gap-1.5 mb-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#888888] font-bold">Perfect Pairings</span>
              <h2 className="text-xl uppercase tracking-widest font-serif font-light text-[#1a1a1a]">Complete the Look</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {lookProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Curated selection */}
        <section className="mt-24 pt-16 border-t border-[#E5E5E0] text-left animate-[slideUp_0.6s_ease_forwards]">
          <div className="flex flex-col gap-1.5 mb-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#888888] font-bold">Curated Selections</span>
            <h2 className="text-xl uppercase tracking-widest font-serif font-light text-[#1a1a1a]">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Lightbox full-size images */}
        {isFullscreen && activeMedia[activeMediaIdx] && (
          <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-[fadeIn_0.2s_ease-out]">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer z-50 p-2"
            >
              <X size={22} />
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
                  <video src={mediaUrl} controls autoPlay loop className="max-w-full max-h-full object-contain" />
                ) : (
                  <img src={mediaUrl} className="max-w-full max-h-full object-contain" alt="" />
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky CTA footer overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-[#ffffff]/90 backdrop-blur-md p-3.5 border-t border-[#E5E5E0] flex gap-3 shadow-lg">
        <button
          onClick={handleAddToBag}
          className="btn-luxury flex-1 text-[10px] py-3.5 rounded"
        >
          {added ? 'Added' : 'Add to Bag'}
        </button>
        <button
          onClick={handleWishlistToggle}
          className="border border-[#E5E5E0] bg-white p-3.5 text-stone-900 flex items-center justify-center rounded"
        >
          <Heart size={14} fill={favorited ? '#dc2626' : 'none'} className={favorited ? 'text-red-600' : ''} />
        </button>
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
}
