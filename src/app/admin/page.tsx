'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { 
  getProducts, createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus, updateOrderDetails, getAllCustomers,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getAdminReviews, deleteReview, approveReview, rejectReview,
  getAdminSupportTickets, updateTicketStatus,
  getSiteSettings, saveSiteSetting,
  getHeroBanners, saveHeroBanner, updateHeroBanner, deleteHeroBanner, seedDefaultHeroBanners,
  getHomepageSections, saveHomepageSections,
  getEditorialJournal, saveEditorialJournalItem, deleteEditorialJournalItem,
  uploadMedia, getDashboardStats, logActivity,
  createCategory, deleteCategory, getCategories,
  getCollections, createCollection, deleteCollection,
  getAdminProductDetailsSections, saveProductDetailsSection, deleteProductDetailsSection,
  getRestockAlerts, deleteRestockAlert, getNewsletterSubscribers, deleteNewsletterSubscriber,
  getProductColors, saveProductColor, deleteProductColor,
  getProductLookProducts, addProductLookProduct, removeProductLookProduct,
  getComboOffers, createComboOffer, deleteComboOffer
} from '@/services/database';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import type { Product, Category, Collection } from '@/types';
import { 
  Save, Plus, Trash2, Copy, Upload, ArrowRight, Star, Heart, Check, 
  HelpCircle, Trash, RotateCcw, AlertTriangle, Eye, ShieldAlert, Settings, 
  FileText, Search, ChevronRight, X, Grid, List, Printer, AlertCircle, Sparkles,
  ArrowUp, ArrowDown, Edit, ToggleLeft, ToggleRight
} from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  bannerImage: string;
  ctaText: string;
  ctaLink: string;
  visible: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  imageClickRedirect?: boolean;
  mediaType?: string;
  videoUrl?: string;
  posterUrl?: string;
  focalPoint?: string;
}

interface OrderAdmin {
  id: string;
  orderNumber?: number;
  customer: string;
  phone: string;
  email: string;
  address: string;
  amount: number;
  date: string;
  status: string;
  items: string;
  paymentMethod: string;
  cancelRequested?: boolean;
  cancelReason?: string;
  cancelRequestStatus?: string;
  cancelAdminNotes?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  ordersCount: number;
  totalSpent: string;
  lastOrderDate: string;
  blocked: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  activeFrom: string;
  activeTo: string;
  createdAt: string;
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive?: boolean;
}

function AdminCoreWorkspace() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'dashboard';

  // State values
  const [products, setProducts] = useState<Product[]>([]);
  const [trashProducts, setTrashProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTab, setEditTab] = useState<'info' | 'photos' | 'price' | 'stock' | 'sizes' | 'seo' | 'details' | 'variants' | 'look' | 'combos'>('info');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [editingLookProducts, setEditingLookProducts] = useState<Product[]>([]);
  const [allComboOffers, setAllComboOffers] = useState<any[]>([]);
  const [editingCombos, setEditingCombos] = useState<any[]>([]);
  const [selectedLookProductId, setSelectedLookProductId] = useState('');
  const [comboPartnerProductId, setComboPartnerProductId] = useState('');
  const [comboOfferPrice, setComboOfferPrice] = useState(0);

  const [editingSections, setEditingSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // Product Colors & Variants states
  const [productColors, setProductColors] = useState<any[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#FFFFFF');
  const [newColorImage, setNewColorImage] = useState('');
  const [isUploadingSwatch, setIsUploadingSwatch] = useState(false);
  const [selectedColorForMedia, setSelectedColorForMedia] = useState<string | null>(null);

  // Checked sizes checklist
  const [checkedSizes, setCheckedSizes] = useState<string[]>(['S', 'M', 'L']);
  
  // Matrix data for combination rows: colorName + size -> { stock, sku, additionalPrice, id, isActive }
  const [variantMatrix, setVariantMatrix] = useState<Record<string, {
    id?: string;
    stock: number;
    sku: string;
    additionalPrice: number;
    isActive: boolean;
  }>>({});

  // Automatically fetch details sections and colors for the editing product
  useEffect(() => {
    if (editingProduct) {
      const loadSections = async () => {
        try {
          const res = await getAdminProductDetailsSections(editingProduct.id);
          setEditingSections(res);
        } catch {
          setEditingSections([]);
        }
      };
      
      const loadColorsAndVariants = async () => {
        try {
          const colorsList = await getProductColors(editingProduct.id);
          setProductColors(colorsList);
          
          const currentSizes = editingProduct.variants 
            ? Array.from(new Set(editingProduct.variants.map(v => v.size)))
            : ['S', 'M', 'L'];
          setCheckedSizes(currentSizes.length > 0 ? currentSizes : ['S', 'M', 'L']);
          
          const matrix: Record<string, any> = {};
          if (editingProduct.variants) {
            for (const v of editingProduct.variants) {
              const key = `${v.color}-${v.size}`;
              matrix[key] = {
                id: v.id,
                stock: v.stockQty ?? 0,
                sku: v.sku || '',
                additionalPrice: v.additionalPrice || 0,
                isActive: true
              };
            }
          }
          setVariantMatrix(matrix);
        } catch (err) {
          console.error('Failed to load colors/variants:', err);
        }
      };

      const loadLookProducts = async () => {
        try {
          const res = await getProductLookProducts(editingProduct.id);
          setEditingLookProducts(res);
        } catch {
          setEditingLookProducts([]);
        }
      };

      const loadComboOffers = async () => {
        try {
          const res = await getComboOffers();
          setAllComboOffers(res);
          const currentProductCombos = res.filter(c => c.product_a_id === editingProduct.id || c.product_b_id === editingProduct.id);
          setEditingCombos(currentProductCombos);
        } catch {
          setEditingCombos([]);
          setAllComboOffers([]);
        }
      };

      loadSections();
      loadColorsAndVariants();
      loadLookProducts();
      loadComboOffers();
    } else {
      setEditingSections([]);
      setNewSectionTitle('');
      setNewSectionContent('');
      setProductColors([]);
      setNewColorName('');
      setNewColorCode('#FFFFFF');
      setNewColorImage('');
      setSelectedColorForMedia(null);
      setCheckedSizes(['S', 'M', 'L']);
      setVariantMatrix({});
      setEditingLookProducts([]);
      setEditingCombos([]);
      setSelectedLookProductId('');
      setComboPartnerProductId('');
      setComboOfferPrice(0);
    }
  }, [editingProduct]);

  // Undo Delete support state
  const [lastDeletedProduct, setLastDeletedProduct] = useState<Product | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  
  // Settings States
  const [expressDeliveryEnabled, setExpressDeliveryEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(false);

  // Simple step guides (Help Card modal triggers)
  const [activeHelpCard, setActiveHelpCard] = useState<string | null>(null);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when active tab switches to prevent lists vanishing
  useEffect(() => {
    setSearchQuery('');
  }, [activeView]);

  // Bulk actions status states
  const [isSaving, setIsSaving] = useState(false);

  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    basePrice: 0,
    mrp: 0,
    stockQty: 10,
    images: ['/assets/trench_coat.jpg'],
    parentCategory: 'men',
    subCategory: 'hoodies',
    brand: 'Made in India',
    status: 'published',
    trackQuantity: true
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');
  const [newCategoryBanner, setNewCategoryBanner] = useState('/assets/trench_coat.jpg');

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionBanner, setNewCollectionBanner] = useState('/assets/trench_coat.jpg');

  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [editorialJournal, setEditorialJournal] = useState<any[]>([]);

  const [homeSections, setHomeSections] = useState<HomepageSection[]>([]);

  // Local draft states for non-laggy CMS typing
  const [heroDrafts, setHeroDrafts] = useState<Record<string, any>>({});
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, any>>({});
  const [savingHeroId, setSavingHeroId] = useState<string | null>(null);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);

  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewTab, setReviewTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0, lowStockCount: 0, pendingOrders: 0 });

  // Dynamic Coupon form state
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 10,
    maxUses: 100,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    activeFrom: new Date().toISOString().split('T')[0],
    activeTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  // Dynamic Store settings states
  const [brandName, setBrandName] = useState('FREERT');
  const [storeEmail, setStoreEmail] = useState('concierge@freert.net');
  const [storePhone, setStorePhone] = useState('+91 98765 43210');
  const [storeAddress, setStoreAddress] = useState('FREERT Headquarters, New Delhi, India');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/freert');
  const [twitterUrl, setTwitterUrl] = useState('https://twitter.com/freert');
  const [pinterestUrl, setPinterestUrl] = useState('https://pinterest.com');
  const [logoUrl, setLogoUrl] = useState('');
  const [copyrightText, setCopyrightText] = useState('© 2026 FREERT. All rights reserved.');
  const [seoTitle, setSeoTitle] = useState('FREERT | Luxury Minimalist Fashion');
  const [seoDescription, setSeoDescription] = useState('BE YOU. BE BOLD. BE FREERT.');
  const [footerInfo, setFooterInfo] = useState('A global luxury clothing label designing minimalist structures and organic linens in small batches.');

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [restockAlerts, setRestockAlerts] = useState<any[]>([]);

  // Load all admin data on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [productList, orderList, customerList, couponList, reviewList, ticketList, settings, stats, categoriesList, cmsSections, heroList, lookbookList, subscribersList, alertsList, collectionsList] = await Promise.allSettled([
          getProducts(),
          getAllOrders(),
          getAllCustomers(),
          getCoupons(),
          getAdminReviews(),
          getAdminSupportTickets(),
          getSiteSettings(),
          getDashboardStats(),
          getCategories(),
          getHomepageSections(),
          getHeroBanners(),
          getEditorialJournal(),
          getNewsletterSubscribers(),
          getRestockAlerts(),
          getCollections()
        ]);

        if (productList.status === 'fulfilled') setProducts(productList.value);

        if (orderList.status === 'fulfilled') {
          setOrders(orderList.value.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number || o.orderNumber,
            customer: o.user?.full_name || 'Guest',
            phone: o.user?.phone || '—',
            email: o.user?.email || '—',
            address: '—',
            amount: o.total_amount,
            date: o.created_at?.split('T')[0] || '—',
            status: o.status,
            items: o.items?.map((i: any) => `${i.variant?.product?.name || 'Item'} x${i.qty}`).join(', ') || '—',
            paymentMethod: o.payment?.provider || 'cod',
            cancelRequested: o.cancel_requested,
            cancelReason: o.cancel_reason,
            cancelRequestStatus: o.cancel_request_status,
            cancelAdminNotes: o.cancel_admin_notes,
          })));
        }

        if (customerList.status === 'fulfilled') {
          setCustomers(customerList.value.map((c: any) => ({
            id: c.id,
            name: c.full_name || c.email,
            phone: c.phone || '—',
            email: c.email,
            ordersCount: 0,
            totalSpent: '—',
            lastOrderDate: c.created_at?.split('T')[0] || '—',
            blocked: false,
          })));
        }

        if (couponList.status === 'fulfilled') {
          setCoupons(couponList.value as any);
        }

        if (reviewList.status === 'fulfilled' && Array.isArray(reviewList.value)) {
          setReviews(reviewList.value.map((r: any) => ({
            id: r.id,
            product: r.product?.name || '—',
            author: r.user?.full_name || r.user?.email || 'Anonymous',
            comment: r.comment || '',
            rating: r.rating,
            status: r.status || 'pending',
            date: r.created_at?.split('T')[0] || '—',
          })));
        }

        if (ticketList.status === 'fulfilled') setSupportTickets(ticketList.value);

        if (settings.status === 'fulfilled') {
          const vals = settings.value;
          setExpressDeliveryEnabled(vals['express_delivery_enabled'] !== 'false');
          setOnlinePaymentEnabled(vals['online_payment_enabled'] === 'true');
          setBrandName(vals['brand_name'] || 'FREERT');
          setStoreEmail(vals['store_email'] || 'concierge@freert.net');
          setStorePhone(vals['store_phone'] || '+91 98765 43210');
          setStoreAddress(vals['store_address'] || 'FREERT Headquarters, New Delhi, India');
          setFacebookUrl(vals['facebook_url'] || 'https://facebook.com');
          setInstagramUrl(vals['instagram_url'] || 'https://instagram.com/freert');
          setTwitterUrl(vals['twitter_url'] || 'https://twitter.com/freert');
          setPinterestUrl(vals['pinterest_url'] || 'https://pinterest.com');
          setLogoUrl(vals['logo_url'] || '');
          setCopyrightText(vals['copyright'] || '© 2026 FREERT. All rights reserved.');
          setSeoTitle(vals['seo_title'] || 'FREERT | Luxury Minimalist Fashion');
          setSeoDescription(vals['seo_description'] || 'BE YOU. BE BOLD. BE FREERT.');
          setFooterInfo(vals['footer_info'] || 'A global luxury clothing label designing minimalist structures and organic linens in small batches.');
        }

        if (stats.status === 'fulfilled') setDashboardStats(stats.value);

        if (categoriesList.status === 'fulfilled' && categoriesList.value.length > 0) {
          setCategories(categoriesList.value);
        }

        if (collectionsList.status === 'fulfilled' && collectionsList.value) {
          setCollections(collectionsList.value);
        }

        if (cmsSections.status === 'fulfilled' && cmsSections.value.length > 0) {
          const mapped = cmsSections.value.map((s: any) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle || '',
            bannerImage: s.banner_image || s.bannerImage || '/assets/trench_coat.jpg',
            ctaText: s.cta_text || s.ctaText || 'Shop Now',
            ctaLink: s.cta_link || s.ctaLink || '/shop',
            visible: s.visible ?? true,
            showTitle: s.show_title ?? s.showTitle ?? true,
            showSubtitle: s.show_subtitle ?? s.showSubtitle ?? true,
            showButton: s.show_button ?? s.showButton ?? true,
            imageClickRedirect: s.image_click_redirect ?? s.imageClickRedirect ?? true,
            mediaType: s.media_type || s.mediaType || 'image',
            videoUrl: s.video_url || s.videoUrl || '',
            posterUrl: s.poster_url || s.posterUrl || '',
            focalPoint: s.focal_point || s.focalPoint || 'center',
          }));
          setHomeSections(mapped);
        }

        if (heroList.status === 'fulfilled' && heroList.value) {
          const mapBanner = (b: any) => ({
            ...b,
            imageUrl: b.image_url || b.imageUrl || '',
            showTitle: b.show_title ?? b.showTitle ?? true,
            showSubtitle: b.show_subtitle ?? b.showSubtitle ?? true,
            showButton: b.show_button ?? b.showButton ?? true,
            mediaType: b.media_type || b.mediaType || 'image',
            videoUrl: b.video_url || b.videoUrl || '',
            posterUrl: b.poster_url || b.posterUrl || '',
            focalPoint: b.focal_point || b.focalPoint || 'center',
            isPrimary: b.is_primary ?? b.isPrimary ?? false,
            enabled: b.enabled ?? true,
            imageClickRedirect: b.image_click_redirect ?? b.imageClickRedirect ?? true,
            videoClickRedirect: b.video_click_redirect ?? b.videoClickRedirect ?? false,
            order: b.order ?? 0,
          });

          if (heroList.value.length === 0) {
            try {
              const seeded = await seedDefaultHeroBanners();
              setHeroBanners(seeded.map(mapBanner));
            } catch (seedErr) {
              setHeroBanners([]);
            }
          } else {
            setHeroBanners(heroList.value.map(mapBanner));
          }
        }
        if (lookbookList.status === 'fulfilled' && lookbookList.value) {
          setEditorialJournal(lookbookList.value);
        }
        if (subscribersList.status === 'fulfilled') {
          setSubscribers(subscribersList.value);
        }
        if (alertsList.status === 'fulfilled') {
          setRestockAlerts(alertsList.value);
        }

      } catch (e) {
        // Non-critical: admin loads what it can
      }
    };
    loadAll();

    // Enable Realtime Subscriptions for immediate Admin updates without refreshing
    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        loadAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Refresh products list from DB
  const refreshProducts = async () => {
    try { const list = await getProducts(); setProducts(list); } catch (e) {}
  };

  // Image Upload to Supabase Storage
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'add') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast(`Uploading ${files.length} photo(s)...`, 'info');
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadMedia(files[i], 'products');
        uploadedUrls.push(url);
      } catch (err) {
        showToast(`Failed to upload ${files[i].name}`, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      if (target === 'edit' && editingProduct) {
        setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ...uploadedUrls] });
      } else if (target === 'add') {
        setNewProductForm({ ...newProductForm, images: [...(newProductForm.images || []), ...uploadedUrls] });
      }
      showToast(`${uploadedUrls.length} photo(s) uploaded successfully.`, 'success');
    }
  };

  // Reorder Images inside Edit / Add forms
  const moveImageOrder = (idx: number, direction: 'left' | 'right', target: 'edit' | 'add') => {
    if (target === 'edit' && editingProduct) {
      const images = [...editingProduct.images];
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= images.length) return;
      
      const temp = images[idx];
      images[idx] = images[targetIdx];
      images[targetIdx] = temp;
      setEditingProduct({ ...editingProduct, images });
    } else if (target === 'add') {
      const images = [...(newProductForm.images || [])];
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= images.length) return;
      
      const temp = images[idx];
      images[idx] = images[targetIdx];
      images[targetIdx] = temp;
      setNewProductForm({ ...newProductForm, images });
    }
  };

  // Make Cover Image (Moves it to index 0)
  const makeCoverImage = (idx: number, target: 'edit' | 'add') => {
    if (target === 'edit' && editingProduct) {
      const images = [...editingProduct.images];
      const selected = images.splice(idx, 1)[0];
      setEditingProduct({ ...editingProduct, images: [selected, ...images] });
      showToast('Set as cover image.', 'success');
    } else if (target === 'add') {
      const images = [...(newProductForm.images || [])];
      const selected = images.splice(idx, 1)[0];
      setNewProductForm({ ...newProductForm, images: [selected, ...images] });
      showToast('Set as cover image.', 'success');
    }
  };

  // Delete Image from editing list
  const deleteImage = (idx: number, target: 'edit' | 'add') => {
    if (target === 'edit' && editingProduct) {
      const images = editingProduct.images.filter((_, i) => i !== idx);
      setEditingProduct({ ...editingProduct, images: images.length > 0 ? images : ['/assets/trench_coat.jpg'] });
    } else if (target === 'add') {
      const images = (newProductForm.images || []).filter((_, i) => i !== idx);
      setNewProductForm({ ...newProductForm, images: images.length > 0 ? images : ['/assets/trench_coat.jpg'] });
    }
  };

  // Delete with undo support
  const triggerDeleteWithUndo = async (product: Product) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${product.name}"?`);
    if (!confirmDelete) return;

    setLastDeletedProduct(product);
    setShowUndoToast(true);

    try {
      await deleteProduct(product.id);
      await logActivity('product_delete', `Deleted product: ${product.name}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (e) {
      showToast('Failed to delete product.', 'error');
    }

    setTimeout(() => setShowUndoToast(false), 10000);
  };

  const handleUndoDelete = async () => {
    if (lastDeletedProduct) {
      // Re-create the product in the DB
      try {
        await createProduct(lastDeletedProduct);
        setProducts(prev => [lastDeletedProduct, ...prev]);
        setLastDeletedProduct(null);
        setShowUndoToast(false);
        showToast('Deletion undone successfully.', 'success');
      } catch (e) {
        showToast('Could not undo deletion.', 'error');
      }
    }
  };

  // Bulk Product Actions Handlers
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`);
    if (confirmDelete) {
      try {
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
        setSelectedProductIds([]);
        showToast('Selected products deleted.', 'success');
      } catch (e) {
        showToast('Some products could not be deleted.', 'error');
      }
    }
  };

  const handleBulkChangeDiscount = async () => {
    const pct = window.prompt('Enter new Selling Price for all selected products (e.g. 2499) or enter discount percentage (e.g. 20%):');
    if (!pct) return;

    try {
      await Promise.all(selectedProductIds.map(id => {
        const p = products.find(x => x.id === id);
        if (!p) return Promise.resolve();
        if (pct.endsWith('%')) {
          const discountPercent = Number(pct.replace('%', ''));
          const calculatedPrice = Math.round(p.basePrice * (1 - discountPercent / 100));
          return updateProduct(id, { basePrice: calculatedPrice, mrp: p.basePrice });
        } else {
          return updateProduct(id, { basePrice: Number(pct), mrp: p.basePrice });
        }
      }));
      await refreshProducts();
      setSelectedProductIds([]);
      showToast('Applied prices update to selected items.', 'success');
    } catch (e) {
      showToast('Price update failed.', 'error');
    }
  };

  const handleBulkUpdateStock = async () => {
    const qty = window.prompt('Enter new stock quantity for selected items:');
    if (qty === null || qty === '') return;
    const stock = Number(qty);
    try {
      await Promise.all(selectedProductIds.map(id =>
        updateProduct(id, { stockQty: stock, status: stock === 0 ? 'out-of-stock' : 'published' })
      ));
      await refreshProducts();
      setSelectedProductIds([]);
      showToast('Updated stock for selected items.', 'success');
    } catch (e) {
      showToast('Stock update failed.', 'error');
    }
  };

  // Dynamic Invoice Printer Window
  const handlePrintInvoice = (order: OrderAdmin) => {
    window.open(`/order/${order.id}/invoice`, '_blank');
  };

  // Helper filters for Global Search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.phone.includes(searchQuery)
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Dashboard View
  const renderDashboard = () => (
    <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.3s_ease-out]">
      {/* Top Banner Search info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-fg-luxury text-bg-luxury p-8 border border-neutral-soft/80 shadow-md">
        <div>
          <h2 className="text-xl font-editorial tracking-widest font-semibold flex items-center gap-2 uppercase">
            Welcome Back <Sparkles size={16} className="text-accent-gold" />
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-neutral-300 mt-1 font-light">Your store is running smoothly with 0 interruptions.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input 
            type="text" 
            placeholder="Search Products, Orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-luxury/10 border border-neutral-soft/30 text-xs py-2 px-4 pl-9 text-bg-luxury placeholder:text-neutral-400 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-neutral-400" size={13} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: `₹${dashboardStats.totalRevenue.toLocaleString('en-IN')}`, note: 'All time revenue' },
          { title: 'Total Orders', value: `${dashboardStats.totalOrders} Orders`, note: 'All orders placed' },
          { title: 'Active Customers', value: `${dashboardStats.totalCustomers} Members`, note: 'Registered accounts' },
          { title: 'Low Stock Alerts', value: `${dashboardStats.lowStockCount} Articles`, note: 'Under 5 units threshold' }
        ].map((item, idx) => (
          <div key={idx} className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col justify-between min-h-[110px] hover:border-neutral-400 transition-all">
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">{item.title}</span>
            <span className="text-xl font-light tracking-wide text-fg-luxury mt-3">{item.value}</span>
            <span className="text-[8px] uppercase tracking-widest text-text-muted mt-1">{item.note}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-luxury border border-neutral-soft/80 p-6">
          <div className="flex justify-between items-baseline border-b border-neutral-soft/30 pb-2 mb-4">
            <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold">Order Pipeline</span>
            <span className="text-[8px] uppercase tracking-widest text-text-muted font-semibold">{dashboardStats.pendingOrders} Pending</span>
          </div>
          <div className="flex flex-col gap-3">
            {orders.slice(0, 4).map(o => (
              <div key={o.id} className="flex justify-between items-center text-[10px] border-b border-neutral-soft/10 pb-2">
                <span className="text-fg-luxury font-medium">{o.id}</span>
                <span className="text-text-muted">{o.customer}</span>
                <span className={`uppercase font-semibold px-2 py-0.5 text-[8px] ${
                  o.status === 'delivered' ? 'bg-green-50 text-green-800' :
                  o.status === 'cancelled' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
                }`}>{o.status}</span>
                <span className="font-medium">₹{Number(o.amount).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-[10px] text-text-muted font-light">No orders yet.</p>}
          </div>
        </div>
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">Store Snapshot</span>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-text-muted">Total Products</span>
              <span className="font-medium text-fg-luxury">{dashboardStats.totalProducts}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-text-muted">Pending Orders</span>
              <span className="font-medium text-fg-luxury">{dashboardStats.pendingOrders}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-text-muted">Low Stock Items</span>
              <span className="font-medium text-red-700">{dashboardStats.lowStockCount}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-text-muted">Total Customers</span>
              <span className="font-medium text-fg-luxury">{dashboardStats.totalCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Simplified Shopify-style Product editing & list view
  const renderProducts = () => {
    const handleSaveColorsAndVariants = async () => {
      if (!editingProduct) return;
      setIsSaving(true);
      try {
        // 1. Save all colorway configurations in state
        const savedColors = [];
        for (const col of productColors) {
          const res = await saveProductColor({
            id: col.id?.startsWith('temp_') ? undefined : col.id,
            productId: editingProduct.id,
            colorName: col.color_name,
            colorCode: col.color_code,
            colorImage: col.color_image,
            images: col.images || [],
            videos: col.videos || [],
            isActive: col.is_active ?? true
          });
          savedColors.push(res);
        }

        // 2. Determine which colors were deleted and clean them up
        const originalColors = await getProductColors(editingProduct.id);
        const activeNames = productColors.map(c => c.color_name);
        for (const orig of originalColors) {
          if (!activeNames.includes(orig.color_name)) {
            await deleteProductColor(orig.id);
          }
        }

        // Reload colors list to get database IDs for new colors
        const freshColors = await getProductColors(editingProduct.id);
        setProductColors(freshColors);

        // 3. Upsert variant matrix rows for each Color x Size combination
        const activeCombinations = [];
        for (const col of freshColors) {
          for (const size of checkedSizes) {
            const key = `${col.color_name}-${size}`;
            const matrixCell = variantMatrix[key] || { stock: 0, sku: '', additionalPrice: 0, isActive: true };
            
            if (matrixCell.isActive) {
              const defaultSku = `${editingProduct.name.substring(0, 3).toUpperCase()}-${col.color_name.substring(0, 3).toUpperCase()}-${size}`;
              const finalSku = matrixCell.sku.trim() || defaultSku;

              const payload = {
                id: matrixCell.id,
                product_id: editingProduct.id,
                color_id: col.id,
                color: col.color_name,
                size,
                sku: finalSku,
                stock_qty: Number(matrixCell.stock || 0),
                additional_price: Number(matrixCell.additionalPrice || 0)
              };

              const { data: upserted, error } = await supabase
                .from('product_variants')
                .upsert(payload, { onConflict: 'product_id,color,size' })
                .select();

              if (error) throw error;
              if (upserted && upserted[0]) {
                activeCombinations.push(upserted[0].id);
              }
            }
          }
        }

        // Clean up any product variants that are not in the active combination list
        const { data: dbVariants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', editingProduct.id);
          
        if (dbVariants) {
          for (const dv of dbVariants) {
            if (!activeCombinations.includes(dv.id)) {
              await supabase.from('product_variants').delete().eq('id', dv.id);
            }
          }
        }

        // 4. Calculate total stock from all active variants and update main product table
        const totalStock = Object.keys(variantMatrix).reduce((sum, key) => {
          const cell = variantMatrix[key];
          return sum + (cell.isActive ? Number(cell.stock || 0) : 0);
        }, 0);

        await updateProduct(editingProduct.id, { 
          stockQty: totalStock,
          status: totalStock === 0 ? 'out-of-stock' : 'published'
        });

        await logActivity('product_update', `Updated variants and colors configuration for product: ${editingProduct.name}`);
        await refreshProducts();
        
        // Refresh editing product details state
        const refreshedProd = await supabase
          .from('products')
          .select('*, category:categories(*), collection:collections(*), variants:product_variants(*), colors:product_colors(*)')
          .eq('id', editingProduct.id)
          .single();
          
        if (refreshedProd.data) {
          setEditingProduct(refreshedProd.data as any);
        }

        showToast('Colors and variants configuration updated successfully!', 'success');
      } catch (err: any) {
        console.error('Save variants error:', err);
        showToast(`Failed to update variants: ${err.message || 'Unknown error'}`, 'error');
      } finally {
        setIsSaving(false);
      }
    };

    const handleSaveProductEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProduct) return;
      setIsSaving(true);
      try {
        const totalStock = editingProduct.stockQty ?? 10;
        const finalStatus = (totalStock === 0 ? 'out-of-stock' : 'published') as any;
        // Strip nested join objects so Supabase doesn't complain about unknown fields
        const { category, collection, variants, ...cleanProduct } = editingProduct as any;
        await updateProduct(editingProduct.id, { ...cleanProduct, status: finalStatus });
        await logActivity('product_update', `Updated product: ${editingProduct.name}`);
        await refreshProducts();
        setEditingProduct(null);
        showToast('Changes saved successfully!', 'success');
      } catch (err: any) {
        console.error('Save product error:', err);
        showToast(`Failed to save: ${err?.message || 'Unknown error'}`, 'error');
      } finally {
        setIsSaving(false);
      }
    };

    const handleAddProductSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProductForm.name || !newProductForm.basePrice) return;
      setIsSaving(true);
      try {
        const stockQty = Number(newProductForm.stockQty || 10);
        const created = await createProduct({
          name: newProductForm.name!,
          slug: (newProductForm.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: newProductForm.description || '',
          basePrice: Number(newProductForm.basePrice),
          mrp: Number(newProductForm.mrp || newProductForm.basePrice),
          stockQty,
          status: newProductForm.status || (stockQty === 0 ? 'out-of-stock' : 'published'),
          images: newProductForm.images || ['/assets/trench_coat.jpg'],
          parentCategory: newProductForm.parentCategory || 'men',
          subCategory: newProductForm.subCategory || 'hoodies',
          brand: newProductForm.brand || 'Made in India',
          isPublished: true,
          rating: 0,
          reviewsCount: 0,
          trackQuantity: newProductForm.trackQuantity !== false
        } as any);
        await logActivity('product_create', `Added product: ${created.name}`);
        await refreshProducts();
        setIsAddingProduct(false);
        setNewProductForm({ name: '', description: '', basePrice: 0, mrp: 0, stockQty: 10, images: ['/assets/trench_coat.jpg'], parentCategory: 'men', subCategory: 'hoodies', brand: 'Made in India', status: 'published', trackQuantity: true });
        showToast('Product added successfully.', 'success');
      } catch (e) {
        showToast('Failed to add product.', 'error');
      } finally {
        setIsSaving(false);
      }
    };

    const toggleSelectProduct = (id: string) => {
      if (selectedProductIds.includes(id)) {
        setSelectedProductIds(selectedProductIds.filter(x => x !== id));
      } else {
        setSelectedProductIds([...selectedProductIds, id]);
      }
    };

    return (
      <div className="flex flex-col gap-8 text-left animate-[fadeIn_0.3s_ease-out] relative min-h-[60vh]">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-soft">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Products Manager</h2>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="btn-editorial-solid text-[9px] py-2 px-4 uppercase font-semibold flex items-center gap-1.5"
          >
            <Plus size={12} /> Add New Product
          </button>
        </div>

        {/* Search bar specifically for list */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search products by title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-luxury border border-neutral-soft/80 text-xs py-2.5 px-4 pl-9 text-fg-luxury focus:outline-none"
            />
            <Search className="absolute left-3 top-3 text-text-muted" size={13} />
          </div>
        </div>

        {/* Simplified tabbed edit product modal + Side-by-side Live Preview! */}
        {editingProduct && (
          <div className="fixed inset-0 bg-fg-luxury/45 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <div className="bg-bg-luxury border border-neutral-soft/80 max-w-5xl w-full p-8 max-h-[85vh] overflow-y-auto text-left relative shadow-2xl flex flex-col md:flex-row gap-8">
              
              {/* Left Form side */}
              <form onSubmit={handleSaveProductEdit} className="flex-1 flex flex-col gap-5">
                <div className="flex justify-between items-start border-b border-neutral-soft/30 pb-3">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Edit Product Settings</h3>
                    <p className="text-[8px] text-text-muted uppercase mt-0.5">Shopify-style simple parameters editing</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="text-text-muted hover:text-fg-luxury cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Custom Tab selectors */}
                <div className="flex border-b border-neutral-soft/20 gap-2 overflow-x-auto">
                  {[
                    { key: 'info', label: '📝 Basic info' },
                    { key: 'photos', label: '📷 Photos' },
                    { key: 'price', label: '💰 Pricing' },
                    { key: 'variants', label: '🎭 Variants Engine' },
                    { key: 'details', label: '📖 Details Accordion' },
                    { key: 'look', label: '🧣 Complete Look' },
                    { key: 'combos', label: '🎁 Combo Offers' },
                    { key: 'seo', label: '⚙ Advanced SEO' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setEditTab(tab.key as any)}
                      className={`text-[9px] uppercase tracking-wider px-3 py-2 border-b-2 transition-all ${editTab === tab.key ? 'border-fg-luxury text-fg-luxury font-medium' : 'border-transparent text-text-muted'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content 1: Basic Info */}
                {editTab === 'info' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Product Title</label>
                      <input 
                        type="text" 
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="input-editorial text-xs" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Department Group</label>
                      <select 
                        value={editingProduct.parentCategory}
                        onChange={(e) => setEditingProduct({ ...editingProduct, parentCategory: e.target.value, subCategory: '' })}
                        className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                      >
                        <option value="">— Select Department —</option>
                        {categories.filter(c => !c.parentCategory).map(dept => (
                          <option key={dept.id} value={dept.slug}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Subcategory</label>
                      <select 
                        value={editingProduct.subCategory}
                        onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                        className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                      >
                        <option value="">Select Subcategory</option>
                        {categories.filter(c => c.parentCategory === (editingProduct.parentCategory || 'men')).map(sub => (
                          <option key={sub.id} value={sub.slug}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Country of Origin</label>
                      <select 
                        value={editingProduct.brand || 'Made in India'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                      >
                        <option value="India">India</option>
                        <option value="Made in India">Made in India</option>
                        <option value="Imported">Imported</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Stock Status Override</label>
                        <select 
                          value={editingProduct.status || 'published'}
                          onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                          className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                        >
                          <option value="published">In Stock / Published</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 mt-4 select-none">
                        <input 
                          type="checkbox"
                          id="edit-track-quantity"
                          checked={editingProduct.trackQuantity !== false}
                          onChange={(e) => setEditingProduct({ ...editingProduct, trackQuantity: e.target.checked })}
                          className="w-4 h-4 accent-fg-luxury cursor-pointer"
                        />
                        <label htmlFor="edit-track-quantity" className="text-[9px] uppercase tracking-wider text-text-muted cursor-pointer font-semibold">
                          Track Inventory Quantities
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block font-semibold">Description (Rich Text)</label>
                      <RichTextEditor 
                        value={editingProduct.description || ''}
                        onChange={(val) => setEditingProduct({ ...editingProduct, description: val })}
                        placeholder="Garment details, loom description..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block">Product Labels / Tags</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'new-arrivals', label: '🆕 New Arrival' },
                          { value: 'sale', label: '🏷️ Sale' },
                          { value: 'best-seller', label: '🔥 Best Seller' },
                          { value: 'featured', label: '⭐ Featured' },
                        ].map(tag => {
                          const isChecked = (editingProduct.tags || []).includes(tag.value);
                          return (
                            <label key={tag.value} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const current = editingProduct.tags || [];
                                  const updated = isChecked
                                    ? current.filter(t => t !== tag.value)
                                    : [...current, tag.value];
                                  setEditingProduct({ ...editingProduct, tags: updated });
                                }}
                                className="w-3 h-3 accent-fg-luxury"
                              />
                              <span className={`text-[9px] uppercase tracking-wider ${isChecked ? 'text-accent-gold font-semibold' : 'text-text-muted font-light'}`}>
                                {tag.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content 2: Multiple Photo Upload with Reorder/Delete */}
                {editTab === 'photos' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted block">Campaign Photos (Cover photo is the first image)</span>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {editingProduct.images.map((img, idx) => (
                        <div key={idx} className="border border-neutral-soft relative aspect-[3/4] group overflow-hidden bg-neutral-soft/10">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-fg-luxury/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button 
                              type="button"
                              onClick={() => deleteImage(idx, 'edit')}
                              className="text-red-400 hover:text-red-500 self-end"
                            >
                              <Trash2 size={12} />
                            </button>
                            <div className="flex flex-col gap-1">
                              {idx > 0 && (
                                <button 
                                  type="button" 
                                  onClick={() => makeCoverImage(idx, 'edit')}
                                  className="text-[8px] bg-bg-luxury text-fg-luxury py-0.5 px-1 uppercase tracking-widest font-semibold"
                                >
                                  Cover
                                </button>
                              )}
                              <div className="flex justify-between">
                                <button type="button" onClick={() => moveImageOrder(idx, 'left', 'edit')} className="text-bg-luxury hover:text-accent-gold"><ArrowDown size={11} className="rotate-90" /></button>
                                <button type="button" onClick={() => moveImageOrder(idx, 'right', 'edit')} className="text-bg-luxury hover:text-accent-gold"><ArrowUp size={11} className="rotate-90" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <label className="btn-editorial py-2.5 px-4 text-[9px] uppercase font-semibold cursor-pointer border border-dashed border-fg-luxury flex items-center justify-center gap-1.5 mt-2">
                      <Upload size={12} /> Upload Multiple Photos
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => handleMultipleImagesUpload(e, 'edit')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}

                {/* Tab content 3: Simple Price / Discount calculation */}
                {editTab === 'price' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Original Price (MRP)</label>
                        <input 
                          type="number" 
                          value={editingProduct.mrp === 0 ? '' : (editingProduct.mrp || editingProduct.basePrice)}
                          onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                          className="input-editorial text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Selling Price</label>
                        <input 
                          type="number" 
                          value={editingProduct.basePrice === 0 ? '' : editingProduct.basePrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                          className="input-editorial text-xs" 
                          required
                        />
                      </div>
                    </div>
                    {editingProduct.mrp && editingProduct.mrp > editingProduct.basePrice && (
                      <div className="p-3 bg-neutral-soft/20 text-[9px] uppercase tracking-widest text-red-700 font-semibold">
                        Discount auto-calculated: {Math.round(((editingProduct.mrp - editingProduct.basePrice) / editingProduct.mrp) * 100)}% OFF on storefront.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 4: Variants Engine Manager */}
                {editTab === 'variants' && (
                  <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
                    
                    {/* Part A: Manage Colors */}
                    <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4 bg-bg-luxury">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">1. Configure Product Colors (Colorways)</span>
                      
                      {/* Color Add Form */}
                      <div className="bg-neutral-soft/10 p-3.5 border border-neutral-soft/30 flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Create New Colorway</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[8px] uppercase text-text-muted block mb-1">Color Name</label>
                            <input 
                              type="text" 
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              placeholder="e.g. Vintage White, Onyx Black"
                              className="input-editorial text-xs py-1.5 px-2"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase text-text-muted block mb-1">Swatch Hex Code</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={newColorCode}
                                onChange={(e) => setNewColorCode(e.target.value)}
                                className="w-8 h-7 bg-transparent border-0 cursor-pointer p-0"
                              />
                              <input 
                                type="text" 
                                value={newColorCode}
                                onChange={(e) => setNewColorCode(e.target.value)}
                                placeholder="#FFFFFF"
                                className="input-editorial text-xs py-1.5 px-2 flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[8px] uppercase text-text-muted block mb-1">Swatch Image (Optional)</label>
                            <div className="flex gap-3 items-center">
                              {newColorImage && (
                                <img src={newColorImage} className="w-8 h-8 rounded-full border border-neutral-soft/50 object-cover" alt="" />
                              )}
                              <label className="btn-editorial py-1.5 px-3 text-[8px] uppercase tracking-wider font-semibold cursor-pointer flex-1 text-center bg-transparent border border-neutral-soft/50 text-fg-luxury hover:bg-neutral-soft/10">
                                {isUploadingSwatch ? 'Uploading Swatch...' : 'Select Swatch File'}
                                <input 
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.webp,.gif"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setIsUploadingSwatch(true);
                                      try {
                                        const url = await uploadMedia(file, 'swatches');
                                        setNewColorImage(url);
                                        showToast('Swatch image uploaded.', 'success');
                                      } catch (err) {
                                        showToast('Failed to upload swatch image.', 'error');
                                      } finally {
                                        setIsUploadingSwatch(false);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              {newColorImage && (
                                <button
                                  type="button"
                                  onClick={() => setNewColorImage('')}
                                  className="text-red-700 hover:text-red-800 text-[8px] uppercase font-bold cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColorName.trim()) {
                              showToast('Color Name is required.', 'error');
                              return;
                            }
                            const exists = productColors.some(c => c.color_name.toLowerCase() === newColorName.trim().toLowerCase());
                            if (exists) {
                              showToast('A colorway with this name already exists.', 'info');
                              return;
                            }
                            const tempCol = {
                              id: `temp_${Date.now()}`,
                              color_name: newColorName.trim(),
                              color_code: newColorCode,
                              color_image: newColorImage.trim() || null,
                              images: [],
                              videos: [],
                              is_active: true
                            };
                            setProductColors([...productColors, tempCol]);
                            setNewColorName('');
                            setNewColorCode('#FFFFFF');
                            setNewColorImage('');
                            showToast('Colorway added to list. Remember to save changes.', 'success');
                          }}
                          className="btn-editorial-solid self-end text-[8px] tracking-widest font-semibold py-2 px-4 cursor-pointer"
                        >
                          + Add Colorway
                        </button>
                      </div>

                      {/* Colors List and Media Management */}
                      {productColors.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium">Configured Colors</span>
                          <div className="flex flex-col gap-3">
                            {productColors.map((col) => (
                              <div key={col.id} className="border border-neutral-soft/40 p-3 bg-neutral-soft/5 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className="w-4 h-4 rounded-full border border-neutral-soft" 
                                      style={{ 
                                        backgroundColor: col.color_code,
                                        backgroundImage: col.color_image ? `url(${col.color_image})` : 'none',
                                        backgroundSize: 'cover'
                                      }} 
                                    />
                                    <span className="text-xs font-semibold text-fg-luxury">{col.color_name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = productColors.filter(c => c.id !== col.id);
                                      setProductColors(updated);
                                      showToast(`Removed colorway: ${col.color_name}`, 'info');
                                    }}
                                    className="text-red-400 hover:text-red-500 text-[10px]"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                {/* Color Specific Media list */}
                                <div className="flex flex-col gap-2 border-t border-neutral-soft/20 pt-2 text-left">
                                  <span className="text-[8px] uppercase tracking-wider text-text-muted font-semibold">Color Specific Photos & Videos</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {col.images?.map((img: string, imgIdx: number) => (
                                      <div key={imgIdx} className="relative w-10 h-14 border border-neutral-soft overflow-hidden group">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newImgs = col.images.filter((_: any, i: number) => i !== imgIdx);
                                            const updatedColors = productColors.map(c => c.id === col.id ? { ...c, images: newImgs } : c);
                                            setProductColors(updatedColors);
                                          }}
                                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-[8px] font-bold"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                    {col.videos?.map((vid: string, vidIdx: number) => (
                                      <div key={vidIdx} className="relative w-10 h-14 border border-neutral-soft overflow-hidden bg-neutral-soft/20 group flex items-center justify-center">
                                        <span className="text-[7px] uppercase font-bold text-fg-luxury">Video</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newVids = col.videos.filter((_: any, i: number) => i !== vidIdx);
                                            const updatedColors = productColors.map(c => c.id === col.id ? { ...c, videos: newVids } : c);
                                            setProductColors(updatedColors);
                                          }}
                                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-[8px] font-bold"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Add media URL tool */}
                                  <div className="flex gap-2 mt-1">
                                    <input 
                                      type="text" 
                                      placeholder="Paste Image/Video URL here & press Enter"
                                      id={`media-input-${col.id}`}
                                      className="input-editorial text-[9px] py-1 px-2 flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const val = (e.target as HTMLInputElement).value.trim();
                                          if (!val) return;
                                          const isVideo = val.endsWith('.mp4') || val.endsWith('.webm') || val.endsWith('.mov') || val.includes('/video/') || val.includes('_video');
                                          
                                          const updatedColors = productColors.map(c => {
                                            if (c.id === col.id) {
                                              if (isVideo) {
                                                return { ...c, videos: [...(c.videos || []), val] };
                                              } else {
                                                return { ...c, images: [...(c.images || []), val] };
                                              }
                                            }
                                            return c;
                                          });
                                          setProductColors(updatedColors);
                                          (e.target as HTMLInputElement).value = '';
                                          showToast('Added media file reference.', 'success');
                                        }
                                      }}
                                    />
                                    <label className="btn-editorial py-1 px-2.5 text-[8px] uppercase font-semibold cursor-pointer border border-neutral-soft/80 flex items-center justify-center gap-1">
                                      <Upload size={10} /> Upload
                                      <input 
                                        type="file" 
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          try {
                                            showToast('Uploading media to storage...', 'info');
                                            const url = await uploadMedia(file, 'products');
                                            const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
                                            
                                            const updatedColors = productColors.map(c => {
                                              if (c.id === col.id) {
                                                if (isVideo) {
                                                  return { ...c, videos: [...(c.videos || []), url] };
                                                } else {
                                                  return { ...c, images: [...(c.images || []), url] };
                                                }
                                              }
                                              return c;
                                            });
                                            setProductColors(updatedColors);
                                            showToast('Media uploaded and attached successfully.', 'success');
                                          } catch (uploadErr: any) {
                                            showToast(`Upload failed: ${uploadErr.message || 'Error'}`, 'error');
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part B: Manage Sizes */}
                    <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4 bg-bg-luxury">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">2. Configure Available Sizes</span>
                      <div className="flex flex-wrap gap-4">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((size) => {
                          const isChecked = checkedSizes.includes(size);
                          return (
                            <label key={size} className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setCheckedSizes(checkedSizes.filter(s => s !== size));
                                  } else {
                                    setCheckedSizes([...checkedSizes, size]);
                                  }
                                }}
                                className="w-3.5 h-3.5 accent-fg-luxury"
                              />
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${isChecked ? 'text-accent-gold font-bold' : 'text-text-muted'}`}>{size}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Part C: Variant Matrix Stock, SKU & Price overrides */}
                    {productColors.length > 0 && checkedSizes.length > 0 && (
                      <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4 bg-bg-luxury">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">3. Variant Combinations & Inventory Settings</span>
                        
                        <div className="overflow-x-auto max-h-[300px] border border-neutral-soft/20">
                          <table className="w-full text-[10px] text-left uppercase tracking-wider text-fg-luxury">
                            <thead>
                              <tr className="border-b border-neutral-soft bg-neutral-soft/10 text-[8px] text-text-muted font-bold">
                                <th className="py-2.5 px-4 text-center">Active</th>
                                <th className="py-2.5 px-4">Combination</th>
                                <th className="py-2.5 px-4">Available Stock</th>
                                <th className="py-2.5 px-4">SKU Code</th>
                                <th className="py-2.5 px-4">Price Override (INR)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productColors.map((col) => (
                                checkedSizes.map((size) => {
                                  const key = `${col.color_name}-${size}`;
                                  const cell = variantMatrix[key] || { stock: 0, sku: '', additionalPrice: 0, isActive: true };
                                  
                                  return (
                                    <tr key={key} className="border-b border-neutral-soft/20 hover:bg-neutral-soft/5">
                                      <td className="py-2 px-4 text-center">
                                        <input 
                                          type="checkbox"
                                          checked={cell.isActive}
                                          onChange={(e) => {
                                            setVariantMatrix({
                                              ...variantMatrix,
                                              [key]: { ...cell, isActive: e.target.checked }
                                            });
                                          }}
                                          className="w-3.5 h-3.5 accent-fg-luxury"
                                        />
                                      </td>
                                      <td className="py-2 px-4 font-semibold">
                                        {col.color_name} / {size}
                                      </td>
                                      <td className="py-2 px-4">
                                        <input 
                                          type="number"
                                          value={cell.stock === 0 ? '' : cell.stock}
                                          placeholder="0"
                                          onChange={(e) => {
                                            setVariantMatrix({
                                              ...variantMatrix,
                                              [key]: { ...cell, stock: Number(e.target.value) }
                                            });
                                          }}
                                          className="w-20 bg-transparent border border-neutral-soft/60 px-2 py-1 text-[10px] text-fg-luxury"
                                        />
                                      </td>
                                      <td className="py-2 px-4">
                                        <input 
                                          type="text"
                                          value={cell.sku}
                                          placeholder="Auto-generated"
                                          onChange={(e) => {
                                            setVariantMatrix({
                                              ...variantMatrix,
                                              [key]: { ...cell, sku: e.target.value }
                                            });
                                          }}
                                          className="w-32 bg-transparent border border-neutral-soft/60 px-2 py-1 text-[10px] text-fg-luxury"
                                        />
                                      </td>
                                      <td className="py-2 px-4">
                                        <input 
                                          type="number"
                                          value={cell.additionalPrice === 0 ? '' : cell.additionalPrice}
                                          placeholder="₹0.00"
                                          onChange={(e) => {
                                            setVariantMatrix({
                                              ...variantMatrix,
                                              [key]: { ...cell, additionalPrice: Number(e.target.value) }
                                            });
                                          }}
                                          className="w-24 bg-transparent border border-neutral-soft/60 px-2 py-1 text-[10px] text-fg-luxury"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Save Action */}
                        <button
                          type="button"
                          onClick={handleSaveColorsAndVariants}
                          disabled={isSaving}
                          className="btn-editorial-solid self-end text-[10px] tracking-widest font-semibold py-3 px-6 cursor-pointer mt-2"
                        >
                          {isSaving ? 'Processing configs...' : 'Save Colors & Variants Configuration'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 5: Collapsible SEO parameters */}
                {editTab === 'seo' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="border border-neutral-soft/50 p-4">
                      <button 
                        type="button" 
                        onClick={() => setSeoExpanded(!seoExpanded)}
                        className="flex justify-between items-center w-full text-[10px] uppercase tracking-wider font-semibold text-fg-luxury"
                      >
                        <span>Google Search Preview parameters</span>
                        <span>{seoExpanded ? 'Collapse' : 'Expand'}</span>
                      </button>
                      
                      {seoExpanded && (
                        <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-neutral-soft/20">
                          <div>
                            <label className="text-[9px] uppercase block mb-1">SEO Title Tag</label>
                            <input 
                              type="text" 
                              value={editingProduct.seoTitle || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, seoTitle: e.target.value })}
                              className="input-editorial text-xs text-fg-luxury bg-transparent border-b border-neutral-soft/80" 
                              placeholder="e.g. Linen Trench Coat | Luxury Capsule" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase block mb-1">SEO Meta Description</label>
                            <textarea 
                              value={editingProduct.seoDescription || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, seoDescription: e.target.value })}
                              className="input-editorial h-12 resize-none text-xs leading-relaxed text-fg-luxury bg-transparent border-b border-neutral-soft/80" 
                              placeholder="Provide search description context..." 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab content 6: Complete the Look */}
                {editTab === 'look' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out] text-left">
                    <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4 bg-bg-luxury">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">Manage Complete the Look Mappings</span>
                      
                      {/* Search and add lookup products */}
                      <div className="bg-neutral-soft/10 p-3.5 border border-neutral-soft/30 flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Add Related Look Recommendation</span>
                        <div className="flex gap-2">
                          <select
                            value={selectedLookProductId}
                            onChange={(e) => setSelectedLookProductId(e.target.value)}
                            className="bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none flex-1 text-fg-luxury"
                          >
                            <option value="">— Select Product to Recommend —</option>
                            {products.filter(p => p.id !== editingProduct.id).map(prod => (
                              <option key={prod.id} value={prod.id}>{prod.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!selectedLookProductId) {
                                showToast('Select a product first.', 'error');
                                return;
                              }
                              if (editingLookProducts.some(p => p.id === selectedLookProductId)) {
                                showToast('Already in recommended list.', 'info');
                                return;
                              }
                              try {
                                await addProductLookProduct(editingProduct.id, selectedLookProductId, editingLookProducts.length);
                                const addedProduct = products.find(p => p.id === selectedLookProductId);
                                if (addedProduct) {
                                  setEditingLookProducts([...editingLookProducts, addedProduct]);
                                }
                                setSelectedLookProductId('');
                                showToast('Recommendation added.', 'success');
                              } catch {
                                showToast('Failed to save mapping.', 'error');
                              }
                            }}
                            className="btn-editorial-solid text-[9px] py-2 px-4 cursor-pointer"
                          >
                            Add Relation
                          </button>
                        </div>
                      </div>

                      {/* Display current relations */}
                      {editingLookProducts.length === 0 ? (
                        <p className="text-[10px] uppercase text-text-muted text-center py-6">No look recommendations configured yet</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium">Currently Linked Articles</span>
                          <div className="flex flex-col gap-2">
                            {editingLookProducts.map((lookP) => (
                              <div key={lookP.id} className="flex justify-between items-center border border-neutral-soft/30 p-2 bg-neutral-soft/10">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">{lookP.name}</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await removeProductLookProduct(editingProduct.id, lookP.id);
                                      setEditingLookProducts(editingLookProducts.filter(p => p.id !== lookP.id));
                                      showToast('Recommendation link removed.', 'info');
                                    } catch {
                                      showToast('Failed to delete mapping.', 'error');
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-600 text-[10px] p-1 cursor-pointer"
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab content 7: Combo Offers */}
                {editTab === 'combos' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out] text-left">
                    <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4 bg-bg-luxury">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">Manage Combo Offers</span>
                      
                      {/* Create combo form */}
                      <div className="bg-neutral-soft/10 p-3.5 border border-neutral-soft/30 flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Create Combo Offer with this product</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[8px] uppercase text-text-muted block mb-1">Select Partner Product</label>
                            <select
                              value={comboPartnerProductId}
                              onChange={(e) => setComboPartnerProductId(e.target.value)}
                              className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none text-fg-luxury"
                            >
                              <option value="">— Select Companion Product —</option>
                              {products.filter(p => p.id !== editingProduct.id).map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[8px] uppercase text-text-muted block mb-1">Combo Offer price (Selling Price, INR)</label>
                            <input
                              type="number"
                              value={comboOfferPrice === 0 ? '' : comboOfferPrice}
                              onChange={(e) => setComboOfferPrice(Number(e.target.value))}
                              placeholder="e.g. 2499"
                              className="input-editorial text-xs py-1.5 px-2 w-full text-fg-luxury bg-transparent border-b border-neutral-soft/80"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!comboPartnerProductId || !comboOfferPrice) {
                              showToast('Partner product and combo price are required.', 'error');
                              return;
                            }
                            const partnerProduct = products.find(p => p.id === comboPartnerProductId);
                            if (!partnerProduct) return;
                            try {
                              const created = await createComboOffer({
                                title: `${editingProduct.name} + ${partnerProduct.name}`,
                                product_a_id: editingProduct.id,
                                product_b_id: comboPartnerProductId,
                                combo_price: comboOfferPrice
                              });
                              // Hydrate object
                              const comboWithProducts = {
                                ...created,
                                product_a: editingProduct,
                                product_b: partnerProduct
                              };
                              setEditingCombos([...editingCombos, comboWithProducts]);
                              setComboPartnerProductId('');
                              setComboOfferPrice(0);
                              showToast('Combo offer created successfully.', 'success');
                            } catch {
                              showToast('Failed to create combo. Duplicate combo might exist.', 'error');
                            }
                          }}
                          className="btn-editorial-solid text-[9px] py-2 px-4 cursor-pointer self-end"
                        >
                          Create Combo
                        </button>
                      </div>

                      {/* Display current product combos */}
                      {editingCombos.length === 0 ? (
                        <p className="text-[10px] uppercase text-text-muted text-center py-6">No combo deals featuring this product</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium">Configured Combo Deals</span>
                          <div className="flex flex-col gap-2">
                            {editingCombos.map((comb) => {
                              const isProdA = comb.product_a_id === editingProduct.id;
                              const partnerName = isProdA ? (comb.product_b?.name || 'Companion') : (comb.product_a?.name || 'Companion');
                              return (
                                <div key={comb.id} className="flex justify-between items-center border border-neutral-soft/30 p-2.5 bg-neutral-soft/10">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">{comb.title}</span>
                                    <span className="text-[9px] tracking-wider text-accent-gold font-light">Combo Price: ₹{comb.combo_price.toLocaleString('en-IN')}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await deleteComboOffer(comb.id);
                                        setEditingCombos(editingCombos.filter(c => c.id !== comb.id));
                                        showToast('Combo offer deleted.', 'info');
                                      } catch {
                                        showToast('Failed to delete combo offer.', 'error');
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-600 text-[10px] p-1 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab content 6: Product Details Accordion Manager */}
                {editTab === 'details' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="border border-neutral-soft/50 p-4 flex flex-col gap-4">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">Manage Expandable Sections</span>
                      
                      {/* Section Add Form */}
                      <div className="bg-neutral-soft/10 p-3 border border-neutral-soft/30 flex flex-col gap-3">
                        <span className="text-[9px] uppercase tracking-widest text-fg-luxury font-medium">Add New Accordion Section</span>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="text-[8px] uppercase block mb-0.5">Section Title</label>
                            <input 
                              type="text" 
                              value={newSectionTitle}
                              onChange={(e) => setNewSectionTitle(e.target.value)}
                              placeholder="e.g. Styling Tips, Fabric details..."
                              className="input-editorial text-xs py-1 px-2"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase block mb-0.5 font-semibold">Content Description (Rich Text)</label>
                            <RichTextEditor 
                              value={newSectionContent}
                              onChange={(val) => setNewSectionContent(val)}
                              placeholder="Describe styling suggestions, fabric specifics..."
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newSectionTitle || !newSectionContent) {
                              showToast('Title and Content are required.', 'error');
                              return;
                            }
                            try {
                              const newSec = await saveProductDetailsSection({
                                productId: editingProduct.id,
                                title: newSectionTitle,
                                content: newSectionContent,
                                displayOrder: editingSections.length + 1,
                                enabled: true
                              });
                              setEditingSections([...editingSections, newSec]);
                              setNewSectionTitle('');
                              setNewSectionContent('');
                              showToast('Accordion section added.', 'success');
                            } catch {
                              showToast('Failed to add section.', 'error');
                            }
                          }}
                          className="btn-editorial py-1.5 text-[8px] tracking-wider uppercase font-semibold text-center w-fit cursor-pointer"
                        >
                          <Plus size={10} className="inline mr-1" /> Add Section
                        </button>
                      </div>

                      {/* Sections List */}
                      <div className="flex flex-col gap-3 mt-2">
                        <span className="text-[9px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/20 pb-1">Current Sections ({editingSections.length})</span>
                        
                        {editingSections.length === 0 ? (
                          <p className="text-[10px] text-text-muted italic">No custom sections yet. Showing fallback defaults on the store page.</p>
                        ) : (
                          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                            {editingSections.map((sec, idx) => (
                              <div key={sec.id || idx} className="border border-neutral-soft/30 p-3 bg-bg-luxury flex flex-col gap-2 relative">
                                <div className="flex justify-between items-center">
                                  <input 
                                    type="text" 
                                    value={sec.title}
                                    onChange={(e) => {
                                      const updated = [...editingSections];
                                      updated[idx].title = e.target.value;
                                      setEditingSections(updated);
                                    }}
                                    className="text-[10px] uppercase font-semibold text-fg-luxury bg-transparent border-b border-neutral-soft/20 focus:border-fg-luxury focus:outline-none w-[70%]"
                                  />
                                  <div className="flex gap-2 items-center">
                                    {/* Enable toggle */}
                                    <label className="flex items-center gap-1 cursor-pointer select-none">
                                      <input 
                                        type="checkbox"
                                        checked={sec.enabled ?? true}
                                        onChange={async (e) => {
                                          const updated = [...editingSections];
                                          updated[idx].enabled = e.target.checked;
                                          setEditingSections(updated);
                                          await saveProductDetailsSection(updated[idx]);
                                        }}
                                        className="w-3 h-3"
                                      />
                                      <span className="text-[8px] uppercase text-text-muted">Active</span>
                                    </label>
                                    
                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          await deleteProductDetailsSection(sec.id);
                                          setEditingSections(editingSections.filter(s => s.id !== sec.id));
                                          showToast('Section removed.', 'success');
                                        } catch {
                                          showToast('Failed to delete section.', 'error');
                                        }
                                      }}
                                      className="text-red-800 hover:text-red-950 p-1 cursor-pointer"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <RichTextEditor 
                                  value={sec.content}
                                  onChange={(val) => {
                                    const updated = [...editingSections];
                                    updated[idx].content = val;
                                    setEditingSections(updated);
                                  }}
                                  placeholder="Describe styling suggestions, fabric specifics..."
                                />
                                
                                <div className="flex gap-4 items-center mt-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] uppercase text-text-muted">Display Order:</span>
                                    <input 
                                      type="number"
                                      value={sec.display_order ?? sec.displayOrder ?? 0}
                                      onChange={(e) => {
                                        const updated = [...editingSections];
                                        updated[idx].display_order = Number(e.target.value);
                                        updated[idx].displayOrder = Number(e.target.value);
                                        setEditingSections(updated);
                                      }}
                                      className="w-10 border border-neutral-soft/20 text-[9px] text-fg-luxury px-1 text-center bg-transparent focus:outline-none focus:border-fg-luxury"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await saveProductDetailsSection(sec);
                                        showToast('Changes saved.', 'success');
                                      } catch {
                                        showToast('Failed to save changes.', 'error');
                                      }
                                    }}
                                    className="btn-editorial py-1 px-2.5 text-[8px] uppercase tracking-wider font-semibold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="btn-editorial-solid py-3 text-[10px] tracking-widest uppercase mt-4 flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border border-bg-luxury border-t-fg-luxury rounded-full animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={13} /> Save Product
                    </>
                  )}
                </button>
              </form>

              {/* Right Side: LIVE PREVIEW CARD */}
              <div className="w-full md:w-80 bg-neutral-soft/10 p-6 border border-neutral-soft/60 flex flex-col gap-4 text-left">
                <span className="text-[9px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">
                  Live Preview on Site
                </span>
                
                {/* Live Card mockup */}
                <div className="bg-bg-luxury border border-neutral-soft/80 p-3 flex flex-col gap-3">
                  <div className="aspect-[3/4] bg-neutral-soft/20 overflow-hidden relative">
                    <img 
                      src={editingProduct.images[0]} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    {(editingProduct.stockQty ?? 10) === 0 && (
                      <span className="absolute top-2 left-2 text-[8px] uppercase bg-red-800 text-bg-luxury py-0.5 px-2 font-semibold">Sold Out</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-fg-luxury block truncate">
                      {editingProduct.name || 'Product Title'}
                    </span>
                    <div className="flex justify-between items-baseline mt-1 text-xs">
                      <span className="font-semibold text-fg-luxury">
                        ₹{editingProduct.basePrice.toLocaleString('en-IN')}
                      </span>
                      {editingProduct.mrp && editingProduct.mrp > editingProduct.basePrice && (
                        <span className="text-[9px] text-red-700 font-semibold">
                          {Math.round(((editingProduct.mrp - editingProduct.basePrice) / editingProduct.mrp) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] text-text-muted font-light uppercase tracking-widest mt-1 block truncate">
                      {editingProduct.description || 'Description text...'}
                    </span>
                  </div>
                </div>

                <div className="bg-bg-luxury p-3 text-[9px] text-text-muted flex flex-col gap-1">
                  <p>✔ Auto aspect ratio fit: active</p>
                  <p>✔ Web-friendly compress: active</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Add Product Step-by-Step form container */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-fg-luxury/45 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAddProductSubmit} className="bg-bg-luxury border border-neutral-soft/80 max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto text-left relative shadow-2xl flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-fg-luxury cursor-pointer"
              >
                <X size={16} />
              </button>
              <h3 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">Add New Product</h3>
              
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block font-medium">Product Name</label>
                <input 
                  type="text" 
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="input-editorial text-xs" 
                  placeholder="e.g. Linen Trench Coat" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Original Price (MRP)</label>
                  <input 
                    type="number" 
                    value={newProductForm.mrp === 0 ? '' : newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-editorial text-xs" 
                    placeholder="3999"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Selling Price</label>
                  <input 
                    type="number" 
                    value={newProductForm.basePrice === 0 ? '' : newProductForm.basePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-editorial text-xs" 
                    placeholder="2499" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={newProductForm.stockQty === 0 ? '' : newProductForm.stockQty}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockQty: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="input-editorial text-xs" 
                    placeholder="10" 
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-4 select-none">
                  <input 
                    type="checkbox"
                    id="new-track-quantity"
                    checked={newProductForm.trackQuantity !== false}
                    onChange={(e) => setNewProductForm({ ...newProductForm, trackQuantity: e.target.checked })}
                    className="w-4 h-4 accent-fg-luxury cursor-pointer"
                  />
                  <label htmlFor="new-track-quantity" className="text-[9px] uppercase tracking-wider text-text-muted cursor-pointer font-semibold">
                    Track Inventory Quantities
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Department</label>
                  <select 
                    value={newProductForm.parentCategory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, parentCategory: e.target.value, subCategory: '' })}
                    className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                  >
                    <option value="">— Select Department —</option>
                    {categories.filter(c => !c.parentCategory).map(dept => (
                      <option key={dept.id} value={dept.slug}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Subcategory</label>
                  <select 
                    value={newProductForm.subCategory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subCategory: e.target.value })}
                    className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                  >
                    <option value="">Select Subcategory</option>
                    {categories.filter(c => c.parentCategory === (newProductForm.parentCategory || 'men')).map(sub => (
                      <option key={sub.id} value={sub.slug}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Country of Origin</label>
                <select 
                  value={newProductForm.brand || 'Made in India'}
                  onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                  className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                >
                  <option value="India">India</option>
                  <option value="Made in India">Made in India</option>
                  <option value="Imported">Imported</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block">Product Labels / Tags</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'new-arrivals', label: '🆕 New Arrival' },
                    { value: 'sale', label: '🏷️ Sale' },
                    { value: 'best-seller', label: '🔥 Best Seller' },
                    { value: 'featured', label: '⭐ Featured' },
                  ].map(tag => {
                    const isChecked = (newProductForm.tags || []).includes(tag.value);
                    return (
                      <label key={tag.value} className="flex items-center gap-1.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const current = newProductForm.tags || [];
                            const updated = isChecked
                              ? current.filter(t => t !== tag.value)
                              : [...current, tag.value];
                            setNewProductForm({ ...newProductForm, tags: updated });
                          }}
                          className="w-3 h-3 accent-fg-luxury"
                        />
                        <span className={`text-[9px] uppercase tracking-wider ${isChecked ? 'text-accent-gold font-semibold' : 'text-text-muted font-light'}`}>
                          {tag.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5 block">Product Photos (Upload multiple)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProductForm.images?.map((img, idx) => (
                    <div key={idx} className="w-12 h-16 border border-neutral-soft relative overflow-hidden bg-neutral-soft/10">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button" 
                        onClick={() => deleteImage(idx, 'add')}
                        className="absolute top-0 right-0 bg-red-700 text-bg-luxury p-0.5"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer block text-center">
                  Select Files
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleMultipleImagesUpload(e, 'add')} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Description</label>
                <RichTextEditor 
                  value={newProductForm.description || ''}
                  onChange={(val) => setNewProductForm({ ...newProductForm, description: val })}
                  placeholder="Detail fit parameters or material qualities..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-editorial-solid py-3 text-[10px] tracking-widest uppercase mt-4 flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-bg-luxury border-t-fg-luxury rounded-full animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save Product
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Undo notification bar */}
        {showUndoToast && (
          <div className="fixed bottom-6 right-6 bg-fg-luxury text-bg-luxury p-5 shadow-2xl z-50 flex items-center gap-6 animate-[fadeIn_0.2s_ease-out]">
            <span className="text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} className="text-accent-gold" /> Product Deleted.
            </span>
            <button 
              onClick={handleUndoDelete}
              className="text-accent-gold hover:underline text-[10px] uppercase font-bold tracking-widest"
            >
              Undo (10s)
            </button>
          </div>
        )}

        {/* Bulk Action Sticky Bar */}
        {selectedProductIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-fg-luxury text-bg-luxury py-3.5 px-8 shadow-2xl z-40 flex items-center gap-6 rounded-full border border-neutral-soft/30 animate-[fadeIn_0.2s_ease-out]">
            <span className="text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">
              {selectedProductIds.length} Selected
            </span>
            <div className="h-4 w-[1px] bg-neutral-soft/30" />
            <div className="flex gap-4">
              <button onClick={handleBulkChangeDiscount} className="text-[9px] uppercase tracking-wider font-semibold hover:text-accent-gold">Update Prices</button>
              <button onClick={handleBulkUpdateStock} className="text-[9px] uppercase tracking-wider font-semibold hover:text-accent-gold">Update Stock</button>
              <button onClick={handleBulkDelete} className="text-[9px] uppercase tracking-wider font-semibold text-red-400 hover:text-red-500">Delete Selected</button>
              <button onClick={() => setSelectedProductIds([])} className="text-[9px] uppercase tracking-wider text-neutral-400 hover:text-bg-luxury">Clear</button>
            </div>
          </div>
        )}

        {/* Products Cards list grid with Select Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const stock = p.stockQty ?? 10;
            const isOut = stock === 0;
            const isChecked = selectedProductIds.includes(p.id);

            return (
              <div key={p.id} className={`border p-4 bg-bg-luxury flex flex-col gap-3 justify-between relative transition-all duration-300 ${isChecked ? 'border-fg-luxury ring-1 ring-fg-luxury shadow-md' : 'border-neutral-soft/80'}`}>
                
                {/* Checkbox select */}
                <button 
                  onClick={() => toggleSelectProduct(p.id)}
                  className="absolute top-2 left-2 z-10 p-1 bg-bg-luxury/90 rounded border border-neutral-soft/60 hover:border-fg-luxury"
                >
                  <div className={`w-3.5 h-3.5 flex items-center justify-center ${isChecked ? 'bg-fg-luxury' : ''}`}>
                    {isChecked && <Check size={10} className="text-bg-luxury" />}
                  </div>
                </button>

                <div className="aspect-[3/4] bg-neutral-soft/20 overflow-hidden relative">
                  <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                  {isOut ? (
                    <span className="absolute top-2 right-2 text-[8px] uppercase bg-red-800 text-bg-luxury py-0.5 px-2 font-semibold">Sold Out</span>
                  ) : stock <= 5 ? (
                    <span className="absolute top-2 right-2 text-[8px] uppercase bg-amber-600 text-bg-luxury py-0.5 px-2 font-semibold">Low Stock ({stock})</span>
                  ) : null}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-fg-luxury block truncate">{p.name}</span>
                  <div className="flex justify-between items-baseline mt-1 text-xs">
                    <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
                    <span className="text-[8px] text-text-muted uppercase tracking-wider">{p.brand || 'Origin: India'}</span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-neutral-soft/20 pt-2.5">
                  <button 
                    onClick={() => { setEditingProduct(p); setEditTab('info'); }}
                    className="flex-1 btn-editorial text-[9px] py-1.5 uppercase font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => triggerDeleteWithUndo(p)}
                    className="text-red-700 hover:text-red-800 transition-colors p-1"
                    title="Delete product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Category Management View
  const renderCategories = () => {
    const handleAddCat = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName) return;
      try {
        const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        let bannerUrl = newCategoryBanner;
        // Upload banner to storage if it's a blob URL
        if (newCategoryBanner.startsWith('blob:')) {
          const res = await fetch(newCategoryBanner);
          const blob = await res.blob();
          const file = new File([blob], `${slug}-banner.jpg`, { type: blob.type });
          bannerUrl = await uploadMedia(file, 'categories');
        }
        const created = await createCategory({ 
          name: newCategoryName, 
          slug, 
          imageUrl: bannerUrl, 
          parentCategory: newCategoryParent || null 
        });
        setCategories(prev => [...prev, created]);
        setNewCategoryName('');
        setNewCategoryParent('');
        setNewCategoryBanner('/assets/trench_coat.jpg');
        showToast('Category created successfully.', 'success');
      } catch (err) {
        showToast('Failed to create category.', 'error');
      }
    };

    const handleDeleteCat = async (id: string) => {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast('Category removed.', 'info');
      } catch (err) {
        showToast('Failed to delete category.', 'error');
      }
    };

    const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await uploadMedia(file, 'categories');
        setNewCategoryBanner(url);
        showToast('Banner uploaded.', 'success');
      } catch {
        // Fallback: use blob URL for preview
        setNewCategoryBanner(URL.createObjectURL(file));
        showToast('Banner queued for upload.', 'info');
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Current Category Groups
          </span>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="border border-neutral-soft p-3 bg-neutral-soft/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-10 bg-neutral-soft/20 overflow-hidden border border-neutral-soft">
                    <img src={cat.imageUrl || '/assets/trench_coat.jpg'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="uppercase font-medium text-fg-luxury flex items-center gap-2">
                    {cat.name}
                    {cat.parentCategory && (
                      <span className="text-[7px] bg-neutral-soft/30 px-1.5 py-0.5 rounded tracking-widest text-text-muted">
                        {cat.parentCategory}
                      </span>
                    )}
                  </span>
                </div>
                <button onClick={() => handleDeleteCat(cat.id)} className="text-red-700 hover:text-red-800"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Create Department Category
          </span>
          <form onSubmit={handleAddCat} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase mb-1 block">Category Name</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input-editorial text-xs" 
                placeholder="e.g. Lounge Wear" 
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Parent Department (khaali chodo = naya Department banega)</label>
              <select 
                value={newCategoryParent} 
                onChange={(e) => setNewCategoryParent(e.target.value)}
                className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
              >
                <option value="">🏠 None → New Top-Level Department</option>
                {categories.filter(c => !c.parentCategory).map(dept => (
                  <option key={dept.id} value={dept.slug}>{dept.name} (add subcategory)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1.5 block">Banner Visual</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-neutral-soft/20 border border-neutral-soft overflow-hidden">
                  <img src={newCategoryBanner} className="w-full h-full object-cover" alt="" />
                </div>
                <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer">
                  Change Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleBannerFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
            <button type="submit" className="btn-editorial-solid py-2.5 text-[9px] uppercase font-semibold mt-2">Publish Category</button>
          </form>
        </div>
      </div>
    );
  };

  // 4. Homepage Visual layout Manager
  const renderHomepage = () => {
    // Dropdown options generator
    const getRedirectOptions = () => {
      const options = [
        { value: '/shop', label: 'All Products (/shop)' },
        { value: '/shop/men', label: "Men's Silhouette (/shop/men)" },
        { value: '/shop/women', label: "Women's Silhouette (/shop/women)" },
        { value: '/shop/accessories', label: 'Accessories Edit (/shop/accessories)' },
        { value: '/shop/perfumes', label: 'Luxury Perfumes (/shop/perfumes)' },
        { value: '/shop/sale', label: 'Sale Products (/shop/sale)' },
        { value: '/shop/new-arrivals', label: 'New Arrivals (/shop/new-arrivals)' }
      ];

      // Add database-driven categories/subcategories dynamically
      categories.forEach(cat => {
        const catUrl = `/shop/${cat.slug}`;
        if (!options.find(opt => opt.value === catUrl)) {
          options.push({
            value: catUrl,
            label: cat.parentCategory 
              ? `Subcategory: ${cat.name} (under ${cat.parentCategory})`
              : `Department: ${cat.name}`
          });
        }
      });

      return options;
    };

    const redirectOptions = getRedirectOptions();

    // ─── HERO SLIDES MODERATION ───
    const handleHeroDraftChange = (slideId: string, fields: any) => {
      setHeroDrafts(prev => {
        const slide = heroBanners.find(b => b.id === slideId);
        const currentDraft = prev[slideId] || { ...slide };
        return {
          ...prev,
          [slideId]: {
            ...currentDraft,
            ...fields
          }
        };
      });
    };

    const handleSaveHeroSlide = async (slideId: string) => {
      const draft = heroDrafts[slideId];
      if (!draft) return;

      const slide = heroBanners.find(b => b.id === slideId) || {};
      setSavingHeroId(slideId);
      try {
        const payload = {
          heading: draft.heading !== undefined ? draft.heading : slide.heading,
          subtitle: draft.subtitle !== undefined ? draft.subtitle : slide.subtitle,
          imageUrl: draft.imageUrl !== undefined ? draft.imageUrl : slide.imageUrl,
          ctaText: draft.ctaText !== undefined ? draft.ctaText : slide.ctaText,
          ctaLink: draft.ctaLink !== undefined ? draft.ctaLink : slide.ctaLink,
          showTitle: draft.showTitle !== undefined ? draft.showTitle : slide.showTitle,
          showSubtitle: draft.showSubtitle !== undefined ? draft.showSubtitle : slide.showSubtitle,
          showButton: draft.showButton !== undefined ? draft.showButton : slide.showButton,
          mediaType: draft.mediaType !== undefined ? draft.mediaType : slide.mediaType,
          videoUrl: draft.videoUrl !== undefined ? draft.videoUrl : slide.videoUrl,
          posterUrl: draft.posterUrl !== undefined ? draft.posterUrl : slide.posterUrl,
          focalPoint: draft.focalPoint !== undefined ? draft.focalPoint : slide.focalPoint,
          isPrimary: draft.isPrimary !== undefined ? draft.isPrimary : slide.isPrimary,
          enabled: draft.enabled !== undefined ? draft.enabled : (slide.enabled ?? true),
          imageClickRedirect: draft.imageClickRedirect !== undefined ? draft.imageClickRedirect : (slide.imageClickRedirect ?? true),
          videoClickRedirect: draft.videoClickRedirect !== undefined ? draft.videoClickRedirect : (slide.videoClickRedirect ?? false),
          order: draft.order !== undefined ? parseInt(String(draft.order), 10) : (slide.order ?? 0),
        };

        await updateHeroBanner(slideId, payload);

        // Reload hero list to reflect database-level trigger resets
        const freshBanners = await getHeroBanners();
        const mapped = freshBanners.map((b: any) => ({
          ...b,
          imageUrl: b.image_url || b.imageUrl || '',
          showTitle: b.show_title ?? b.showTitle ?? true,
          showSubtitle: b.show_subtitle ?? b.showSubtitle ?? true,
          showButton: b.show_button ?? b.showButton ?? true,
          mediaType: b.media_type || b.mediaType || 'image',
          videoUrl: b.video_url || b.videoUrl || '',
          posterUrl: b.poster_url || b.posterUrl || '',
          focalPoint: b.focal_point || b.focalPoint || 'center',
          isPrimary: b.is_primary ?? b.isPrimary ?? false,
          enabled: b.enabled ?? true,
          imageClickRedirect: b.image_click_redirect ?? b.imageClickRedirect ?? true,
          videoClickRedirect: b.video_click_redirect ?? b.videoClickRedirect ?? false,
          order: b.order ?? 0,
        }));
        setHeroBanners(mapped);

        setHeroDrafts(prev => {
          const copy = { ...prev };
          delete copy[slideId];
          return copy;
        });
        showToast('Hero slide saved successfully.', 'success');
      } catch (err) {
        showToast('Failed to save hero slide.', 'error');
      } finally {
        setSavingHeroId(null);
      }
    };

    const handleCancelHeroDraft = (slideId: string) => {
      setHeroDrafts(prev => {
        const copy = { ...prev };
        delete copy[slideId];
        return copy;
      });
      showToast('Changes discarded.', 'info');
    };

    const handleCreateHeroSlide = async () => {
      try {
        const newBanner = await saveHeroBanner({
          imageUrl: '/assets/trench_coat.jpg',
          heading: 'NEW CAMPAIGN',
          subtitle: 'Limited Collection Drop',
          ctaText: 'Shop Collection',
          ctaLink: '/shop',
          mediaType: 'image',
          enabled: true,
          imageClickRedirect: true,
          videoClickRedirect: false,
          order: heroBanners.length
        });
        const mapped = {
          ...newBanner,
          imageUrl: newBanner.image_url || newBanner.imageUrl || '',
          showTitle: newBanner.show_title ?? newBanner.showTitle ?? true,
          showSubtitle: newBanner.show_subtitle ?? newBanner.showSubtitle ?? true,
          showButton: newBanner.show_button ?? newBanner.showButton ?? true,
          mediaType: newBanner.media_type || newBanner.mediaType || 'image',
          videoUrl: newBanner.video_url || newBanner.videoUrl || '',
          posterUrl: newBanner.poster_url || newBanner.posterUrl || '',
          focalPoint: newBanner.focal_point || newBanner.focalPoint || 'center',
          isPrimary: newBanner.is_primary ?? newBanner.isPrimary ?? false,
          enabled: newBanner.enabled ?? true,
          imageClickRedirect: newBanner.image_click_redirect ?? newBanner.imageClickRedirect ?? true,
          videoClickRedirect: newBanner.video_click_redirect ?? newBanner.videoClickRedirect ?? false,
          order: newBanner.order ?? 0,
        };
        setHeroBanners(prev => [...prev, mapped]);
        showToast('New hero slide created.', 'success');
      } catch {
        showToast('Failed to create hero slide.', 'error');
      }
    };

    const handleDeleteHeroSlide = async (slideId: string) => {
      if (!window.confirm('Are you sure you want to delete this hero slide?')) return;
      try {
        await deleteHeroBanner(slideId);
        setHeroBanners(prev => prev.filter(b => b.id !== slideId));
        setHeroDrafts(prev => {
          const copy = { ...prev };
          delete copy[slideId];
          return copy;
        });
        showToast('Hero slide deleted.', 'info');
      } catch {
        showToast('Failed to delete hero slide.', 'error');
      }
    };

    // ─── HOMEPAGE SECTIONS MODERATION ───
    const handleSectionDraftChange = (secId: string, fields: any) => {
      setSectionDrafts(prev => {
        const sec = homeSections.find(s => s.id === secId);
        const currentDraft = prev[secId] || { ...sec };
        return {
          ...prev,
          [secId]: {
            ...currentDraft,
            ...fields
          }
        };
      });
    };

    const handleSaveSection = async (secId: string) => {
      const draft = sectionDrafts[secId];
      if (!draft) return;

      setSavingSectionId(secId);
      try {
        const payload = {
          id: draft.id,
          title: draft.title || '',
          subtitle: draft.subtitle || '',
          bannerImage: draft.bannerImage || draft.banner_image || '',
          ctaText: draft.ctaText || draft.cta_text || '',
          ctaLink: draft.ctaLink || draft.cta_link || '',
          visible: draft.visible ?? true,
          order: draft.order || 0,
          featuredProductIds: draft.featuredProductIds || [],
          showTitle: draft.showTitle ?? draft.show_title ?? true,
          showSubtitle: draft.showSubtitle ?? draft.show_subtitle ?? true,
          showButton: draft.showButton ?? draft.show_button ?? true,
          imageClickRedirect: draft.imageClickRedirect ?? draft.image_click_redirect ?? true,
          mediaType: draft.mediaType || draft.media_type || 'image',
          videoUrl: draft.videoUrl || draft.video_url || '',
          posterUrl: draft.posterUrl || draft.poster_url || '',
          focalPoint: draft.focalPoint || draft.focal_point || 'center',
        };

        const updatedSections = homeSections.map(s => s.id === secId ? { ...s, ...payload } : s);
        await saveHomepageSections(updatedSections);
        setHomeSections(updatedSections);

        setSectionDrafts(prev => {
          const copy = { ...prev };
          delete copy[secId];
          return copy;
        });
        showToast('Section saved successfully.', 'success');
      } catch (err) {
        showToast('Failed to save section.', 'error');
      } finally {
        setSavingSectionId(null);
      }
    };

    const handleCancelSectionDraft = (secId: string) => {
      setSectionDrafts(prev => {
        const copy = { ...prev };
        delete copy[secId];
        return copy;
      });
      showToast('Changes discarded.', 'info');
    };

    // ─── LOOKBOOK EDITORIAL JOURNAL MODERATION ───
    const handleCreateEditorialItem = async () => {
      try {
        const newItem = await saveEditorialJournalItem({
          imageUrl: '/assets/tee_white.jpg',
          linkUrl: '/shop',
          order: editorialJournal.length
        });
        setEditorialJournal(prev => [...prev, newItem]);
        showToast('New editorial item created.', 'success');
      } catch {
        showToast('Failed to create editorial item.', 'error');
      }
    };

    const handleDeleteEditorialItem = async (itemId: string) => {
      if (!window.confirm('Delete this editorial image?')) return;
      try {
        await deleteEditorialJournalItem(itemId);
        setEditorialJournal(prev => prev.filter(item => item.id !== itemId));
        showToast('Editorial item deleted.', 'info');
      } catch {
        showToast('Failed to delete editorial item.', 'error');
      }
    };

    const handleUpdateEditorialItem = async (itemId: string, fields: any) => {
      try {
        const item = editorialJournal.find(i => i.id === itemId);
        if (!item) return;
        const updatedPayload = {
          id: itemId,
          imageUrl: fields.imageUrl !== undefined ? fields.imageUrl : (item.image_url || item.imageUrl),
          linkUrl: fields.linkUrl !== undefined ? fields.linkUrl : (item.link_url || item.linkUrl),
          order: fields.order !== undefined ? fields.order : item.order
        };
        const res = await saveEditorialJournalItem(updatedPayload);
        setEditorialJournal(prev => prev.map(i => i.id === itemId ? res : i));
        showToast('Editorial item updated.', 'success');
      } catch {
        showToast('Failed to update editorial item.', 'error');
      }
    };

    const handleEditorialImageChange = async (itemId: string, file: File) => {
      try {
        const url = await uploadMedia(file, 'editorial');
        await handleUpdateEditorialItem(itemId, { imageUrl: url });
      } catch {
        showToast('Failed to upload editorial image.', 'error');
      }
    };

    return (
      <div className="flex flex-col gap-12 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Homepage CMS Layout Manager</h2>
          <p className="text-[9px] text-text-muted uppercase mt-1">Full control over hero slides, campaigns, and lookbook gallery</p>
        </div>

        {/* 1. HERO SLIDES MANAGER */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">1. Hero Slideshow Campaign Banners</h3>
            <button 
              onClick={handleCreateHeroSlide}
              className="btn-editorial py-1 px-3 text-[8px] uppercase tracking-widest hover:bg-fg-luxury hover:text-bg-luxury transition-colors"
            >
              + Add New Slide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroBanners.map((slide, idx) => {
              const draft = heroDrafts[slide.id];
              const isPrimary = draft?.isPrimary ?? slide.isPrimary ?? false;
              const mediaType = draft?.mediaType ?? slide.mediaType ?? 'image';
              const imageUrl = draft?.imageUrl ?? slide.imageUrl ?? '';
              const videoUrl = draft?.videoUrl ?? slide.videoUrl ?? '';
              const posterUrl = draft?.posterUrl ?? slide.posterUrl ?? '';
              const focalPoint = draft?.focalPoint ?? slide.focalPoint ?? 'center';
              const heading = draft?.heading ?? slide.heading ?? '';
              const subtitle = draft?.subtitle ?? slide.subtitle ?? '';
              const ctaText = draft?.ctaText ?? slide.ctaText ?? 'Shop Now';
              const ctaLink = draft?.ctaLink ?? slide.ctaLink ?? '/shop';
              const showTitle = draft?.showTitle ?? slide.showTitle ?? true;
              const showSubtitle = draft?.showSubtitle ?? slide.showSubtitle ?? true;
              const showButton = draft?.showButton ?? slide.showButton ?? true;
              const enabled = draft?.enabled ?? slide.enabled ?? true;
              const imageClickRedirect = draft?.imageClickRedirect ?? slide.imageClickRedirect ?? true;
              const videoClickRedirect = draft?.videoClickRedirect ?? slide.videoClickRedirect ?? false;
              const order = draft?.order ?? slide.order ?? 0;

              const isSaving = savingHeroId === slide.id;

              const handleMediaUpload = async (type: 'image' | 'video' | 'poster', file: File) => {
                try {
                  const url = await uploadMedia(file, 'hero-banners');
                  if (type === 'image') handleHeroDraftChange(slide.id, { imageUrl: url });
                  else if (type === 'video') handleHeroDraftChange(slide.id, { videoUrl: url, mediaType: 'video' });
                  else if (type === 'poster') handleHeroDraftChange(slide.id, { posterUrl: url });
                  showToast(`${type} uploaded to draft. Save to apply.`, 'success');
                } catch {
                  showToast('Failed to upload file.', 'error');
                }
              };

              return (
                <div key={slide.id} className="border border-neutral-soft/80 p-5 bg-bg-luxury flex flex-col gap-4 relative">
                  {/* Status header */}
                  <div className="flex justify-between items-center border-b border-neutral-soft/20 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-fg-luxury text-[10px] uppercase tracking-wider">Slide #{idx + 1}</span>
                      {isPrimary && (
                        <span className="text-[7.5px] uppercase tracking-widest font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">Primary</span>
                      )}
                      {draft && (
                        <span className="text-[7.5px] uppercase tracking-widest font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm animate-pulse">Unsaved changes</span>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleDeleteHeroSlide(slide.id)}
                      className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Delete Slide
                    </button>
                  </div>

                  {/* Primary & Focal point settings */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none border border-neutral-soft/30 px-3 py-1.5 bg-neutral-soft/5">
                      <input 
                        type="checkbox" 
                        checked={isPrimary} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setHeroDrafts(prev => {
                              const copy = { ...prev };
                              heroBanners.forEach(b => {
                                copy[b.id] = { ...(copy[b.id] || b), isPrimary: false };
                              });
                              copy[slide.id] = { ...(copy[slide.id] || slide), isPrimary: true };
                              return copy;
                            });
                          } else {
                            handleHeroDraftChange(slide.id, { isPrimary: false });
                          }
                        }}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest font-semibold text-fg-luxury">Primary Slide</span>
                    </label>

                    <div>
                      <select 
                        value={focalPoint} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { focalPoint: e.target.value })}
                        className="input-editorial py-1 px-1.5 text-[9px] bg-bg-luxury font-light uppercase tracking-wider w-full"
                      >
                        <option value="top">Focal Point: Top</option>
                        <option value="center">Focal Point: Center</option>
                        <option value="bottom">Focal Point: Bottom</option>
                      </select>
                    </div>
                  </div>

                  {/* Enabled Toggle & Slide Order */}
                  <div className="grid grid-cols-2 gap-3 items-center border-t border-neutral-soft/10 pt-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none border border-neutral-soft/30 px-3 py-1.5 bg-neutral-soft/5">
                      <input 
                        type="checkbox" 
                        checked={enabled} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { enabled: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest font-semibold text-fg-luxury">Enabled Status</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[8px] uppercase tracking-widest text-text-muted">Slide Order:</span>
                      <input 
                        type="number" 
                        value={order} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { order: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs w-16" 
                      />
                    </div>
                  </div>

                  {/* Media uploads and type selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-soft/10 pt-3">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block font-semibold">Media Type</label>
                      <select 
                        value={mediaType} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { mediaType: e.target.value })}
                        className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider w-full"
                      >
                        <option value="image">Image Banner</option>
                        <option value="video">Video Loop</option>
                      </select>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex items-center justify-center flex-shrink-0">
                        {mediaType === 'video' ? (
                          videoUrl ? (
                            <video src={videoUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest text-neutral-400">No Video</span>
                          )
                        ) : (
                          <img src={imageUrl || '/assets/trench_coat.jpg'} className="w-full h-full object-cover" alt="" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 w-full">
                        <label className="btn-editorial py-1 text-[8px] text-center uppercase font-semibold cursor-pointer block">
                          {mediaType === 'video' ? 'Upload Video' : 'Upload Image'}
                          <input 
                            type="file" 
                            accept={mediaType === 'video' ? '.mp4,.mov,.webm' : '.jpg,.jpeg,.png,.webp,.gif'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaUpload(mediaType === 'video' ? 'video' : 'image', file);
                            }}
                            className="hidden" 
                          />
                        </label>

                        {mediaType === 'video' && videoUrl && (
                          <button
                            type="button"
                            onClick={() => handleHeroDraftChange(slide.id, { videoUrl: '', mediaType: 'image' })}
                            className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold border border-red-200/50 py-1"
                          >
                            Remove Video
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Poster Image upload for videos */}
                  {mediaType === 'video' && (
                    <div className="flex gap-4 items-center border-t border-neutral-soft/10 pt-3">
                      <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex items-center justify-center flex-shrink-0">
                        {posterUrl ? (
                          <img src={posterUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-[8px] uppercase tracking-widest text-neutral-400">No Poster</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <label className="btn-editorial py-1 text-[8px] text-center uppercase font-semibold cursor-pointer block">
                          Upload Poster Image
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaUpload('poster', file);
                            }}
                            className="hidden" 
                          />
                        </label>
                        {posterUrl && (
                          <button
                            type="button"
                            onClick={() => handleHeroDraftChange(slide.id, { posterUrl: '' })}
                            className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold border border-red-200/50 py-1"
                          >
                            Remove Poster
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Heading & Subtitle */}
                  <div className="grid grid-cols-1 gap-3 border-t border-neutral-soft/10 pt-3">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Slide Heading</label>
                      <input 
                        type="text" 
                        value={heading} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { heading: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Subtitle</label>
                      <input 
                        type="text" 
                        value={subtitle} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { subtitle: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                  </div>

                  {/* CMS Visibility Toggles */}
                  <div className="flex flex-wrap gap-4 py-2 border-y border-neutral-soft/20 my-1">
                    <label className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showTitle} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { showTitle: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      Show Heading
                    </label>
                    <label className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showSubtitle} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { showSubtitle: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      Show Subtitle
                    </label>
                    <label className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showButton} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { showButton: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      Show CTA Button
                    </label>
                  </div>

                  {/* Redirect Configuration Toggles */}
                  <div className="flex flex-wrap gap-4 py-2 border-b border-neutral-soft/20 my-1">
                    <label className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={imageClickRedirect} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { imageClickRedirect: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      Image Click Redirect
                    </label>
                    {mediaType === 'video' && (
                      <label className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={videoClickRedirect} 
                          onChange={(e) => handleHeroDraftChange(slide.id, { videoClickRedirect: e.target.checked })}
                          className="accent-fg-luxury cursor-pointer"
                        />
                        Video Click Redirect
                      </label>
                    )}
                  </div>

                  {/* Button Text & Link */}
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-soft/20">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Button Text</label>
                      <input 
                        type="text" 
                        value={ctaText} 
                        onChange={(e) => handleHeroDraftChange(slide.id, { ctaText: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Redirect Destination</label>
                      <select
                        value={ctaLink}
                        onChange={(e) => handleHeroDraftChange(slide.id, { ctaLink: e.target.value })}
                        className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider w-full"
                      >
                        {redirectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        {!redirectOptions.find(opt => opt.value === ctaLink) && (
                          <option value={ctaLink}>{ctaLink}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Save and Cancel buttons */}
                  <div className="flex gap-3 justify-end mt-2">
                    <button
                      type="button"
                      disabled={!draft || isSaving}
                      onClick={() => handleCancelHeroDraft(slide.id)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border transition-all ${
                        draft && !isSaving 
                          ? 'border-neutral-soft text-fg-luxury hover:bg-neutral-soft/10 cursor-pointer' 
                          : 'border-neutral-soft/30 text-neutral-300 cursor-not-allowed'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!draft || isSaving}
                      onClick={() => handleSaveHeroSlide(slide.id)}
                      className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all font-semibold ${
                        draft && !isSaving 
                          ? 'bg-fg-luxury text-bg-luxury hover:bg-accent-gold hover:text-bg-luxury cursor-pointer' 
                          : 'bg-neutral-soft/20 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Slide'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DYNAMIC HOMEPAGE SECTIONS CMS MANAGER */}
        <div className="flex flex-col gap-6 pt-4 border-t border-neutral-soft/30">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">2. Homepage CMS Sections Manager</h3>
          
          <div className="flex flex-col gap-6">
            {homeSections.filter(sec => sec.id !== 'hero').map((sec) => {
              const draft = sectionDrafts[sec.id];
              const visible = draft?.visible ?? sec.visible ?? true;
              const mediaType = draft?.mediaType ?? sec.mediaType ?? 'image';
              const bannerImage = draft?.bannerImage ?? sec.bannerImage ?? '';
              const videoUrl = draft?.videoUrl ?? sec.videoUrl ?? '';
              const posterUrl = draft?.posterUrl ?? sec.posterUrl ?? '';
              const focalPoint = draft?.focalPoint ?? sec.focalPoint ?? 'center';
              const title = draft?.title ?? sec.title ?? '';
              const subtitle = draft?.subtitle ?? sec.subtitle ?? '';
              const ctaText = draft?.ctaText ?? sec.ctaText ?? '';
              const ctaLink = draft?.ctaLink ?? sec.ctaLink ?? '/shop';
              const showTitle = draft?.showTitle ?? sec.showTitle ?? true;
              const showSubtitle = draft?.showSubtitle ?? sec.showSubtitle ?? true;
              const showButton = draft?.showButton ?? sec.showButton ?? true;
              const imageClickRedirect = draft?.imageClickRedirect ?? sec.imageClickRedirect ?? true;

              const isSaving = savingSectionId === sec.id;

              const handleMediaUpload = async (type: 'image' | 'video' | 'poster', file: File) => {
                try {
                  const url = await uploadMedia(file, 'homepage');
                  if (type === 'image') handleSectionDraftChange(sec.id, { bannerImage: url });
                  else if (type === 'video') handleSectionDraftChange(sec.id, { videoUrl: url, mediaType: 'video' });
                  else if (type === 'poster') handleSectionDraftChange(sec.id, { posterUrl: url });
                  showToast(`${type} uploaded to draft. Save to apply.`, 'success');
                } catch {
                  showToast('Failed to upload file.', 'error');
                }
              };

              return (
                <div key={sec.id} className="border border-neutral-soft/80 p-5 bg-bg-luxury flex flex-col gap-4 relative">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-neutral-soft/20 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-fg-luxury text-[10px] uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${visible ? 'bg-accent-gold' : 'bg-neutral-soft'}`} /> 
                        {sec.title || sec.id} ({sec.id})
                      </span>
                      {!visible && (
                        <span className="text-[7.5px] uppercase tracking-widest font-bold text-red-800 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm">Hidden</span>
                      )}
                      {draft && (
                        <span className="text-[7.5px] uppercase tracking-widest font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm animate-pulse">Unsaved changes</span>
                      )}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => handleSectionDraftChange(sec.id, { visible: !visible })}
                      className={`py-1 px-2.5 text-[8px] uppercase font-semibold border transition-colors cursor-pointer ${
                        visible 
                          ? 'border-neutral-soft text-fg-luxury hover:bg-neutral-soft/5' 
                          : 'border-red-200 text-red-800 bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      {visible ? 'Hide Section' : 'Show Section'}
                    </button>
                  </div>

                  {/* Media source and type configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Media upload choice & Preview */}
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[8px] uppercase tracking-widest mb-1 block font-semibold">Media Type</label>
                          <select 
                            value={mediaType} 
                            onChange={(e) => handleSectionDraftChange(sec.id, { mediaType: e.target.value })}
                            className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider w-full"
                          >
                            <option value="image">Image Block</option>
                            <option value="video">Video Loop</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-widest mb-1 block font-semibold">Focal Alignment</label>
                          <select 
                            value={focalPoint} 
                            onChange={(e) => handleSectionDraftChange(sec.id, { focalPoint: e.target.value })}
                            className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider w-full"
                          >
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center mt-1">
                        <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex items-center justify-center flex-shrink-0">
                          {mediaType === 'video' ? (
                            videoUrl ? (
                              <video src={videoUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <span className="text-[8px] uppercase tracking-widest text-neutral-400">No Video</span>
                            )
                          ) : (
                            bannerImage ? (
                              <img src={bannerImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-[8px] uppercase tracking-widest text-neutral-400">No Image</span>
                            )
                          )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                          <label className="btn-editorial py-1 text-[8px] text-center uppercase font-semibold cursor-pointer block">
                            {mediaType === 'video' ? 'Upload Video' : 'Upload Image'}
                            <input 
                              type="file" 
                              accept={mediaType === 'video' ? '.mp4,.mov,.webm' : '.jpg,.jpeg,.png,.webp,.gif'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleMediaUpload(mediaType === 'video' ? 'video' : 'image', file);
                              }}
                              className="hidden" 
                            />
                          </label>

                          {mediaType === 'video' && videoUrl && (
                            <button
                              type="button"
                              onClick={() => handleSectionDraftChange(sec.id, { videoUrl: '', mediaType: 'image' })}
                              className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold border border-red-200/50 py-1"
                            >
                              Remove Video
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Poster Image upload (Videos only) */}
                    {mediaType === 'video' && (
                      <div className="flex gap-4 items-center mt-auto">
                        <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex items-center justify-center flex-shrink-0">
                          {posterUrl ? (
                            <img src={posterUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest text-neutral-400">No Poster</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <label className="btn-editorial py-1 text-[8px] text-center uppercase font-semibold cursor-pointer block">
                            Upload Poster Image
                            <input 
                              type="file" 
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleMediaUpload('poster', file);
                              }}
                              className="hidden" 
                            />
                          </label>
                          {posterUrl && (
                            <button
                              type="button"
                              onClick={() => handleSectionDraftChange(sec.id, { posterUrl: '' })}
                              className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold border border-red-200/50 py-1"
                            >
                              Remove Poster
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title & Subtitle / Description */}
                  <div className="grid grid-cols-2 gap-3 border-t border-neutral-soft/10 pt-3">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Title / Heading</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { title: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Subtitle / Description</label>
                      <input 
                        type="text" 
                        value={subtitle} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { subtitle: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                  </div>

                  {/* CTA Text & Link */}
                  <div className="grid grid-cols-2 gap-3 border-t border-neutral-soft/10 pt-3">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Button Text</label>
                      <input 
                        type="text" 
                        value={ctaText} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { ctaText: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Redirect Link</label>
                      <select
                        value={ctaLink}
                        onChange={(e) => handleSectionDraftChange(sec.id, { ctaLink: e.target.value })}
                        className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider w-full"
                      >
                        {redirectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        {!redirectOptions.find(opt => opt.value === ctaLink) && (
                          <option value={ctaLink}>{ctaLink}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Presentation Toggles */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-y border-neutral-soft/10 py-3 my-1 text-left">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showTitle} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { showTitle: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Heading</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showSubtitle} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { showSubtitle: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Description</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={showButton} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { showButton: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Button</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={imageClickRedirect} 
                        onChange={(e) => handleSectionDraftChange(sec.id, { imageClickRedirect: e.target.checked })}
                        className="accent-fg-luxury cursor-pointer"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Make Media Clickable</span>
                    </label>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-3 justify-end mt-1">
                    <button
                      type="button"
                      disabled={!draft || isSaving}
                      onClick={() => handleCancelSectionDraft(sec.id)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border transition-all ${
                        draft && !isSaving 
                          ? 'border-neutral-soft text-fg-luxury hover:bg-neutral-soft/10 cursor-pointer' 
                          : 'border-neutral-soft/30 text-neutral-300 cursor-not-allowed'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!draft || isSaving}
                      onClick={() => handleSaveSection(sec.id)}
                      className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all font-semibold ${
                        draft && !isSaving 
                          ? 'bg-fg-luxury text-bg-luxury hover:bg-accent-gold hover:text-bg-luxury cursor-pointer' 
                          : 'bg-neutral-soft/20 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Section'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 3. LOOKBOOK EDITORIAL JOURNAL MANAGER */}
        <div className="flex flex-col gap-6 pt-4 border-t border-neutral-soft/30">
          <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">3. Lookbook Editorial Journal</h3>
            <button 
              onClick={handleCreateEditorialItem}
              className="btn-editorial py-1 px-3 text-[8px] uppercase tracking-widest hover:bg-fg-luxury hover:text-bg-luxury transition-colors"
            >
              + Add Lookbook Card
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {editorialJournal.map((item, idx) => (
              <div key={item.id} className="border border-neutral-soft/80 p-3 bg-bg-luxury flex flex-col gap-2 relative group">
                <div className="aspect-[3/4] bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative">
                  <img src={item.image_url || item.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="btn-editorial text-center py-1 text-[8px] uppercase font-semibold cursor-pointer">
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditorialImageChange(item.id, file);
                      }}
                      className="hidden" 
                    />
                  </label>

                  <select
                    value={item.link_url || item.linkUrl || '/shop'}
                    onChange={(e) => handleUpdateEditorialItem(item.id, { linkUrl: e.target.value })}
                    className="input-editorial py-1 px-1 text-[8px] bg-bg-luxury font-light uppercase tracking-wider"
                  >
                    {redirectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex gap-1 items-center">
                      <label className="text-[7px] uppercase font-light">Order</label>
                      <input 
                        type="number" 
                        value={item.order ?? idx} 
                        onChange={(e) => handleUpdateEditorialItem(item.id, { order: parseInt(e.target.value) || 0 })}
                        className="w-8 border border-neutral-soft/60 bg-transparent text-[8px] text-center"
                      />
                    </div>
                    <button 
                      onClick={() => handleDeleteEditorialItem(item.id)}
                      className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  // 5. Orders Render
  const renderOrders = () => (
    <div className="flex flex-col gap-6 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Orders Fulfillment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrders.map(o => (
          <div key={o.id} className="border border-neutral-soft p-6 bg-bg-luxury flex flex-col gap-4 justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-fg-luxury uppercase tracking-wider">
                  {o.orderNumber ? `#${o.orderNumber}` : o.id}
                </span>
                <span className="text-[8px] text-text-muted font-light ml-3">{o.date}</span>
              </div>
              <span className={`text-[9.5px] uppercase font-semibold py-1 px-3 border border-neutral-soft ${o.status === 'delivered' ? 'bg-green-50 text-green-800' : o.status === 'cancelled' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                {o.status}
              </span>
            </div>
            
            <div className="text-[10px] text-text-muted font-light flex flex-col gap-1">
              <p className="font-semibold text-fg-luxury">{o.customer}</p>
              <p>Phone: {o.phone}</p>
              <p>Method: {o.paymentMethod}</p>
              <p className="italic text-fg-luxury mt-1 font-medium">&ldquo;{o.items}&rdquo;</p>
            </div>

            {/* Cancellation Request Panel */}
            {o.cancelRequested && (
              <div className="border border-red-700 bg-red-50/10 p-4 text-left flex flex-col gap-2.5 my-1.5 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-red-700">Order Cancellation Request</span>
                  <span className={`text-[8px] uppercase tracking-wider font-semibold ${
                    o.cancelRequestStatus === 'approved' 
                      ? 'text-green-700' 
                      : o.cancelRequestStatus === 'rejected' 
                      ? 'text-red-700' 
                      : 'text-amber-700 animate-pulse'
                  }`}>
                    Status: {o.cancelRequestStatus || 'Pending'}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  <span className="font-semibold text-fg-luxury block uppercase tracking-wider text-[8px] mb-0.5">Reason for Cancellation:</span>
                  {o.cancelReason || 'Customer requested cancellation'}
                </p>

                {o.cancelRequestStatus === 'pending' && (
                  <div className="flex gap-2 text-[8.5px] uppercase font-semibold tracking-wider mt-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        const confirm = window.confirm('Are you sure you want to approve this cancellation request? This will mark the order as cancelled.');
                        if (!confirm) return;
                        try {
                          await updateOrderDetails(o.id, {
                            cancelRequestStatus: 'approved',
                            status: 'cancelled'
                          });
                          setOrders(prev => prev.map(item => item.id === o.id ? { ...item, cancelRequestStatus: 'approved', status: 'cancelled' } : item));
                          showToast('Cancellation approved successfully.', 'success');
                        } catch {
                          showToast('Failed to approve cancellation.', 'error');
                        }
                      }}
                      className="bg-red-800 text-white hover:bg-red-900 py-1 px-2 border border-red-700 cursor-pointer transition-colors"
                    >
                      Approve Request
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const notes = window.prompt('Enter reason or admin notes for rejecting this request:');
                        if (notes === null) return;
                        try {
                          await updateOrderDetails(o.id, {
                            cancelRequestStatus: 'rejected',
                            cancelAdminNotes: notes
                          });
                          setOrders(prev => prev.map(item => item.id === o.id ? { ...item, cancelRequestStatus: 'rejected', cancelAdminNotes: notes } : item));
                          showToast('Cancellation request rejected.', 'info');
                        } catch {
                          showToast('Failed to reject cancellation.', 'error');
                        }
                      }}
                      className="bg-transparent text-fg-luxury hover:bg-neutral-soft/20 py-1 px-2 border border-neutral-soft/60 cursor-pointer transition-colors"
                    >
                      Reject Request
                    </button>
                  </div>
                )}

                {o.cancelRequestStatus === 'rejected' && o.cancelAdminNotes && (
                  <p className="text-[9px] text-red-700 italic border-l border-red-200 pl-2">
                    <span className="font-semibold block uppercase tracking-widest text-[7.5px] not-italic mb-0.5 text-text-muted">Rejection Notes:</span>
                    {o.cancelAdminNotes}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-neutral-soft/20 pt-3 flex justify-between items-baseline font-semibold text-fg-luxury">
              <span>Order Value</span>
              <span>₹{o.amount.toLocaleString('en-IN')}</span>
            </div>

            {/* Workflow and status buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-soft/20">
              <span className="text-[8px] uppercase tracking-widest text-text-muted font-semibold">Update Status:</span>
              
              <select
                value={o.status}
                onChange={async (e) => {
                  const nextStatus = e.target.value;
                  try {
                    await updateOrderStatus(o.id, nextStatus);
                    setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: nextStatus as any } : item));
                    showToast(`Order status updated to ${nextStatus}.`, 'success');
                  } catch {
                    showToast('Update failed.', 'error');
                  }
                }}
                className="bg-bg-luxury border border-neutral-soft/80 text-fg-luxury py-1.5 px-3 text-[8.5px] uppercase tracking-widest font-semibold cursor-pointer focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              
              <button 
                onClick={() => handlePrintInvoice(o)}
                className="btn-editorial py-1.5 px-3 text-[9px] flex items-center gap-1 ml-auto"
              >
                <Printer size={11} /> Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. Customers Render
  const renderCustomers = () => (
    <div className="flex flex-col gap-6 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Customers Directory</h2>
      <div className="flex flex-col gap-3">
        {filteredCustomers.map(c => (
          <div key={c.id} className="border border-neutral-soft p-5 bg-bg-luxury flex justify-between items-center">
            <div>
              <p className="font-semibold text-fg-luxury uppercase tracking-wider">{c.name}</p>
              <p className="text-[9px] text-text-muted mt-0.5">{c.email} | Phone: {c.phone}</p>
              <p className="text-[8px] text-text-muted mt-1 font-medium">Orders Count: {c.ordersCount} | Spent: {c.totalSpent} | Last active: {c.lastOrderDate}</p>
            </div>
            <button 
              onClick={() => {
                const updated = customers.map(item => item.id === c.id ? { ...item, blocked: !item.blocked } : item);
                setCustomers(updated);
                showToast(c.blocked ? 'Customer account restored.' : 'Customer blocked.', 'info');
              }}
              className={`py-1.5 px-4 text-[9px] uppercase font-semibold border ${c.blocked ? 'bg-red-50 text-red-800 border-red-700' : 'border-neutral-soft text-text-muted hover:text-fg-luxury'}`}
            >
              {c.blocked ? 'Unblock' : 'Block'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // 7. Coupons Render
  const renderCoupons = () => {
    const handleAddCoupon = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCouponForm.code.trim()) return;

      try {
        const created = await createCoupon({
          code: newCouponForm.code.trim().toUpperCase(),
          discountType: newCouponForm.discountType,
          discountValue: Number(newCouponForm.discountValue || 0),
          maxUses: Number(newCouponForm.maxUses || 100),
          activeFrom: new Date(newCouponForm.activeFrom).toISOString(),
          activeTo: new Date(newCouponForm.activeTo).toISOString(),
          minOrderAmount: Number(newCouponForm.minOrderAmount || 0),
          maxDiscountAmount: Number(newCouponForm.maxDiscountAmount || 0),
          isActive: newCouponForm.isActive,
          discountPercentage: newCouponForm.discountType === 'percentage' ? Number(newCouponForm.discountValue) : 0,
        });
        setCoupons(prev => [created as any, ...prev]);
        setNewCouponForm({
          code: '',
          discountType: 'percentage',
          discountValue: 10,
          maxUses: 100,
          minOrderAmount: 0,
          maxDiscountAmount: 0,
          activeFrom: new Date().toISOString().split('T')[0],
          activeTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true
        });
        showToast('Coupon created successfully.', 'success');
      } catch (err) {
        showToast('Failed to create coupon.', 'error');
      }
    };

    const handleDeleteCoupon = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this coupon?')) return;
      try {
        await deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('Coupon removed.', 'info');
      } catch (err) {
        showToast('Failed to delete coupon.', 'error');
      }
    };

    const handleToggleCouponActive = async (id: string, currentVal: boolean) => {
      try {
        await updateCoupon(id, { isActive: !currentVal });
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentVal } : c));
        showToast(`Coupon ${!currentVal ? 'enabled' : 'disabled'} successfully.`, 'success');
      } catch (err) {
        showToast('Failed to update coupon status.', 'error');
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        
        {/* Active Coupons Panel */}
        <div className="lg:col-span-7 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Active Discount Coupons
          </span>
          <div className="flex flex-col gap-4">
            {coupons.length === 0 ? (
              <p className="text-center py-6 text-text-muted italic">No coupons created yet.</p>
            ) : (
              coupons.map((c) => {
                const expired = new Date(c.activeTo) < new Date();
                return (
                  <div key={c.id} className="border border-neutral-soft p-4 bg-neutral-soft/5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-fg-luxury text-sm uppercase tracking-wider block">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-accent-gold font-medium mt-0.5 block">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={c.isActive ?? false}
                            onChange={() => handleToggleCouponActive(c.id, c.isActive ?? false)}
                            className="accent-fg-luxury cursor-pointer"
                          />
                          <span className="text-[8px] uppercase tracking-wider text-fg-luxury">Active</span>
                        </label>
                        <button 
                          onClick={() => handleDeleteCoupon(c.id)} 
                          className="text-red-700 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-text-muted border-t border-neutral-soft/10 pt-2 font-light">
                      <p>Uses: <span className="text-fg-luxury font-medium">{c.currentUses} / {c.maxUses}</span></p>
                      <p>Min Order: <span className="text-fg-luxury font-medium">₹{c.minOrderAmount ?? 0}</span></p>
                      <p>Max Disc: <span className="text-fg-luxury font-medium">{(c.maxDiscountAmount ?? 0) > 0 ? `₹${c.maxDiscountAmount}` : '—'}</span></p>
                      <p className={expired ? 'text-red-700 font-medium' : ''}>
                        Ends: <span className="font-medium">{new Date(c.activeTo).toLocaleDateString('en-IN')}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create Coupons Panel */}
        <div className="lg:col-span-5 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Create Discount Code
          </span>
          <form onSubmit={handleAddCoupon} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Coupon Code</label>
              <input 
                type="text" 
                value={newCouponForm.code}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, code: e.target.value }))}
                className="input-editorial text-xs uppercase" 
                placeholder="e.g. EXTRA15" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Discount Type</label>
                <select
                  value={newCouponForm.discountType}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, discountType: e.target.value as any }))}
                  className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Value (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Discount Value</label>
                <input 
                  type="number" 
                  value={newCouponForm.discountValue}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  className="input-editorial text-xs" 
                  min="1" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Usage Limit</label>
                <input 
                  type="number" 
                  value={newCouponForm.maxUses}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                  className="input-editorial text-xs" 
                  min="1" 
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Min Order Amount</label>
                <input 
                  type="number" 
                  value={newCouponForm.minOrderAmount}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                  className="input-editorial text-xs" 
                  min="0" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Max Discount (Percentage Only)</label>
              <input 
                type="number" 
                value={newCouponForm.maxDiscountAmount}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
                className="input-editorial text-xs" 
                min="0" 
                placeholder="0 = No limit"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Active From</label>
                <input 
                  type="date" 
                  value={newCouponForm.activeFrom}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, activeFrom: e.target.value }))}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase mb-1 block font-medium">Active To</label>
                <input 
                  type="date" 
                  value={newCouponForm.activeTo}
                  onChange={(e) => setNewCouponForm(prev => ({ ...prev, activeTo: e.target.value }))}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input 
                type="checkbox" 
                checked={newCouponForm.isActive}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="accent-fg-luxury cursor-pointer"
              />
              <span className="text-[9px] uppercase tracking-wider font-semibold text-fg-luxury">Enable Coupon Immediately</span>
            </label>

            <button type="submit" className="btn-editorial-solid py-2.5 text-[9px] uppercase font-semibold mt-2 cursor-pointer">
              Publish Coupon
            </button>
          </form>
        </div>

      </div>
    );
  };

  // 8. Reviews Render
  const renderReviews = () => {
    const pending = reviews.filter((r: any) => !r.status || r.status === 'pending');
    const approved = reviews.filter((r: any) => r.status === 'approved');
    const rejected = reviews.filter((r: any) => r.status === 'rejected');

    const displayed = reviewTab === 'all' ? reviews
      : reviewTab === 'pending' ? pending
      : reviewTab === 'approved' ? approved
      : rejected;

    const handleApprove = async (id: string) => {
      try {
        await approveReview(id);
        setReviews((prev: any[]) => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        showToast('Review approved — now visible on site.', 'success');
      } catch { showToast('Failed to approve review.', 'error'); }
    };

    const handleReject = async (id: string) => {
      try {
        await rejectReview(id);
        setReviews((prev: any[]) => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        showToast('Review rejected — hidden from site.', 'info');
      } catch { showToast('Failed to reject review.', 'error'); }
    };

    const handleDelete = async (id: string) => {
      try {
        await deleteReview(id);
        setReviews((prev: any[]) => prev.filter((r: any) => r.id !== id));
        showToast('Review permanently deleted.', 'info');
      } catch { showToast('Failed to delete review.', 'error'); }
    };

    return (
      <div className="flex flex-col gap-6 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-between items-center border-b border-neutral-soft pb-3">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Review Moderation</h2>
          <div className="flex gap-1">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setReviewTab(tab)}
                className={`text-[8px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                  reviewTab === tab 
                    ? 'bg-fg-luxury text-bg-luxury border-fg-luxury' 
                    : 'border-neutral-soft text-text-muted hover:border-fg-luxury'
                }`}
              >
                {tab}
                {tab === 'pending' && pending.length > 0 && (
                  <span className="ml-1 bg-amber-500 text-black rounded-full px-1 text-[7px] font-bold">{pending.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {displayed.length === 0 ? (
          <p className="text-text-muted text-[10px] uppercase tracking-widest text-center py-12">
            No {reviewTab === 'all' ? '' : reviewTab} reviews
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {displayed.map((rev: any) => (
              <div key={rev.id} className="border border-neutral-soft p-5 bg-bg-luxury flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-fg-luxury uppercase tracking-wider text-[11px]">
                        {rev.product?.name || rev.product || '—'}
                      </span>
                      {/* Status badge */}
                      <span className={`text-[7px] uppercase tracking-widest px-2 py-0.5 font-bold rounded ${
                        (!rev.status || rev.status === 'pending') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        rev.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {rev.status || 'pending'}
                      </span>
                    </div>
                    <span className="text-[9px] text-text-muted font-light">
                      By: {rev.author || rev.user?.full_name || 'Anonymous'}
                      {rev.user?.email && <span className="ml-2 opacity-50">{rev.user.email}</span>}
                    </span>
                  </div>
                  <div className="flex text-accent-gold">
                    {Array.from({ length: rev.rating || 0 }).map((_, i) => (
                      <Star key={i} size={9} className="fill-current" />
                    ))}
                  </div>
                </div>

                <p className="font-light italic text-[10px] leading-relaxed border-l-2 border-neutral-soft/50 pl-3">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2 border-t border-neutral-soft/20">
                  {(!rev.status || rev.status === 'pending' || rev.status === 'rejected') && (
                    <button
                      onClick={() => handleApprove(rev.id)}
                      className="text-[8px] uppercase tracking-widest px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/60 transition-colors font-semibold"
                    >
                      ✅ Approve — Show on Site
                    </button>
                  )}
                  {(!rev.status || rev.status === 'pending' || rev.status === 'approved') && (
                    <button
                      onClick={() => handleReject(rev.id)}
                      className="text-[8px] uppercase tracking-widest px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors font-semibold"
                    >
                      ❌ Reject — Hide from Site
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="text-[8px] uppercase tracking-widest text-neutral-500 hover:text-red-600 transition-colors ml-auto"
                  >
                    🗑 Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 9. Settings Render
  const renderSettings = () => {
    const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await Promise.all([
          saveSiteSetting('brand_name', brandName),
          saveSiteSetting('store_email', storeEmail),
          saveSiteSetting('store_phone', storePhone),
          saveSiteSetting('store_address', storeAddress),
          saveSiteSetting('facebook_url', facebookUrl),
          saveSiteSetting('instagram_url', instagramUrl),
          saveSiteSetting('twitter_url', twitterUrl),
          saveSiteSetting('pinterest_url', pinterestUrl),
          saveSiteSetting('copyright', copyrightText),
          saveSiteSetting('seo_title', seoTitle),
          saveSiteSetting('seo_description', seoDescription),
          saveSiteSetting('footer_info', footerInfo),
          saveSiteSetting('express_delivery_enabled', String(expressDeliveryEnabled)),
          saveSiteSetting('online_payment_enabled', String(onlinePaymentEnabled)),
        ]);
        await logActivity('settings_update', 'Store settings updated');
        showToast('Store settings saved successfully.', 'success');
      } catch (err) {
        showToast('Failed to save settings.', 'error');
      }
    };

    return (
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        
        {/* Core & Social Settings */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-5">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Branding & Contact Info</h2>
          
          <div>
            <label className="text-[9px] uppercase mb-1 block font-medium">Store Brand Name</label>
            <input 
              type="text" 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)} 
              className="input-editorial text-xs" 
              required 
            />
          </div>
          <div>
            <label className="text-[9px] uppercase mb-1 block font-medium">Customer Support Email</label>
            <input 
              type="email" 
              value={storeEmail} 
              onChange={(e) => setStoreEmail(e.target.value)} 
              className="input-editorial text-xs" 
              required 
            />
          </div>
          <div>
            <label className="text-[9px] uppercase mb-1 block font-medium">Store Phone Number</label>
            <input 
              type="text" 
              value={storePhone} 
              onChange={(e) => setStorePhone(e.target.value)} 
              className="input-editorial text-xs" 
              required 
            />
          </div>
          <div>
            <label className="text-[9px] uppercase mb-1 block font-medium">Store Address Details</label>
            <textarea 
              value={storeAddress} 
              onChange={(e) => setStoreAddress(e.target.value)} 
              rows={2}
              className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-xs focus:outline-none text-fg-luxury uppercase tracking-wider" 
              required 
            />
          </div>

          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury pt-2 border-t border-neutral-soft/10">Social Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Instagram URL</label>
              <input 
                type="text" 
                value={instagramUrl} 
                onChange={(e) => setInstagramUrl(e.target.value)} 
                className="input-editorial text-xs" 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Pinterest URL</label>
              <input 
                type="text" 
                value={pinterestUrl} 
                onChange={(e) => setPinterestUrl(e.target.value)} 
                className="input-editorial text-xs" 
              />
            </div>
          </div>
        </div>

        {/* SEO & Operational Settings */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-5">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">SEO & Operations</h2>
            
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">SEO Title Template</label>
              <input 
                type="text" 
                value={seoTitle} 
                onChange={(e) => setSeoTitle(e.target.value)} 
                className="input-editorial text-xs" 
                required 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">SEO Meta Description</label>
              <input 
                type="text" 
                value={seoDescription} 
                onChange={(e) => setSeoDescription(e.target.value)} 
                className="input-editorial text-xs" 
                required 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Footer Info Text</label>
              <textarea 
                value={footerInfo} 
                onChange={(e) => setFooterInfo(e.target.value)} 
                rows={2}
                className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-xs focus:outline-none text-fg-luxury uppercase tracking-wider" 
                required 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block font-medium">Footer Copyright Statement</label>
              <input 
                type="text" 
                value={copyrightText} 
                onChange={(e) => setCopyrightText(e.target.value)} 
                className="input-editorial text-xs" 
                required 
              />
            </div>

            {/* Logistics configurations */}
            <div className="flex flex-col gap-3 pt-3 border-t border-neutral-soft/20 text-[9px] uppercase tracking-wider">
              <span className="font-semibold text-fg-luxury text-[10px]">Operations & Delivery</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={expressDeliveryEnabled} 
                  onChange={(e) => setExpressDeliveryEnabled(e.target.checked)} 
                  className="accent-fg-luxury cursor-pointer" 
                />
                <span>Enable Express Logistics option (₹120)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlinePaymentEnabled} 
                  onChange={(e) => setOnlinePaymentEnabled(e.target.checked)} 
                  className="accent-fg-luxury cursor-pointer" 
                />
                <span>Enable Credit Card / Online Checkout Integration</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center justify-center gap-1.5 mt-4 cursor-pointer">
            <Save size={13} /> Save Store Settings
          </button>
        </div>

      </form>
    );
  };

  // 10. Help Page Render with expanding Step Cards
  const renderHelp = () => {
    const guides = [
      { key: 'add', q: '➕ Add Product', a: 'Step 1: Go to the "Products" manager.\nStep 2: Click the large "+ Add New Product" button.\nStep 3: Enter product name, prices, available stock, and select photos from your device.\nStep 4: Save. The product instantly updates on the storefront catalog!' },
      { key: 'banner', q: '🖼 Change Banner', a: 'Step 1: Open the "Homepage" tab.\nStep 2: Locate the section you want to modify (e.g. Main Hero Slide).\nStep 3: Click "Change Photo" and upload your campaign banner file.\nStep 4: Save settings to instantly update visual campaigns!' },
      { key: 'price', q: '💰 Change Price', a: 'Step 1: Go to "Products" and click "Edit" on the garment card.\nStep 2: Open the "Pricing" tab.\nStep 3: Set your MRP (Original Price) and Selling Price.\nStep 4: Save. The storefront dynamically shows the discount percentage automatically!' },
      { key: 'stock', q: '📦 Update Stock', a: 'Step 1: Select "Edit" on the product card inside "Products".\nStep 2: Open the "Stock" tab.\nStep 3: Set available units quantity. If you write "0", the item automatically updates to OUT OF STOCK and activates customer Notify Me restock subscription alerts.' },
      { key: 'coupon', q: '🏷 Create Coupon', a: 'Step 1: Click "Coupons" in the sidebar menu.\nStep 2: In the right form, enter your code (e.g. SUMMER10) and value percent.\nStep 3: Save. Customers can now redeem this discount code at checkout.' },
      { key: 'order', q: '🚚 Process Order', a: 'Step 1: Open "Orders" in the sidebar.\nStep 2: Click "Accept" to confirm the purchase.\nStep 3: Click "Ship" once the package is ready for courier delivery.\nStep 4: Click "Deliver" once the customer receives it. Click "Invoice" to print thermal receipts.' }
    ];

    return (
      <div className="flex flex-col gap-8 text-left text-xs text-text-muted max-w-3xl animate-[fadeIn_0.3s_ease-out]">
        <div>
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Owner Help Cards</h2>
          <p className="text-[9px] text-text-muted uppercase mt-1">Select any guide below to expand step-by-step instructions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map(guide => {
            const isOpen = activeHelpCard === guide.key;
            return (
              <div 
                key={guide.key} 
                onClick={() => setActiveHelpCard(isOpen ? null : guide.key)}
                className={`border p-6 bg-bg-luxury cursor-pointer transition-all duration-300 ${isOpen ? 'border-fg-luxury ring-1 ring-fg-luxury' : 'border-neutral-soft/80 hover:border-neutral-400'}`}
              >
                <span className="font-semibold text-fg-luxury uppercase tracking-wider text-[11px] block border-b border-neutral-soft/20 pb-2 mb-3">
                  {guide.q}
                </span>
                {isOpen ? (
                  <p className="font-light leading-relaxed whitespace-pre-line text-text-muted animate-[fadeIn_0.2s_ease-out]">
                    {guide.a}
                  </p>
                ) : (
                  <span className="text-[9.5px] uppercase tracking-wider text-accent-gold font-semibold flex items-center gap-1">
                    Show Instructions <ChevronRight size={12} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEnquiries = () => {
    const handleUpdateStatus = async (id: string, newStatus: string) => {
      try {
        await updateTicketStatus(id, newStatus);
        setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        showToast(`Ticket status updated to ${newStatus}.`, 'success');
      } catch {
        showToast('Failed to update status.', 'error');
      }
    };

    const handleDeleteTicket = async (id: string) => {
      if (!window.confirm('Are you sure you want to permanently delete this enquiry?')) return;
      try {
        const { error } = await supabase.from('support_tickets').delete().eq('id', id);
        if (error) throw error;
        setSupportTickets(prev => prev.filter(t => t.id !== id));
        showToast('Enquiry deleted.', 'info');
      } catch {
        showToast('Failed to delete enquiry.', 'error');
      }
    };

    return (
      <div className="flex flex-col gap-6 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-between items-center border-b border-neutral-soft pb-2">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Customer Enquiries</h2>
          <span className="text-[9px] uppercase tracking-widest bg-neutral-soft/30 px-3 py-1 text-fg-luxury font-medium">
            Total: {supportTickets.length}
          </span>
        </div>

        {supportTickets.length === 0 ? (
          <p className="text-text-muted text-[10px] uppercase tracking-widest text-center py-12">No enquiries found</p>
        ) : (
          <div className="flex flex-col gap-4">
            {supportTickets.map((t: any) => (
              <div key={t.id} className="border border-neutral-soft p-5 bg-bg-luxury flex flex-col gap-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-fg-luxury text-[11px] uppercase tracking-wider mb-1">
                      {t.subject || 'Enquiry'}
                    </h3>
                    <p className="text-[9.5px] text-text-muted font-light">
                      By: <span className="font-medium text-fg-luxury">{t.name}</span> | {t.email} {t.phone ? `| ${t.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] text-text-muted font-light">
                      {t.created_at ? new Date(t.created_at).toLocaleString('en-IN') : '—'}
                    </span>
                    <span className={`text-[8.5px] uppercase tracking-widest font-semibold px-2 py-0.5 border ${
                      t.status === 'Closed' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                      t.status === 'Replied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {t.status || 'New'}
                    </span>
                  </div>
                </div>

                <p className="font-light leading-relaxed border-l border-neutral-soft/50 pl-3 italic text-[10.5px]">
                  &ldquo;{t.message}&rdquo;
                </p>

                <div className="flex gap-2 pt-2 border-t border-neutral-soft/10">
                  {t.status !== 'Replied' && t.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Replied')}
                      className="text-[8.5px] uppercase tracking-widest px-3 py-1.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer font-semibold"
                    >
                      Mark as Replied
                    </button>
                  )}
                  {t.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Closed')}
                      className="text-[8.5px] uppercase tracking-widest px-3 py-1.5 border border-neutral-soft hover:bg-neutral-soft/10 hover:text-fg-luxury transition-all cursor-pointer font-medium"
                    >
                      Close Enquiry
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTicket(t.id)}
                    className="text-[8.5px] uppercase tracking-widest px-3 py-1.5 text-red-500 border border-red-500/10 hover:bg-red-500/10 transition-all cursor-pointer font-medium ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSubscribers = () => {
    const handleExport = () => {
      const headers = ['Email Address', 'Subscription Date', 'Source', 'Status'];
      const rows = subscribers.map(sub => [
        sub.email,
        sub.created_at || sub.createdAt || '',
        sub.source || 'footer',
        sub.status || 'subscribed'
      ]);
      downloadCSV('freert_subscribers.csv', headers, rows);
      showToast('Exported subscribers CSV.', 'success');
    };

    const handleDeleteSubscriber = async (email: string) => {
      if (!window.confirm(`Delete subscriber ${email}?`)) return;
      try {
        await deleteNewsletterSubscriber(email);
        setSubscribers(prev => prev.filter(sub => sub.email !== email));
        showToast('Subscriber deleted.', 'success');
      } catch {
        showToast('Failed to delete subscriber.', 'error');
      }
    };

    const filtered = subscribers.filter(sub => 
      sub.email?.toLowerCase().includes(subscriberSearch.toLowerCase())
    );

    return (
      <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-soft/30">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury">Newsletter Subscribers</h2>
            <p className="text-[9px] text-text-muted uppercase mt-0.5">Manage email subscriptions for FREERT Dispatch</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search Subscriber..." 
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
              className="bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[10px] uppercase tracking-wider w-full md:w-48 placeholder-neutral-400 focus:outline-none"
            />
            <button 
              onClick={handleExport}
              className="btn-editorial-solid text-[9px] py-2.5 px-6 tracking-widest uppercase cursor-pointer whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="border border-neutral-soft/80 bg-bg-luxury overflow-x-auto">
          <table className="w-full text-[10px] uppercase tracking-wider text-fg-luxury">
            <thead className="bg-neutral-soft/10 border-b border-neutral-soft/80 text-[8px] font-medium text-text-muted">
              <tr>
                <th className="py-3.5 px-5 text-left font-semibold">Email Address</th>
                <th className="py-3.5 px-5 text-left font-semibold">Source</th>
                <th className="py-3.5 px-5 text-left font-semibold">Joined Date</th>
                <th className="py-3.5 px-5 text-left font-semibold">Status</th>
                <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-light divide-y divide-neutral-soft/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted italic">No subscribers found.</td>
                </tr>
              ) : (
                filtered.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-neutral-soft/5">
                    <td className="py-3.5 px-5 lowercase select-all font-medium text-fg-luxury">{sub.email}</td>
                    <td className="py-3.5 px-5 text-[9px] font-medium text-accent-gold">{sub.source || 'footer'}</td>
                    <td className="py-3.5 px-5 text-text-muted">
                      {sub.created_at || sub.createdAt ? new Date(sub.created_at || sub.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-green-50 text-green-800 text-[8px] font-semibold py-0.5 px-2.5 rounded-full border border-green-200">
                        {sub.status || 'subscribed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => handleDeleteSubscriber(sub.email)}
                        className="text-red-800 hover:text-red-950 p-1 cursor-pointer"
                        aria-label="Delete subscriber"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRestockAlerts = () => {
    const handleExport = () => {
      const headers = ['Product Name', 'Size/Color Variant', 'Email Address', 'Request Date'];
      const rows = restockAlerts.map(alert => {
        const sizeStr = alert.variant?.size || '—';
        const colorStr = alert.variant?.color || '—';
        return [
          alert.product?.name || 'Unknown Product',
          `${sizeStr} / ${colorStr}`,
          alert.email,
          alert.created_at || alert.createdAt || ''
        ];
      });
      downloadCSV('freert_restock_alerts.csv', headers, rows);
      showToast('Exported restock alerts CSV.', 'success');
    };

    const handleDeleteAlert = async (id: string) => {
      try {
        await deleteRestockAlert(id);
        setRestockAlerts(restockAlerts.filter(a => a.id !== id));
        showToast('Restock request deleted.', 'success');
      } catch {
        showToast('Failed to delete request.', 'error');
      }
    };

    return (
      <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-soft/30">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury">Product Restock Alerts</h2>
            <p className="text-[9px] text-text-muted uppercase mt-0.5">Manage customer alerts for out-of-stock garments</p>
          </div>
          <button 
            onClick={handleExport}
            className="btn-editorial-solid text-[9px] py-2.5 px-6 tracking-widest uppercase cursor-pointer whitespace-nowrap"
          >
            Export Requests
          </button>
        </div>

        <div className="border border-neutral-soft/80 bg-bg-luxury overflow-x-auto">
          <table className="w-full text-[10px] uppercase tracking-wider text-fg-luxury">
            <thead className="bg-neutral-soft/10 border-b border-neutral-soft/80 text-[8px] font-medium text-text-muted">
              <tr>
                <th className="py-3.5 px-5 text-left font-semibold">Garment / Product</th>
                <th className="py-3.5 px-5 text-left font-semibold">Variant Spec</th>
                <th className="py-3.5 px-5 text-left font-semibold">Customer Email</th>
                <th className="py-3.5 px-5 text-left font-semibold">Requested Date</th>
                <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-light divide-y divide-neutral-soft/20">
              {restockAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted italic">No restock requests yet.</td>
                </tr>
              ) : (
                restockAlerts.map((alert, idx) => (
                  <tr key={alert.id || idx} className="hover:bg-neutral-soft/5">
                    <td className="py-3.5 px-5 font-medium text-fg-luxury">{alert.product?.name || 'Unknown Product'}</td>
                    <td className="py-3.5 px-5 font-light text-[9px] text-accent-gold">
                      {alert.variant?.size || 'One Size'} / {alert.variant?.color || 'Default'}
                    </td>
                    <td className="py-3.5 px-5 lowercase select-all">{alert.email}</td>
                    <td className="py-3.5 px-5 text-text-muted">
                      {alert.created_at || alert.createdAt ? new Date(alert.created_at || alert.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-800 hover:text-red-950 p-1 cursor-pointer"
                        aria-label="Delete restock alert"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'products': return renderProducts();
      case 'categories': return renderCategories();
      case 'homepage': return renderHomepage();
      case 'orders': return renderOrders();
      case 'customers': return renderCustomers();
      case 'coupons': return renderCoupons();
      case 'reviews': return renderReviews();
      case 'enquiries': return renderEnquiries();
      case 'subscribers': return renderSubscribers();
      case 'restock_alerts': return renderRestockAlerts();
      case 'settings': return renderSettings();
      case 'help': return renderHelp();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {renderActiveView()}
    </div>
  );
}

export default function AdminCMSPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-text-muted uppercase tracking-widest font-light p-12 text-left">Loading...</div>}>
      <AdminCoreWorkspace />
    </React.Suspense>
  );
}
