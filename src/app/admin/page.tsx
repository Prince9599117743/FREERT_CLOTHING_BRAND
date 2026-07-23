'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { 
  getProducts, createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus, getAllCustomers,
  getCoupons, createCoupon, deleteCoupon,
  getAdminReviews, deleteReview, approveReview, rejectReview,
  getAdminSupportTickets, updateTicketStatus,
  getSiteSettings, saveSiteSetting,
  getHeroBanners, saveHeroBanner, updateHeroBanner, deleteHeroBanner, seedDefaultHeroBanners,
  getHomepageSections, saveHomepageSections,
  getEditorialJournal, saveEditorialJournalItem, deleteEditorialJournalItem,
  uploadMedia, getDashboardStats, logActivity,
  createCategory, deleteCategory, getCategories,
  getAdminProductDetailsSections, saveProductDetailsSection, deleteProductDetailsSection,
  getRestockAlerts, deleteRestockAlert, getNewsletterSubscribers
} from '@/services/database';
import type { Product, Category } from '@/types';
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: string;
  paymentMethod: string;
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
  value: number;
  enabled: boolean;
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
  const [editTab, setEditTab] = useState<'info' | 'photos' | 'price' | 'stock' | 'sizes' | 'seo' | 'details'>('info');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const [editingSections, setEditingSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // Automatically fetch details sections for the editing product
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
      loadSections();
    } else {
      setEditingSections([]);
      setNewSectionTitle('');
      setNewSectionContent('');
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
    brand: 'Made in India'
  });

  const [categories, setCategories] = useState<Category[]>([
    { id: 'men', name: 'Men', slug: 'men', imageUrl: '/assets/trench_coat.jpg', createdAt: new Date().toISOString() },
    { id: 'women', name: 'Women', slug: 'women', imageUrl: '/assets/trench_coat.jpg', createdAt: new Date().toISOString() },
    { id: 'accessories', name: 'Accessories', slug: 'accessories', imageUrl: '/assets/trench_coat.jpg', createdAt: new Date().toISOString() },
    { id: 'perfumes', name: 'Perfumes', slug: 'perfumes', imageUrl: '/assets/trench_coat.jpg', createdAt: new Date().toISOString() }
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');
  const [newCategoryBanner, setNewCategoryBanner] = useState('/assets/trench_coat.jpg');

  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [editorialJournal, setEditorialJournal] = useState<any[]>([]);

  const [homeSections, setHomeSections] = useState<HomepageSection[]>([
    { id: 'hero', title: 'Main Hero Slide', subtitle: 'Primary Campaign', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Shop Now', ctaLink: '/shop', visible: true },
    { id: 'men', title: 'Men Silhouette Highlight', subtitle: 'Tailored Minimal Staples', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Shop Men', ctaLink: '/shop/men', visible: true },
    { id: 'women', title: 'Women Highlight Banner', subtitle: 'Linen Silhouettes', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Shop Women', ctaLink: '/shop/women', visible: true },
    { id: 'accessories', title: 'Luxury Accessories Block', subtitle: 'Fine Leather Crafts', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Explore', ctaLink: '/shop/accessories', visible: true },
    { id: 'perfumes', title: 'Olfactory Signature block', subtitle: 'Scent Guidelines', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Scent Me', ctaLink: '/shop/perfumes', visible: true }
  ]);

  const [orders, setOrders] = useState<OrderAdmin[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewTab, setReviewTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0, lowStockCount: 0, pendingOrders: 0 });
  const [newCouponForm, setNewCouponForm] = useState({ code: '', discountPercentage: 10, maxUses: 100, activeFrom: '', activeTo: '' });

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [restockAlerts, setRestockAlerts] = useState<any[]>([]);

  // Load all admin data on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [productList, orderList, customerList, couponList, reviewList, ticketList, settings, stats, categoriesList, cmsSections, heroList, lookbookList, subscribersList, alertsList] = await Promise.allSettled([
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
          getRestockAlerts()
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
          setCoupons(couponList.value.map((c: any) => ({
            id: c.id,
            code: c.code,
            value: c.discount_percentage,
            enabled: new Date(c.active_to) > new Date(),
          })));
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
          setExpressDeliveryEnabled(settings.value['express_delivery_enabled'] !== 'false');
          setOnlinePaymentEnabled(settings.value['online_payment_enabled'] === 'true');
        }

        if (stats.status === 'fulfilled') setDashboardStats(stats.value);

        if (categoriesList.status === 'fulfilled' && categoriesList.value.length > 0) {
          setCategories(categoriesList.value);
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
          }));
          setHomeSections(mapped);
        }

        if (heroList.status === 'fulfilled' && heroList.value) {
          if (heroList.value.length === 0) {
            try {
              const seeded = await seedDefaultHeroBanners();
              setHeroBanners(seeded);
            } catch (seedErr) {
              setHeroBanners([]);
            }
          } else {
            setHeroBanners(heroList.value);
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

  // Mock Invoice Printer Window
  const handlePrintInvoice = (order: OrderAdmin) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #111; line-height: 1.5; }
            .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items th, .items td { text-align: left; padding: 8px 0; }
            .items th { border-bottom: 1px dashed #000; }
            .total { text-align: right; font-size: 14px; font-weight: bold; border-top: 1px dashed #000; padding-top: 15px; }
            .footer { text-align: center; font-size: 9px; color: #777; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>FREERT STORE INVOICE</h2>
            <p>CONCIERGE DEPARTMENT</p>
          </div>
          <div class="meta">
            <div>
              <strong>Order Ref:</strong> ${order.id}<br/>
              <strong>Date:</strong> ${order.date}<br/>
              <strong>Payment Mode:</strong> ${order.paymentMethod}
            </div>
            <div>
              <strong>Customer details:</strong><br/>
              ${order.customer}<br/>
              ${order.phone}<br/>
              ${order.address}
            </div>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Item Specification</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.items}</td>
                <td style="text-align: right;">₹${order.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Paid: ₹${order.amount.toLocaleString('en-IN')}
          </div>
          <div class="footer">
            Thank you for buying from FREERT. This is a digital tax invoice receipt.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          status: (stockQty === 0 ? 'out-of-stock' : 'published') as any,
          images: newProductForm.images || ['/assets/trench_coat.jpg'],
          parentCategory: newProductForm.parentCategory || 'men',
          subCategory: newProductForm.subCategory || 'hoodies',
          brand: newProductForm.brand || 'Made in India',
          isPublished: true,
          rating: 4.8,
          reviewsCount: 0,
        });
        await logActivity('product_create', `Added product: ${created.name}`);
        await refreshProducts();
        setIsAddingProduct(false);
        setNewProductForm({ name: '', description: '', basePrice: 0, mrp: 0, stockQty: 10, images: ['/assets/trench_coat.jpg'], parentCategory: 'men', subCategory: 'hoodies', brand: 'Made in India' });
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
                <div className="flex border-b border-neutral-soft/20 gap-2">
                  {[
                    { key: 'info', label: '📝 Basic info' },
                    { key: 'photos', label: '📷 Photos' },
                    { key: 'price', label: '💰 Pricing' },
                    { key: 'stock', label: '📦 Stock' },
                    { key: 'details', label: '📖 Details Accordion' },
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
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Description</label>
                      <textarea 
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="input-editorial h-20 resize-none text-xs" 
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
                          value={editingProduct.mrp || editingProduct.basePrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                          className="input-editorial text-xs" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Selling Price</label>
                        <input 
                          type="number" 
                          value={editingProduct.basePrice}
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

                {/* Tab content 4: Stock Settings */}
                {editTab === 'stock' && (
                  <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Available Stock quantity</label>
                      <input 
                        type="number" 
                        value={editingProduct.stockQty ?? 10}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: Number(e.target.value) })}
                        className="input-editorial text-xs" 
                        required
                      />
                    </div>
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
                              value={editingProduct.seoTitle || editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, seoTitle: e.target.value })}
                              className="input-editorial text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase block mb-1">Meta Description</label>
                            <textarea 
                              value={editingProduct.seoDescription || editingProduct.description}
                              onChange={(e) => setEditingProduct({ ...editingProduct, seoDescription: e.target.value })}
                              className="input-editorial text-xs h-16 resize-none" 
                            />
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
                            <label className="text-[8px] uppercase block mb-0.5">Content Description (Rich Text)</label>
                            <textarea 
                              value={newSectionContent}
                              onChange={(e) => setNewSectionContent(e.target.value)}
                              placeholder="Describe the details..."
                              className="input-editorial text-xs h-20 resize-none py-1 px-2"
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
                                <textarea 
                                  value={sec.content}
                                  onChange={(e) => {
                                    const updated = [...editingSections];
                                    updated[idx].content = e.target.value;
                                    setEditingSections(updated);
                                  }}
                                  className="text-[10px] font-light text-text-muted bg-transparent border border-neutral-soft/20 focus:border-fg-luxury focus:outline-none p-1.5 h-16 resize-none"
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
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value) })}
                    className="input-editorial text-xs" 
                    placeholder="3999"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Selling Price</label>
                  <input 
                    type="number" 
                    value={newProductForm.basePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: Number(e.target.value) })}
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
                    value={newProductForm.stockQty}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stockQty: Number(e.target.value) })}
                    className="input-editorial text-xs" 
                    placeholder="10" 
                    required
                  />
                </div>
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
                <textarea 
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="input-editorial h-16 resize-none text-xs" 
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
    const handleSaveHeroSlide = async (slideId: string, fields: any) => {
      try {
        await updateHeroBanner(slideId, fields);
        setHeroBanners(prev => prev.map(b => b.id === slideId ? { ...b, ...fields } : b));
        showToast('Hero slide updated successfully.', 'success');
      } catch {
        showToast('Failed to update hero slide.', 'error');
      }
    };

    const handleCreateHeroSlide = async () => {
      try {
        const newBanner = await saveHeroBanner({
          imageUrl: '/assets/trench_coat.jpg',
          heading: 'NEW CAMPAIGN',
          subtitle: 'Limited Collection Drop',
          ctaText: 'Shop Collection',
          ctaLink: '/shop'
        });
        setHeroBanners(prev => [...prev, newBanner]);
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
        showToast('Hero slide deleted.', 'info');
      } catch {
        showToast('Failed to delete hero slide.', 'error');
      }
    };

    const handleHeroImageChange = async (slideId: string, file: File) => {
      try {
        const url = await uploadMedia(file, 'hero-banners');
        await updateHeroBanner(slideId, { imageUrl: url });
        setHeroBanners(prev => prev.map(b => b.id === slideId ? { ...b, image_url: url } : b));
        showToast('Hero slide media updated.', 'success');
      } catch {
        showToast('Failed to upload media.', 'error');
      }
    };

    // ─── HOMEPAGE SECTIONS MODERATION ───
    const handleUpdateSection = async (secId: string, fields: any) => {
      const updated = homeSections.map(s => s.id === secId ? { ...s, ...fields } : s);
      setHomeSections(updated);
      try {
        await saveHomepageSections(updated);
        showToast('Section updated successfully.', 'success');
      } catch {
        showToast('Failed to update section.', 'error');
      }
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
            {heroBanners.map((slide, idx) => (
              <div key={slide.id} className="border border-neutral-soft/80 p-5 bg-bg-luxury flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-fg-luxury text-[10px] uppercase tracking-wider">Slide #{idx + 1}</span>
                  <button 
                    onClick={() => handleDeleteHeroSlide(slide.id)}
                    className="text-red-700 hover:text-red-800 text-[8px] uppercase tracking-widest"
                  >
                    Delete Slide
                  </button>
                </div>

                {/* Image/Video Preview & Upload */}
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex items-center justify-center">
                    {(() => {
                      const url = slide.image_url || slide.imageUrl || '';
                      const isVid = url.toLowerCase().endsWith('.mp4') || 
                                    url.toLowerCase().endsWith('.webm') ||
                                    url.toLowerCase().endsWith('.mov') ||
                                    url.includes('video');
                      if (isVid) {
                        return <video src={url} className="w-full h-full object-cover" muted />;
                      }
                      return <img src={url || '/assets/trench_coat.jpg'} className="w-full h-full object-cover" alt="" />;
                    })()}
                  </div>
                  <label className="btn-editorial py-1.5 px-3 text-[9px] uppercase font-semibold cursor-pointer">
                    Change Media
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroImageChange(slide.id, file);
                      }}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Heading & Subtitle */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[8px] uppercase tracking-widest mb-1 block">Slide Heading</label>
                    <input 
                      type="text" 
                      value={slide.heading || ''} 
                      onChange={(e) => handleSaveHeroSlide(slide.id, { heading: e.target.value })}
                      className="input-editorial py-1 px-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-widest mb-1 block">Subtitle</label>
                    <input 
                      type="text" 
                      value={slide.subtitle || ''} 
                      onChange={(e) => handleSaveHeroSlide(slide.id, { subtitle: e.target.value })}
                      className="input-editorial py-1 px-2 text-xs" 
                    />
                  </div>
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] uppercase tracking-widest mb-1 block">Button Text</label>
                    <input 
                      type="text" 
                      value={slide.cta_text || slide.ctaText || 'Shop Now'} 
                      onChange={(e) => handleSaveHeroSlide(slide.id, { ctaText: e.target.value })}
                      className="input-editorial py-1 px-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase tracking-widest mb-1 block">Redirect Destination</label>
                    <select
                      value={slide.cta_link || slide.ctaLink || '/shop'}
                      onChange={(e) => handleSaveHeroSlide(slide.id, { ctaLink: e.target.value })}
                      className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider"
                    >
                      {redirectOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {/* Allow custom fallback */}
                      {!redirectOptions.find(opt => opt.value === (slide.cta_link || slide.ctaLink)) && (
                        <option value={slide.cta_link || slide.ctaLink}>{slide.cta_link || slide.ctaLink}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. CAMPAIGN HIGHLIGHT SECTIONS MANAGER */}
        <div className="flex flex-col gap-6 pt-4 border-t border-neutral-soft/30">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">2. Campaign Highlight Sections (Men, Women, Accessories, Perfumes)</h3>
          
          <div className="flex flex-col gap-4">
            {homeSections.map((sec) => (
              <div key={sec.id} className="border border-neutral-soft/80 p-5 bg-bg-luxury flex flex-col gap-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-neutral-soft/20 pb-2">
                  <span className="font-semibold text-fg-luxury text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-gold" /> {sec.title || sec.id}
                  </span>
                  <button 
                    onClick={() => handleUpdateSection(sec.id, { visible: !sec.visible })}
                    className={`py-1 px-2.5 text-[8px] uppercase font-semibold border ${sec.visible ? 'border-neutral-soft text-fg-luxury' : 'border-red-200 text-red-800 bg-red-50'}`}
                  >
                    {sec.visible ? 'Hide Section' : 'Show Section'}
                  </button>
                </div>

                {/* Body details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  
                  {/* Photo Section */}
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-16 bg-neutral-soft/10 border border-neutral-soft overflow-hidden relative flex-shrink-0">
                      <img src={sec.bannerImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <label className="btn-editorial py-1.5 px-3 text-[9px] uppercase font-semibold cursor-pointer">
                      Replace Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadMedia(file, 'homepage');
                            handleUpdateSection(sec.id, { bannerImage: url });
                          } catch {
                            showToast('Upload failed.', 'error');
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Title / Heading</label>
                      <input 
                        type="text" 
                        value={sec.title || ''} 
                        onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Subtitle</label>
                      <input 
                        type="text" 
                        value={sec.subtitle || ''} 
                        onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                  </div>

                  {/* CTA Text & Link */}
                  <div className="grid grid-cols-2 gap-3 md:col-span-2">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Button Text</label>
                      <input 
                        type="text" 
                        value={sec.ctaText || ''} 
                        onChange={(e) => handleUpdateSection(sec.id, { ctaText: e.target.value })}
                        className="input-editorial py-1 px-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest mb-1 block">Redirect Link</label>
                      <select
                        value={sec.ctaLink}
                        onChange={(e) => handleUpdateSection(sec.id, { ctaLink: e.target.value })}
                        className="input-editorial py-1 px-1.5 text-xs bg-bg-luxury font-light uppercase tracking-wider"
                      >
                        {redirectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Presentation Toggles */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:col-span-2 border-t border-neutral-soft/10 pt-3 mt-1 text-left">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={sec.showTitle ?? true} 
                        onChange={(e) => handleUpdateSection(sec.id, { showTitle: e.target.checked })}
                        className="w-3.5 h-3.5 border-neutral-soft bg-bg-luxury checked:bg-fg-luxury accent-neutral-800"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Title</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={sec.showSubtitle ?? true} 
                        onChange={(e) => handleUpdateSection(sec.id, { showSubtitle: e.target.checked })}
                        className="w-3.5 h-3.5 border-neutral-soft bg-bg-luxury checked:bg-fg-luxury accent-neutral-800"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Subtitle</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={sec.showButton ?? true} 
                        onChange={(e) => handleUpdateSection(sec.id, { showButton: e.target.checked })}
                        className="w-3.5 h-3.5 border-neutral-soft bg-bg-luxury checked:bg-fg-luxury accent-neutral-800"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Show Button</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={sec.imageClickRedirect ?? true} 
                        onChange={(e) => handleUpdateSection(sec.id, { imageClickRedirect: e.target.checked })}
                        className="w-3.5 h-3.5 border-neutral-soft bg-bg-luxury checked:bg-fg-luxury accent-neutral-800"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-fg-luxury font-medium">Image Click Redirects</span>
                    </label>
                  </div>

                </div>

              </div>
            ))}
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

            <div className="border-t border-neutral-soft/20 pt-3 flex justify-between items-baseline font-semibold text-fg-luxury">
              <span>Order Value</span>
              <span>₹{o.amount.toLocaleString('en-IN')}</span>
            </div>

            {/* Workflow and status buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-soft/20">
              <span className="text-[8px] uppercase tracking-widest text-text-muted mr-1 font-semibold">Change Status:</span>
              
              {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map(status => {
                if (o.status === status) return null;
                
                // Color formatting per status transition
                const btnStyles = 
                  status === 'delivered' ? 'border-green-200 text-green-800 hover:bg-green-50' :
                  status === 'cancelled' ? 'border-red-200 text-red-800 hover:bg-red-50' :
                  status === 'shipped' ? 'border-blue-200 text-blue-800 hover:bg-blue-50' :
                  'border-neutral-soft text-text-muted hover:border-fg-luxury';

                return (
                  <button
                    key={status}
                    onClick={async () => {
                      try {
                        await updateOrderStatus(o.id, status);
                        setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: status as any } : item));
                        showToast(`Order marked as ${status}.`, 'success');
                      } catch {
                        showToast('Update failed.', 'error');
                      }
                    }}
                    className={`text-[8.5px] uppercase font-semibold py-1.5 px-3.5 border cursor-pointer transition-colors ${btnStyles}`}
                  >
                    {status === 'processing' ? 'Accept' : status}
                  </button>
                );
              })}
              
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
      const code = (e.target as any).elements.couponCode.value.trim().toUpperCase();
      const value = Number((e.target as any).elements.couponValue.value);
      if (!code) return;
      try {
        const now = new Date();
        const oneYear = new Date(now);
        oneYear.setFullYear(oneYear.getFullYear() + 1);
        const created = await createCoupon({
          code,
          discountPercentage: value,
          maxUses: 1000,
          activeFrom: now.toISOString(),
          activeTo: oneYear.toISOString(),
        });
        setCoupons(prev => [...prev, { id: created.id, code: created.code, value: created.discountPercentage, enabled: true }]);
        (e.target as any).reset();
        showToast('Coupon created successfully.', 'success');
      } catch (err) {
        showToast('Failed to create coupon.', 'error');
      }
    };

    const handleDeleteCoupon = async (id: string) => {
      try {
        await deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('Coupon removed.', 'info');
      } catch (err) {
        showToast('Failed to delete coupon.', 'error');
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left text-xs text-text-muted animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Active Discount Coupons
          </span>
          <div className="flex flex-col gap-2">
            {coupons.map((c, idx) => (
              <div key={idx} className="border border-neutral-soft p-3 bg-neutral-soft/5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-fg-luxury uppercase tracking-wider">{c.code}</span>
                  <span className="text-[9px] text-text-muted ml-3">{c.value}% OFF</span>
                </div>
                <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-700 hover:text-red-800"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Create Discount Code
          </span>
          <form onSubmit={handleAddCoupon} className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase mb-1 block">Coupon Code</label>
              <input 
                name="couponCode"
                type="text" 
                className="input-editorial text-xs" 
                placeholder="e.g. SPRING30" 
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Discount percentage (%)</label>
              <input 
                name="couponValue"
                type="number" 
                className="input-editorial text-xs" 
                min="5" 
                max="90" 
                required
              />
            </div>
            <button type="submit" className="btn-editorial-solid py-2.5 text-[9px] uppercase font-semibold">Publish Coupon</button>
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
      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 text-left max-w-xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Store Settings</h2>
        
        <div>
          <label className="text-[9px] uppercase mb-1 block font-medium">Store Brand Name</label>
          <input type="text" className="input-editorial text-xs" defaultValue="FREERT" />
        </div>
        <div>
          <label className="text-[9px] uppercase mb-1 block font-medium">Customer Support Email</label>
          <input type="email" className="input-editorial text-xs" defaultValue="concierge@freert.net" />
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-soft/20">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">Payment Options</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked disabled className="accent-fg-luxury" />
            <span>Cash on Delivery (COD)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={onlinePaymentEnabled} 
              onChange={(e) => setOnlinePaymentEnabled(e.target.checked)} 
              className="accent-fg-luxury" 
            />
            <span>Online Payment (Coming Soon)</span>
          </label>
        </div>

        {/* Delivery Options */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-soft/20">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-fg-luxury">Delivery options</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked disabled className="accent-fg-luxury" />
            <span>Standard Delivery (3–5 Business Days)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={expressDeliveryEnabled} 
              onChange={(e) => setExpressDeliveryEnabled(e.target.checked)} 
              className="accent-fg-luxury" 
            />
            <span>Express Delivery (1–2 Business Days)</span>
          </label>
        </div>

        <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center justify-center gap-1.5"><Save size={13} /> Save Store Settings</button>
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
                      {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                    </span>
                    <span className={`text-[8.5px] uppercase tracking-widest font-semibold px-2 py-0.5 border ${
                      t.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      t.status === 'Read' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
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
                  {t.status !== 'Read' && t.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Read')}
                      className="text-[8px] uppercase tracking-widest px-2.5 py-1 border border-neutral-soft hover:bg-neutral-soft/10 hover:text-fg-luxury transition-all cursor-pointer font-medium"
                    >
                      👁 Mark as Read
                    </button>
                  )}
                  {t.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Resolved')}
                      className="text-[8px] uppercase tracking-widest px-2.5 py-1 bg-green-900/10 text-green-400 border border-green-500/20 hover:bg-green-900/30 transition-all cursor-pointer font-semibold"
                    >
                      ✓ Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTicket(t.id)}
                    className="text-[8px] uppercase tracking-widest px-2.5 py-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer font-medium ml-auto"
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
      const headers = ['Email Address', 'Subscription Date', 'Status'];
      const rows = subscribers.map(sub => [
        sub.email,
        sub.created_at || sub.createdAt || '',
        sub.status || 'subscribed'
      ]);
      downloadCSV('freert_subscribers.csv', headers, rows);
      showToast('Exported subscribers CSV.', 'success');
    };

    return (
      <div className="flex flex-col gap-6 text-left animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-soft/30">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury">Newsletter Subscribers</h2>
            <p className="text-[9px] text-text-muted uppercase mt-0.5">Manage email subscriptions for FREERT Dispatch</p>
          </div>
          <button 
            onClick={handleExport}
            className="btn-editorial-solid text-[9px] py-2.5 px-6 tracking-widest uppercase cursor-pointer"
          >
            Export Subscriber List
          </button>
        </div>

        <div className="border border-neutral-soft/80 bg-bg-luxury overflow-x-auto">
          <table className="w-full text-[10px] uppercase tracking-wider text-fg-luxury">
            <thead className="bg-neutral-soft/10 border-b border-neutral-soft/80 text-[8px] font-medium text-text-muted">
              <tr>
                <th className="py-3.5 px-5 text-left font-semibold">Email Address</th>
                <th className="py-3.5 px-5 text-left font-semibold">Joined Date</th>
                <th className="py-3.5 px-5 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="font-light divide-y divide-neutral-soft/20">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-text-muted italic">No subscribers yet.</td>
                </tr>
              ) : (
                subscribers.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-neutral-soft/5">
                    <td className="py-3.5 px-5 lowercase select-all font-medium text-fg-luxury">{sub.email}</td>
                    <td className="py-3.5 px-5 text-text-muted">
                      {sub.created_at || sub.createdAt ? new Date(sub.created_at || sub.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-green-50 text-green-800 text-[8px] font-semibold py-0.5 px-2.5 rounded-full border border-green-200">
                        {sub.status || 'subscribed'}
                      </span>
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
      const headers = ['Product Name', 'Email Address', 'Request Date'];
      const rows = restockAlerts.map(alert => [
        alert.product?.name || 'Unknown Product',
        alert.email,
        alert.created_at || alert.createdAt || ''
      ]);
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
            className="btn-editorial-solid text-[9px] py-2.5 px-6 tracking-widest uppercase cursor-pointer"
          >
            Export Requests
          </button>
        </div>

        <div className="border border-neutral-soft/80 bg-bg-luxury overflow-x-auto">
          <table className="w-full text-[10px] uppercase tracking-wider text-fg-luxury">
            <thead className="bg-neutral-soft/10 border-b border-neutral-soft/80 text-[8px] font-medium text-text-muted">
              <tr>
                <th className="py-3.5 px-5 text-left font-semibold">Garment / Product</th>
                <th className="py-3.5 px-5 text-left font-semibold">Customer Email</th>
                <th className="py-3.5 px-5 text-left font-semibold">Requested Date</th>
                <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-light divide-y divide-neutral-soft/20">
              {restockAlerts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-text-muted italic">No restock requests yet.</td>
                </tr>
              ) : (
                restockAlerts.map((alert, idx) => (
                  <tr key={alert.id || idx} className="hover:bg-neutral-soft/5">
                    <td className="py-3.5 px-5 font-medium text-fg-luxury">{alert.product?.name || 'Unknown Product'}</td>
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
