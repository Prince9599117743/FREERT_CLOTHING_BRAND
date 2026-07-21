'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { MOCK_PRODUCTS } from '@/services/mockData';
import type { Product, Category } from '@/types';
import { 
  Save, Plus, Trash2, Copy, Upload, ArrowRight, Star, Heart, Check, 
  HelpCircle, Trash, RotateCcw, AlertTriangle, Eye, ShieldAlert, Settings, FileText
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
  featuredProductIds: string[];
}

interface OrderAdmin {
  id: string;
  customer: string;
  email: string;
  address: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: string;
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    basePrice: 0,
    mrp: 0,
    stockQty: 10,
    images: ['/assets/trench_coat.jpg'],
    parentCategory: 'men',
    subCategory: 'hoodies'
  });

  const [categories, setCategories] = useState<string[]>([
    'Men', 'Women', 'Accessories', 'Perfumes'
  ]);
  const [subcategories, setSubcategories] = useState<string[]>([
    'T-Shirts', 'Jeans', 'Hoodies', 'Jackets', 'Bags', 'Caps', 'Wallets', 'Unisex'
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const [heroSlide, setHeroSlide] = useState<HeroSlide>({
    id: 'hero-1',
    image: '/assets/trench_coat.jpg',
    heading: 'BE YOU.',
    subtitle: 'BE BOLD. BE FREERT.',
    ctaText: 'Shop Now',
    ctaLink: '/shop'
  });

  const [menSection, setMenSection] = useState<HomepageSection>({
    id: 'men',
    title: 'Men Collection',
    subtitle: 'Minimal Staple Outerwear',
    bannerImage: '/assets/trench_coat.jpg',
    ctaText: 'Shop Men',
    ctaLink: '/shop/men',
    visible: true,
    featuredProductIds: []
  });

  const [womenSection, setWomenSection] = useState<HomepageSection>({
    id: 'women',
    title: 'Women Collection',
    subtitle: 'Fine Linens & Silks',
    bannerImage: '/assets/trench_coat.jpg',
    ctaText: 'Shop Women',
    ctaLink: '/shop/women',
    visible: true,
    featuredProductIds: []
  });

  const [orders, setOrders] = useState<OrderAdmin[]>([
    { id: 'FR-847291', customer: 'Aryan Dev', email: 'aryan@dev.com', address: 'Sector-4, Noida, UP, 201301', amount: 20300, date: '2026-07-20', status: 'processing', items: 'Linen Trench Coat (L) x1, Structured Kimono Shirt (M) x1' },
    { id: 'FR-712891', customer: 'Meera Sen', email: 'meera@sen.com', address: 'Gurgaon, Haryana 122002', amount: 8900, date: '2026-07-19', status: 'delivered', items: 'Raw Silk Utility Trouser (M) x1' }
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'cust-1', name: 'Aryan Dev', email: 'aryan@freert.net', ordersCount: 5, totalSpent: '₹1,12,500', blocked: false },
    { id: 'cust-2', name: 'Meera Sen', email: 'meera@sen.com', ordersCount: 1, totalSpent: '₹8,900', blocked: false }
  ]);

  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 'c-1', code: 'FREERT20', value: 20, enabled: true }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(15);

  const [reviews, setReviews] = useState([
    { id: 'rev-1', product: 'Linen Trench Coat', author: 'Aryan Dev', comment: 'Outstanding drape and quality. Fits beautifully.', rating: 5, date: '2026-07-20' },
    { id: 'rev-2', product: 'Structured Kimono Shirt', author: 'Meera Sen', comment: 'Elegant structural silhouette. Organic linen texture feels organic.', rating: 4, date: '2026-07-18' }
  ]);

  // Load state on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('freert_products_db');
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
    } else {
      setProducts(MOCK_PRODUCTS);
      localStorage.setItem('freert_products_db', JSON.stringify(MOCK_PRODUCTS));
    }

    const savedBanners = localStorage.getItem('freert_hero_slide');
    if (savedBanners) {
      try { setHeroSlide(JSON.parse(savedBanners)); } catch (e) {}
    }
  }, []);

  const saveProductsToStorage = (updatedList: Product[]) => {
    setProducts(updatedList);
    localStorage.setItem('freert_products_db', JSON.stringify(updatedList));
  };

  // Image Upload handler (Shopify simple click & select file)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'men' | 'women' | 'product_edit' | 'product_add') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'hero') {
        const updated = { ...heroSlide, image: base64String };
        setHeroSlide(updated);
        localStorage.setItem('freert_hero_slide', JSON.stringify(updated));
        showToast('Hero photo updated successfully.', 'success');
      } else if (target === 'men') {
        setMenSection({ ...menSection, bannerImage: base64String });
        showToast("Men's section photo updated.", 'success');
      } else if (target === 'women') {
        setWomenSection({ ...womenSection, bannerImage: base64String });
        showToast("Women's section photo updated.", 'success');
      } else if (target === 'product_edit' && editingProduct) {
        setEditingProduct({ ...editingProduct, images: [base64String] });
        showToast('Product photo loaded.', 'info');
      } else if (target === 'product_add') {
        setNewProductForm({ ...newProductForm, images: [base64String] });
        showToast('New product photo loaded.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Dashboard Render
  const renderDashboard = () => (
    <div className="flex flex-col gap-8 text-left">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Sales', value: '₹14,84,300', note: 'Last 30 days' },
          { title: 'Total Orders', value: `${orders.length} Orders`, note: 'Delivered or pending' },
          { title: 'Active Customers', value: `${customers.length}`, note: 'Registered members' },
          { title: 'Low Stock warnings', value: '3 Products', note: 'Under 5 units' }
        ].map((item, idx) => (
          <div key={idx} className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">{item.title}</span>
            <span className="text-xl font-light tracking-wide text-fg-luxury mt-3">{item.value}</span>
            <span className="text-[9px] uppercase tracking-widest text-text-muted mt-1">{item.note}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-luxury border border-neutral-soft/80 p-6">
          <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block mb-4">Sales Performance</span>
          <div className="w-full h-40 bg-neutral-soft/10 relative">
            <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
              <path d="M0,80 Q100,50 200,65 T400,20 T500,10 L500,100 L0,100 Z" fill="#c5a880" fillOpacity="0.1" />
              <path d="M0,80 Q100,50 200,65 T400,20 T500,10" fill="none" stroke="#c5a880" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">Live Visitors</span>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-light text-fg-luxury">4 Visitors</span>
            <span className="text-[9px] uppercase tracking-widest text-green-700 font-semibold bg-green-50 px-2 py-0.5 w-fit">Live on store</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Products Manager Render
  const renderProducts = () => {
    const handleDeleteProduct = (p: Product) => {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${p.name}"? This will move it to the Trash.`);
      if (confirmDelete) {
        const updated = products.filter(item => item.id !== p.id);
        saveProductsToStorage(updated);
        setTrashProducts([...trashProducts, p]);
        showToast(`Moved "${p.name}" to Trash.`, 'info');
      }
    };

    const handleRestoreProduct = (p: Product) => {
      const updatedTrash = trashProducts.filter(item => item.id !== p.id);
      setTrashProducts(updatedTrash);
      saveProductsToStorage([...products, p]);
      showToast(`Restored "${p.name}".`, 'success');
    };

    const handleSaveProductEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProduct) return;

      const totalStock = editingProduct.stockQty ?? 10;
      const finalStatus = (totalStock === 0 ? 'out-of-stock' : 'published') as any;

      const updated = products.map(p => 
        p.id === editingProduct.id ? { ...editingProduct, status: finalStatus } : p
      );
      saveProductsToStorage(updated);
      setEditingProduct(null);
      showToast('Product details updated successfully.', 'success');
    };

    const handleAddProductSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProductForm.name || !newProductForm.basePrice) return;

      const finalProduct: Product = {
        id: `prod-${Date.now()}`,
        name: newProductForm.name,
        slug: newProductForm.name.toLowerCase().replace(/ /g, '-'),
        description: newProductForm.description || '',
        basePrice: Number(newProductForm.basePrice),
        mrp: Number(newProductForm.mrp || newProductForm.basePrice),
        stockQty: Number(newProductForm.stockQty || 10),
        status: (Number(newProductForm.stockQty) === 0 ? 'out-of-stock' : 'published') as any,
        images: newProductForm.images || ['/assets/trench_coat.jpg'],
        parentCategory: newProductForm.parentCategory || 'men',
        subCategory: newProductForm.subCategory || 'hoodies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: true,
        rating: 4.8,
        reviewsCount: 0
      };

      saveProductsToStorage([finalProduct, ...products]);
      setIsAddingProduct(false);
      setNewProductForm({
        name: '',
        description: '',
        basePrice: 0,
        mrp: 0,
        stockQty: 10,
        images: ['/assets/trench_coat.jpg'],
        parentCategory: 'men',
        subCategory: 'hoodies'
      });
      showToast('New product added to store listing.', 'success');
    };

    return (
      <div className="flex flex-col gap-8 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-soft">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Product Catalog</h2>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="btn-editorial-solid text-[9px] py-2 px-4 uppercase font-semibold flex items-center gap-1.5"
          >
            <Plus size={12} /> Add New Product
          </button>
        </div>

        {/* Add Product Step-by-Step Form */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-fg-luxury/45 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAddProductSubmit} className="bg-bg-luxury border border-neutral-soft/80 max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto text-left relative shadow-2xl flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-fg-luxury cursor-pointer"
              >
                Cancel
              </button>
              <h3 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">Add New Product</h3>
              
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Product Name</label>
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
                    onChange={(e) => setNewProductForm({ ...newProductForm, parentCategory: e.target.value })}
                    className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] uppercase tracking-wider focus:outline-none"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="accessories">Accessories</option>
                    <option value="perfumes">Perfumes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5 block">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-neutral-soft/20 border border-neutral-soft overflow-hidden">
                    <img src={newProductForm.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer">
                    Change Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageFileChange(e, 'product_add')} 
                      className="hidden" 
                    />
                  </label>
                </div>
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

              <button type="submit" className="btn-editorial-solid py-3 text-[10px] tracking-widest uppercase mt-4">Save Product</button>
            </form>
          </div>
        )}

        {/* Edit Product modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-fg-luxury/45 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSaveProductEdit} className="bg-bg-luxury border border-neutral-soft/80 max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto text-left relative shadow-2xl flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => setEditingProduct(null)}
                className="absolute top-6 right-6 text-text-muted hover:text-fg-luxury cursor-pointer"
              >
                Cancel
              </button>
              <h3 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">Edit Product Details</h3>
              
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Product Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="input-editorial text-xs" 
                  required
                />
              </div>

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

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Stock Quantity</label>
                <input 
                  type="number" 
                  value={editingProduct.stockQty ?? 10}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockQty: Number(e.target.value) })}
                  className="input-editorial text-xs" 
                  required
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1.5 block">Product Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-neutral-soft/20 border border-neutral-soft overflow-hidden">
                    <img src={editingProduct.images[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer">
                    Change Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageFileChange(e, 'product_edit')} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-editorial-solid py-3 text-[10px] tracking-widest uppercase mt-4">Save Changes</button>
            </form>
          </div>
        )}

        {/* Products simple Cards list grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const stock = p.stockQty ?? 10;
            const isOut = stock === 0;
            const discountP = p.mrp && p.mrp > p.basePrice ? Math.round(((p.mrp - p.basePrice) / p.mrp) * 100) : 0;

            return (
              <div key={p.id} className="border border-neutral-soft/80 p-4 bg-bg-luxury flex flex-col gap-3 justify-between">
                <div className="aspect-[3/4] bg-neutral-soft/20 overflow-hidden relative">
                  <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                  {isOut ? (
                    <span className="absolute top-2 left-2 text-[8px] uppercase bg-red-800 text-bg-luxury py-0.5 px-2 font-semibold">Sold Out</span>
                  ) : stock <= 5 ? (
                    <span className="absolute top-2 left-2 text-[8px] uppercase bg-amber-600 text-bg-luxury py-0.5 px-2 font-semibold">Low Stock ({stock})</span>
                  ) : null}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-fg-luxury block truncate">{p.name}</span>
                  <div className="flex justify-between items-baseline mt-1 text-xs">
                    <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
                    {discountP > 0 && <span className="text-[9px] text-red-700 font-semibold">{discountP}% OFF</span>}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-neutral-soft/20 pt-2.5">
                  <button 
                    onClick={() => setEditingProduct(p)}
                    className="flex-1 btn-editorial text-[9px] py-1.5 uppercase font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p)}
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

        {/* Trash Can section */}
        {trashProducts.length > 0 && (
          <div className="mt-12 border-t border-neutral-soft/40 pt-8">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-red-800 mb-4 flex items-center gap-2">
              <Trash size={14} /> Trash Bin ({trashProducts.length})
            </h3>
            <div className="flex flex-col gap-3">
              {trashProducts.map(tp => (
                <div key={tp.id} className="border border-neutral-soft p-3 bg-neutral-soft/5 flex justify-between items-center text-xs text-text-muted">
                  <span>{tp.name} - ₹{tp.basePrice}</span>
                  <button 
                    onClick={() => handleRestoreProduct(tp)}
                    className="text-green-700 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. Categories Render
  const renderCategories = () => {
    const handleAddCat = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName) return;
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
      showToast('Category created.', 'success');
    };

    const handleAddSub = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSubcategoryName) return;
      setSubcategories([...subcategories, newSubcategoryName]);
      setNewSubcategoryName('');
      showToast('Subcategory created.', 'success');
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left text-xs text-text-muted">
        {/* Categories Panel */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Departments (Categories)
          </span>
          <div className="flex flex-col gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="border border-neutral-soft p-2 bg-neutral-soft/5 flex justify-between items-center">
                <span className="uppercase font-medium text-fg-luxury">{cat}</span>
                <button onClick={() => setCategories(categories.filter((_, i) => i !== idx))} className="text-red-700"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddCat} className="flex gap-2">
            <input 
              type="text" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="input-editorial text-xs" 
              placeholder="e.g. Unisex" 
              required
            />
            <button type="submit" className="btn-editorial-solid px-4 text-[9px] uppercase font-semibold">Add</button>
          </form>
        </div>

        {/* Subcategories Panel */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Sub-collections
          </span>
          <div className="flex flex-col gap-2">
            {subcategories.map((sub, idx) => (
              <div key={idx} className="border border-neutral-soft p-2 bg-neutral-soft/5 flex justify-between items-center">
                <span className="uppercase font-medium text-fg-luxury">{sub}</span>
                <button onClick={() => setSubcategories(subcategories.filter((_, i) => i !== idx))} className="text-red-700"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddSub} className="flex gap-2">
            <input 
              type="text" 
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              className="input-editorial text-xs" 
              placeholder="e.g. Cargo" 
              required
            />
            <button type="submit" className="btn-editorial-solid px-4 text-[9px] uppercase font-semibold">Add</button>
          </form>
        </div>
      </div>
    );
  };

  // 4. Homepage Editor Render
  const renderHomepage = () => (
    <div className="flex flex-col gap-8 text-left text-xs text-text-muted">
      <div>
        <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Homepage Designer</h2>
        <p className="text-[9px] text-text-muted uppercase mt-1">Design homepage slides and collection highlight banners</p>
      </div>

      {/* Hero slide section */}
      <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
          Main Hero Banner Slide
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase mb-1 block">Hero Heading</label>
              <input 
                type="text" 
                value={heroSlide.heading} 
                onChange={(e) => setHeroSlide({ ...heroSlide, heading: e.target.value })}
                className="input-editorial text-xs" 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Hero Subtitle</label>
              <input 
                type="text" 
                value={heroSlide.subtitle} 
                onChange={(e) => setHeroSlide({ ...heroSlide, subtitle: e.target.value })}
                className="input-editorial text-xs" 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Button Label</label>
              <input 
                type="text" 
                value={heroSlide.ctaText} 
                onChange={(e) => setHeroSlide({ ...heroSlide, ctaText: e.target.value })}
                className="input-editorial text-xs" 
              />
            </div>
            <button 
              onClick={() => { localStorage.setItem('freert_hero_slide', JSON.stringify(heroSlide)); showToast('Hero banner saved.', 'success'); }}
              className="btn-editorial-solid py-2 text-[9px] uppercase font-semibold w-fit px-6"
            >
              Save Hero Settings
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[9px] uppercase block">Banner Photo</span>
            <div className="aspect-[4/3] bg-neutral-soft/20 border border-neutral-soft overflow-hidden w-full max-w-sm">
              <img src={heroSlide.image} className="w-full h-full object-cover" alt="" />
            </div>
            <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer w-fit">
              Change Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageFileChange(e, 'hero')} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Men Section Highlight */}
      <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
          Men Collection Highlight Section
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase mb-1 block">Title</label>
              <input type="text" value={menSection.title} onChange={(e) => setMenSection({ ...menSection, title: e.target.value })} className="input-editorial text-xs" />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Subtitle</label>
              <input type="text" value={menSection.subtitle} onChange={(e) => setMenSection({ ...menSection, subtitle: e.target.value })} className="input-editorial text-xs" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer my-2">
              <input type="checkbox" checked={menSection.visible} onChange={(e) => setMenSection({ ...menSection, visible: e.target.checked })} className="accent-fg-luxury" />
              <span className="text-[9px] uppercase text-fg-luxury">Show Section on Homepage</span>
            </label>
            <button onClick={() => showToast('Men Highlight section configurations saved.', 'success')} className="btn-editorial-solid py-2 text-[9px] uppercase font-semibold w-fit px-6">Save</button>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[9px] uppercase block">Banner Photo</span>
            <div className="aspect-[4/3] bg-neutral-soft/20 border border-neutral-soft overflow-hidden w-full max-w-sm">
              <img src={menSection.bannerImage} className="w-full h-full object-cover" alt="" />
            </div>
            <label className="btn-editorial py-2 px-4 text-[9px] uppercase font-semibold cursor-pointer w-fit">
              Change Photo
              <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, 'men')} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Orders Render
  const renderOrders = () => (
    <div className="flex flex-col gap-6 text-left text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Orders Fulfillment</h2>
      <div className="flex flex-col gap-4">
        {orders.map(o => (
          <div key={o.id} className="border border-neutral-soft p-5 bg-bg-luxury flex flex-col gap-3 justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-fg-luxury uppercase tracking-wider">{o.id}</span>
                <span className="text-[9px] text-text-muted font-light ml-3">{o.date}</span>
              </div>
              <select 
                value={o.status} 
                onChange={(e) => {
                  const updated = orders.map(item => item.id === o.id ? { ...item, status: e.target.value as any } : item);
                  setOrders(updated);
                  showToast(`Order status updated to ${e.target.value}.`, 'success');
                }}
                className="bg-bg-luxury border border-neutral-soft py-1 px-3 text-[10px] uppercase font-semibold"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-[10px] text-text-muted font-light">
              <p className="font-semibold text-fg-luxury">{o.customer} ({o.email})</p>
              <p className="mt-0.5">{o.address}</p>
              <p className="mt-2 font-medium italic">&ldquo;{o.items}&rdquo;</p>
            </div>
            <div className="border-t border-neutral-soft/20 pt-2 flex justify-between items-baseline font-semibold text-fg-luxury">
              <span>Amount Paid</span>
              <span>₹{o.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. Customers Render
  const renderCustomers = () => (
    <div className="flex flex-col gap-6 text-left text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Customers Directory</h2>
      <div className="flex flex-col gap-3">
        {customers.map(c => (
          <div key={c.id} className="border border-neutral-soft p-5 bg-bg-luxury flex justify-between items-center">
            <div>
              <p className="font-semibold text-fg-luxury uppercase tracking-wider">{c.name}</p>
              <p className="text-[9px] text-text-muted mt-0.5">{c.email}</p>
              <p className="text-[8px] text-text-muted mt-1">Orders Count: {c.ordersCount} | Total Spent: {c.totalSpent}</p>
            </div>
            <button 
              onClick={() => {
                const updated = customers.map(item => item.id === c.id ? { ...item, blocked: !item.blocked } : item);
                setCustomers(updated);
                showToast(c.blocked ? 'Customer unblocked.' : 'Customer blocked from checkout.', 'info');
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
    const handleAddCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCouponCode) return;
      const updated = [...coupons, { id: `c-${Date.now()}`, code: newCouponCode.trim().toUpperCase(), value: newCouponValue, enabled: true }];
      setCoupons(updated);
      setNewCouponCode('');
      showToast('Coupon created successfully.', 'success');
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left text-xs text-text-muted">
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Active Coupons (Discount Codes)
          </span>
          <div className="flex flex-col gap-2">
            {coupons.map((c, idx) => (
              <div key={idx} className="border border-neutral-soft p-3 bg-neutral-soft/5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-fg-luxury uppercase tracking-wider">{c.code}</span>
                  <span className="text-[9px] text-text-muted ml-3">{c.value}% OFF</span>
                </div>
                <button onClick={() => setCoupons(coupons.filter((_, i) => i !== idx))} className="text-red-700"><Trash2 size={12} /></button>
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
                type="text" 
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className="input-editorial text-xs" 
                placeholder="e.g. FESTIVE15" 
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase mb-1 block">Discount Percent (%)</label>
              <input 
                type="number" 
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(Number(e.target.value))}
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
  const renderReviews = () => (
    <div className="flex flex-col gap-6 text-left text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Customer Reviews</h2>
      <div className="flex flex-col gap-4">
        {reviews.map(rev => (
          <div key={rev.id} className="border border-neutral-soft p-5 bg-bg-luxury flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-semibold text-fg-luxury uppercase tracking-wider">{rev.product}</span>
                <span className="text-[9px] text-text-muted font-light ml-3">Author: {rev.author}</span>
              </div>
              <div className="flex text-accent-gold">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} size={9} className="fill-current" />
                ))}
              </div>
            </div>
            <p className="font-light italic mt-1">&ldquo;{rev.comment}&rdquo;</p>
            <button 
              onClick={() => { setReviews(reviews.filter(r => r.id !== rev.id)); showToast('Review deleted.', 'info'); }}
              className="text-red-700 self-end font-semibold text-[9px] uppercase tracking-wider"
            >
              Delete Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // 9. Settings Render
  const renderSettings = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('Branding settings saved.', 'success'); }} className="flex flex-col gap-6 text-left max-w-xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Store Branding Settings</h2>
      <div>
        <label className="text-[9px] uppercase mb-1 block font-medium">Store Brand Name</label>
        <input type="text" className="input-editorial text-xs" defaultValue="FREERT" />
      </div>
      <div>
        <label className="text-[9px] uppercase mb-1 block font-medium">Customer Support Email</label>
        <input type="email" className="input-editorial text-xs" defaultValue="concierge@freert.net" />
      </div>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center justify-center gap-1.5"><Save size={13} /> Save Store Settings</button>
    </form>
  );

  // 10. Help Page Render
  const renderHelp = () => (
    <div className="flex flex-col gap-8 text-left text-xs text-text-muted max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Owner Help Center & Guide</h2>
        <p className="text-[9px] text-text-muted uppercase mt-1">Simple instructions to manage your FREERT clothing store</p>
      </div>

      <div className="flex flex-col gap-6">
        {[
          { q: 'How to add a product?', a: 'Click the large "+ Add New Product" button in the Products tab. Fill out the step-by-step details (name, prices, photos, stock quantity) and save.' },
          { q: 'How to change the homepage banner?', a: 'Go to the Homepage tab. Under the "Main Hero Banner Slide" section, edit the text headers or select "Change Photo" to upload a new campaign banner image directly from your phone or computer. Click Save.' },
          { q: 'How to change the price or discount?', a: 'In the Products tab, click the "Edit" button next to any product card. Change the original price and selling price. The system will automatically calculate and display the percentage discount (e.g. 38% OFF) on the storefront card.' },
          { q: 'How to make a product Out of Stock?', a: 'Edit the product card and change its Stock quantity to "0". The storefront will immediately replace the "Add to Cart" button with a friendly "Notify Me" restock subscription module.' },
          { q: 'How to add new category departments?', a: 'Go to the Categories tab. In the input box under "Departments", type the name of the new department (e.g. Unisex or Loungewear) and click Add. It will dynamically show up on the collection filters.' }
        ].map((faq, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex flex-col gap-2">
            <span className="font-semibold text-fg-luxury uppercase tracking-wider text-[11px] flex items-center gap-2">
              <HelpCircle size={13} className="text-accent-gold" /> {faq.q}
            </span>
            <p className="font-light leading-relaxed pl-5 text-text-muted">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

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
