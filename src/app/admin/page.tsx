'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { MOCK_PRODUCTS } from '@/services/mockData';
import type { Product } from '@/types';
import { 
  Save, Plus, Trash2, ChevronUp, ChevronDown, Copy, Upload, Download, 
  Search, Grid, List, Folder, AlertTriangle, Eye, ShieldAlert, Check, X,
  Calendar, Percent, Gift, Mail, ArrowRight, User, Package, Settings as SettingsIcon,
  Play, Book, FileText, Menu, AlertCircle, HelpCircle, ShieldCheck
} from 'lucide-react';

// Definitions
interface HeroSlide {
  id: string;
  image: string;
  heading: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
  order: number;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  bannerImage?: string;
  ctaText: string;
  ctaLink: string;
  visible: boolean;
  order: number;
  featuredProductIds: string[];
}

interface OrderAdmin {
  id: string;
  customer: string;
  email: string;
  address: string;
  amount: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'returned' | 'return_requested';
  items: string;
  notes: string;
  timeline: { title: string; time: string; done: boolean }[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: string;
  address: string;
  wishlistCount: number;
  reviewsCount: number;
  blocked: boolean;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  minValue: number;
  maxDiscount?: number;
  enabled: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'hs-1', image: '/assets/trench_coat.jpg', heading: 'BE YOU.', subtitle: 'BE BOLD. BE FREERT.', ctaText: 'Shop Now', ctaLink: '/shop', enabled: true, order: 0 }
];

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: 'new-drop', title: 'NEW DROP', subtitle: 'Seasonal Highlight', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Explore Collection', ctaLink: '/shop/new-arrivals', visible: true, order: 0, featuredProductIds: [] },
  { id: 'men', title: "Men's Silhouette", subtitle: 'Tailored for Him', bannerImage: '/assets/trench_coat.jpg', ctaText: 'Shop Men', ctaLink: '/shop/men', visible: true, order: 1, featuredProductIds: ['prod-1', 'prod-2'] }
];

function AdminCoreWorkspace() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'dashboard';

  // Master databases loaded from MOCK/Local Storage
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [homeSections, setHomeSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [orders, setOrders] = useState<OrderAdmin[]>([
    { id: 'FR-847291', customer: 'Aryan Dev', email: 'aryan@dev.com', address: 'Apt 12, Sector-4, Noida, UP, 201301', amount: 20300, date: '2026-07-20', status: 'processing', items: 'Linen Trench Coat (L) x1, Structured Kimono Shirt (M) x1', notes: 'Deliver to guard cabin.', timeline: [{ title: 'Order Placed & Paid', time: '2026-07-20 14:32', done: true }, { title: 'Batch Verification', time: '2026-07-20 16:00', done: true }, { title: 'Courier Dispatch', time: '--', done: false }, { title: 'Delivered', time: '--', done: false }] }
  ]);
  const [selectedOrder, setSelectedOrder] = useState<OrderAdmin | null>(null);

  useEffect(() => {
    if (orders.length > 0) setSelectedOrder(orders[0]);
  }, [orders]);

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'cust-1', name: 'Aryan Dev', email: 'aryan@freert.net', ordersCount: 5, totalSpent: '₹1,12,500', address: 'B-4, Gurgaon, Haryana 122002', wishlistCount: 14, reviewsCount: 3, blocked: false }
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  useEffect(() => {
    if (customers.length > 0) setSelectedCustomer(customers[0]);
  }, [customers]);

  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 'c-1', code: 'FREERT20', type: 'percentage', value: 20, expiryDate: '2026-12-31', usageLimit: 500, usedCount: 142, minValue: 5000, maxDiscount: 2000, enabled: true }
  ]);

  // Bulk parameters
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState('');

  // 1. Dashboard View
  const renderDashboard = () => (
    <div className="flex flex-col gap-8 text-left">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Sales', value: '₹14,84,300', note: 'Last 30 cycles' },
          { title: 'Orders Ingress', value: '112 Registered', note: '45 Pending fulfillment' },
          { title: 'Registered Customers', value: '489', note: '+12% this cycle' },
          { title: 'Stock Warnings', value: '3 Articles Low', note: 'Low Threshold' }
        ].map((item, idx) => (
          <div key={idx} className="bg-bg-luxury border border-neutral-soft/80 p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">{item.title}</span>
            <span className="text-xl font-light tracking-wide text-fg-luxury mt-3">{item.value}</span>
            <span className="text-[8px] uppercase tracking-widest text-text-muted mt-1">{item.note}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-luxury border border-neutral-soft/80 p-6">
          <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block mb-4">Ingress Sales Graph</span>
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
            <span className="text-3xl font-light text-fg-luxury">14 Users</span>
            <span className="text-[8px] uppercase tracking-widest text-green-700 font-semibold bg-green-50 px-2 py-0.5 w-fit">Active Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Orders View
  const renderOrders = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-5 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-4">
        <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">Orders List</span>
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {orders.map(o => (
            <div 
              key={o.id} 
              onClick={() => setSelectedOrder(o)}
              className={`p-4 border cursor-pointer flex flex-col gap-2 transition-all ${selectedOrder?.id === o.id ? 'border-fg-luxury bg-neutral-soft/10' : 'border-neutral-soft/60 bg-neutral-soft/5 hover:border-fg-luxury'}`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-fg-luxury">{o.id}</span>
                <span className="text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-light bg-amber-100 text-amber-800">{o.status}</span>
              </div>
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>{o.customer}</span>
                <span className="font-semibold text-fg-luxury">₹{o.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7">
        {selectedOrder ? (
          <div className="bg-bg-luxury border border-neutral-soft/80 p-8 flex flex-col gap-6 text-xs text-text-muted">
            <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-fg-luxury">{selectedOrder.id}</h3>
                <span className="text-[10px]">Logged: {selectedOrder.date}</span>
              </div>
              <button onClick={() => window.print()} className="btn-editorial py-2 px-3 text-[9px]">Print Invoice</button>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Items</span>
              <p className="text-fg-luxury font-medium">{selectedOrder.items}</p>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Address Directory</span>
              <p className="text-fg-luxury font-light">{selectedOrder.address}</p>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mb-2 block">Timeline Tracker</span>
              <div className="flex flex-col gap-3 pl-3 border-l border-neutral-soft">
                {selectedOrder.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${step.done ? 'bg-accent-gold' : 'bg-neutral-300'}`} />
                    <span className={step.done ? 'text-fg-luxury font-medium' : 'text-neutral-400'}>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-soft/5 border border-dashed border-neutral-soft/80 p-12 text-center text-xs text-text-muted uppercase tracking-widest">Select order to view details</div>
        )}
      </div>
    </div>
  );

  // 3. Products View
  const renderProducts = () => {
    const handleSelectAll = () => {
      if (selectedProductIds.length === products.length) {
        setSelectedProductIds([]);
      } else {
        setSelectedProductIds(products.map(p => p.id));
      }
    };

    const handleBulkPrice = () => {
      const num = parseFloat(bulkPriceValue);
      if (isNaN(num)) return;
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, basePrice: num } : p));
      showToast('Bulk prices updated.', 'success');
      setBulkPriceValue('');
    };

    const handleBulkStock = () => {
      const num = parseInt(bulkStockValue);
      if (isNaN(num)) return;
      setProducts(prev => prev.map(p => {
        if (!selectedProductIds.includes(p.id)) return p;
        return {
          ...p,
          variants: p.variants ? p.variants.map(v => ({ ...v, stockQty: num })) : []
        };
      }));
      showToast('Bulk stock values updated.', 'success');
      setBulkStockValue('');
    };

    return (
      <div className="flex flex-col gap-6 text-left">
        <div className="flex justify-between items-center">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Store Products</h2>
          <div className="flex gap-2">
            <button onClick={() => showToast('Exported file configuration JSON.', 'success')} className="btn-editorial py-2 px-3 text-[9px]">Export JSON</button>
            <label className="btn-editorial py-2 px-3 text-[9px] cursor-pointer">
              Import CSV
              <input type="file" className="hidden" onChange={() => showToast('Importing inventory mock listings.', 'info')} />
            </label>
          </div>
        </div>

        {selectedProductIds.length > 0 && (
          <div className="bg-neutral-soft/10 border border-neutral-soft p-4 flex flex-wrap gap-4 items-center justify-between text-xs">
            <span>Selected {selectedProductIds.length} items</span>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
                  setSelectedProductIds([]);
                  showToast('Bulk deleted.', 'info');
                }} 
                className="text-red-800 uppercase tracking-widest font-semibold"
              >
                Delete Selected
              </button>
              <div className="flex border border-neutral-soft bg-bg-luxury px-2 py-0.5 text-[9px]">
                <input 
                  type="number" 
                  placeholder="Set Price" 
                  value={bulkPriceValue}
                  onChange={(e) => setBulkPriceValue(e.target.value)}
                  className="w-16 focus:outline-none bg-transparent"
                />
                <button onClick={handleBulkPrice} className="ml-1 text-accent-gold">Set</button>
              </div>
              <div className="flex border border-neutral-soft bg-bg-luxury px-2 py-0.5 text-[9px]">
                <input 
                  type="number" 
                  placeholder="Set Stock" 
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  className="w-16 focus:outline-none bg-transparent"
                />
                <button onClick={handleBulkStock} className="ml-1 text-accent-gold">Set</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-soft text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedProductIds.length === products.length} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-soft/30 font-light text-text-muted">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedProductIds.includes(p.id)} 
                      onChange={() => setSelectedProductIds(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} 
                    />
                  </td>
                  <td className="p-4 font-medium text-fg-luxury flex items-center gap-2">
                    <img src={p.images[0]} className="w-8 aspect-[3/4] object-cover" alt="" />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-4 uppercase tracking-wider text-[10px]">{p.variants?.[0]?.sku || p.id}</td>
                  <td className="p-4 uppercase tracking-wider text-[10px]">{p.parentCategory} / {p.subCategory}</td>
                  <td className="p-4 text-fg-luxury font-medium">₹{p.basePrice.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 bg-green-100 text-green-800 font-light">Published</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Remaining modular views placeholders mapping requirements
  const renderCategories = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Category Hierarchies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted">
        {['Men (Tees, Shirts, Jeans)', 'Women (Dresses, Skirts, Tops)', 'Accessories (Caps, Wallets, Rings)', 'Perfumes (Men, Women, Unisex)'].map((cat, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center">
            <span>{cat}</span>
            <button onClick={() => showToast('Main category visibility updated.', 'success')} className="btn-editorial py-1 px-3 text-[9px]">Edit Node</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Collections Manager</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted">
        {['Summer Collection', 'Winter Collection', 'Limited Drop', 'Oversized Series'].map((col, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center">
            <span>{col}</span>
            <button onClick={() => showToast('Collection parameters saved.', 'success')} className="btn-editorial py-1 px-3 text-[9px]">Configure</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Inventory Warehousing Log</h2>
      <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-soft bg-neutral-soft/10 text-[9px] uppercase tracking-widest text-text-muted p-4">
              <th className="p-4">Garment</th>
              <th className="p-4">Delhi Warehouse</th>
              <th className="p-4">Mumbai Warehouse</th>
              <th className="p-4">Reserved Stock</th>
            </tr>
          </thead>
          <tbody className="p-4 divide-y divide-neutral-soft/20 text-text-muted">
            {products.slice(0, 5).map(p => (
              <tr key={p.id}>
                <td className="p-4 font-semibold text-fg-luxury">{p.name}</td>
                <td className="p-4">12 units</td>
                <td className="p-4">8 units</td>
                <td className="p-4 font-semibold text-red-600">2 units</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-5 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-4">
        <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">Registered Customers</span>
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              className={`p-4 border cursor-pointer flex flex-col gap-1 transition-all ${selectedCustomer?.id === c.id ? 'border-fg-luxury bg-neutral-soft/10' : 'border-neutral-soft/60 bg-neutral-soft/5 hover:border-fg-luxury'}`}
            >
              <span className="font-semibold text-fg-luxury uppercase tracking-wider text-xs">{c.name}</span>
              <span className="text-[9px] text-text-muted">{c.email}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7">
        {selectedCustomer ? (
          <div className="bg-bg-luxury border border-neutral-soft/80 p-8 flex flex-col gap-6 text-xs text-text-muted">
            <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-fg-luxury">{selectedCustomer.name}</h3>
              <button 
                onClick={() => {
                  setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, blocked: !c.blocked } : c));
                  setSelectedCustomer({ ...selectedCustomer, blocked: !selectedCustomer.blocked });
                  showToast('Customer account status toggled.', 'info');
                }} 
                className="btn-editorial py-1.5 px-4 text-[9px] text-red-700"
              >
                {selectedCustomer.blocked ? 'Unblock Account' : 'Block Account'}
              </button>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Address Directory</span>
              <p className="text-fg-luxury font-light">{selectedCustomer.address}</p>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Wishlist Items</span>
              <p className="text-fg-luxury font-semibold">{selectedCustomer.wishlistCount} items saved</p>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-soft/5 border border-dashed border-neutral-soft/80 p-12 text-center text-xs text-text-muted uppercase tracking-widest">Select customer to view details</div>
        )}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Customer Reviews Audit</h2>
      <div className="flex flex-col gap-4">
        {[
          { author: 'Aryan Dev', rating: '5 ★', text: 'Clean tailoring, raw silk feels very breathable.', item: 'Raw Silk Utility Trouser' },
          { author: 'Meera Sen', rating: '4 ★', text: 'Boxy oversized fit, drape profile is premium.', item: 'FR Boxy Heavyweight Oversized Tee' }
        ].map((item, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-fg-luxury">{item.author} ({item.rating})</p>
              <p className="text-text-muted font-light mt-1">&ldquo;{item.text}&rdquo; on {item.item}</p>
            </div>
            <button onClick={() => showToast('Review approved for production grid.', 'success')} className="btn-editorial py-1.5 px-4 text-[9px]">Approve</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-4 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col gap-4 text-xs text-text-muted">
        <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">New Promo Discount</span>
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Coupon Code</label>
          <input type="text" className="input-editorial text-xs font-semibold" placeholder="e.g. AUTUMN50" />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Percentage Offset (%)</label>
          <input type="number" className="input-editorial text-xs" placeholder="e.g. 15" />
        </div>
        <button onClick={() => showToast('Promo coupon published.', 'success')} className="btn-editorial-solid py-2 text-[9px] mt-2">Publish</button>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-4">
        <span className="text-[10px] uppercase tracking-widest text-fg-luxury font-semibold border-b border-neutral-soft/30 pb-2 block">Promo Registry</span>
        <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-soft bg-neutral-soft/10 text-[9px] uppercase tracking-widest text-text-muted p-4">
                <th className="p-4">Promo Code</th>
                <th className="p-4">Deduction</th>
                <th className="p-4">Expiry</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-soft/20 text-text-muted">
              {coupons.map(c => (
                <tr key={c.id}>
                  <td className="p-4 font-semibold text-fg-luxury">{c.code}</td>
                  <td className="p-4">{c.value}% OFF</td>
                  <td className="p-4">{c.expiryDate}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => showToast('Coupon removed.', 'info')} className="text-red-700 font-semibold"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCMS = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('CMS configuration deployed to edge nodes.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Homepage Blocks</h2>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">New Drop Announcement</label>
        <input type="text" className="input-editorial text-xs" defaultValue="Complimentary drone delivery on orders above ₹15,000" />
      </div>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">Autumn Season Campaign Image</label>
        <input type="text" className="input-editorial text-xs" defaultValue="/assets/trench_coat.jpg" />
      </div>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save Layout</button>
    </form>
  );

  const renderHero = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('Hero slides compiled successfully.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Hero Manager</h2>
      <div className="border border-neutral-soft p-4 bg-neutral-soft/5 flex flex-col gap-3">
        <span className="text-[8px] uppercase tracking-widest text-accent-gold font-semibold">Slide 01 (Campaign Loop)</span>
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Heading</label>
          <input type="text" className="input-editorial text-xs" defaultValue="BE YOU. BE BOLD. BE FREERT." />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Asset Path</label>
          <input type="text" className="input-editorial text-xs" defaultValue="/assets/trench_coat.jpg" />
        </div>
      </div>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save Hero Slides</button>
    </form>
  );

  const renderMedia = () => (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex justify-between items-center">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Media Library Workspace</h2>
        <button onClick={() => showToast('Mock files upload initiated.', 'info')} className="btn-editorial-solid py-2 px-6 text-[9px]">Upload Image</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="border border-neutral-soft p-4 bg-bg-luxury text-xs flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-widest text-text-muted pb-2 border-b border-neutral-soft block font-semibold">Directories</span>
          {['Campaign Images', 'Product Images', 'Hero Banners', 'Brand Assets'].map((folder, idx) => (
            <button key={idx} className="w-full flex items-center gap-2 py-1 text-[10px] uppercase text-text-muted hover:text-fg-luxury text-left">
              <Folder size={13} className="text-accent-gold" /> {folder}
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 border border-dashed border-neutral-soft/80 p-5 bg-neutral-soft/5">
          {['trench_coat.jpg', 'slip_dress.jpg', 'kimono_shirt.jpg'].map((file, idx) => (
            <div key={idx} className="bg-bg-luxury border border-neutral-soft p-3 text-xs flex flex-col gap-2">
              <div className="aspect-square bg-neutral-soft/30 overflow-hidden">
                <img src={`/assets/${file}`} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold block truncate uppercase text-[9px]">{file}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLookbook = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Lookbook Campaign Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted">
        {['Winter Knitwear 2026', 'Belgian Linens Collection', 'Raw Silk Drape Campaign'].map((campaign, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center">
            <span>{campaign}</span>
            <button onClick={() => showToast('Campaign lookbook parameters edited.', 'success')} className="btn-editorial py-1 px-3 text-[9px]">Edit Campaign</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBlogs = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Editorial Blog Manager</h2>
      <div className="flex flex-col gap-3">
        {[
          { title: 'The Drape and Profile: Structural Linens', date: '2026-07-15', author: 'FREERT Comms Team' },
          { title: 'Sourcing Long-Staple Peruvian Pima Cotton', date: '2026-07-02', author: 'FREERT Design Team' }
        ].map((blog, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-fg-luxury uppercase tracking-wider">{blog.title}</p>
              <span className="text-[8px] uppercase tracking-widest mt-1 block">Logged: {blog.date} · By {blog.author}</span>
            </div>
            <button onClick={() => showToast('Opening Blog Content Editor dialog.', 'info')} className="btn-editorial py-1 px-3 text-[9px]">Edit Post</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPages = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Policies & Info Pages Editor</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-text-muted">
        {['about', 'privacy-policy', 'terms-conditions', 'shipping-policy', 'refund-policy', 'care-guide'].map((page, idx) => (
          <button key={idx} onClick={() => showToast(`Opened page editor buffer: ${page}`, 'info')} className="border border-neutral-soft p-4 bg-neutral-soft/5 hover:border-fg-luxury text-[10px] uppercase tracking-widest text-left">
            Configure {page.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Drag & Drop Navigation Menu Builder</h2>
      <div className="border border-dashed border-neutral-soft/80 p-6 bg-neutral-soft/5 text-xs text-text-muted">
        <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold pb-1 border-b border-neutral-soft block mb-4">Desktop Navigation Header</span>
        <div className="flex flex-col gap-2 max-w-sm">
          {['Men -> oversized-t-shirts, regular-t-shirts, graphic-t-shirts', 'Women -> oversized-t-shirts, crop-tops, basic-tops', 'Accessories -> caps, bags, wallets', 'Perfumes -> men, women, unisex'].map((link, idx) => (
            <div key={idx} className="border border-neutral-soft bg-bg-luxury p-3 flex justify-between items-center">
              <span>{link}</span>
              <div className="flex gap-2">
                <button onClick={() => showToast('Reordered link up.', 'info')} className="text-text-muted hover:text-fg-luxury"><ChevronUp size={13} /></button>
                <button onClick={() => showToast('Reordered link down.', 'info')} className="text-text-muted hover:text-fg-luxury"><ChevronDown size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('Announcements ribbons configurations saved.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Announcement ribbons & Popups</h2>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">Top announcement ribbon message</label>
        <input type="text" className="input-editorial text-xs" defaultValue="Complimentary drone delivery on orders above ₹15,000" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer mt-1">
        <input type="checkbox" defaultChecked className="accent-fg-luxury" />
        <span className="text-[9px] uppercase tracking-widest text-fg-luxury">Enable Flash Sale Countdown Popup</span>
      </label>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save Announcements</button>
    </form>
  );

  const renderMarketing = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Marketing campaigns placeholders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-text-muted">
        {[
          { title: 'Email Dispatcher', desc: 'Create newsletters templates and broadcast alerts to subscribers database.' },
          { title: 'WhatsApp Campaigns', desc: 'Send order status details and drone tracking pathways direct to mobile.' },
          { title: 'Push Alerts Nodes', desc: 'Schedule new collections drops banners to customer browser nodes.' }
        ].map((mod, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="font-semibold text-fg-luxury uppercase tracking-wider block mb-2">{mod.title}</span>
              <p className="font-light leading-relaxed">{mod.desc}</p>
            </div>
            <button onClick={() => showToast('Marketing campaign parameters logged.', 'success')} className="btn-editorial text-[9px] py-1.5 w-fit mt-4">Launch campaign</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="flex flex-col gap-8 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Analytics visualizations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted">
        <div className="border border-neutral-soft p-5 bg-neutral-soft/5">
          <span className="font-semibold text-fg-luxury uppercase tracking-wider block mb-4">Traffic Acquisition Sources</span>
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-soft pb-1"><span>Direct Search</span> <span>64% (2,490)</span></li>
            <li className="flex justify-between border-b border-neutral-soft pb-1"><span>Instagram Campaigns</span> <span>22% (850)</span></li>
            <li className="flex justify-between"><span>Pinterest referrals</span> <span>14% (540)</span></li>
          </ul>
        </div>
        <div className="border border-neutral-soft p-5 bg-neutral-soft/5">
          <span className="font-semibold text-fg-luxury uppercase tracking-wider block mb-4">Checkout Conversion Funnel</span>
          <ul className="space-y-2">
            <li className="flex justify-between border-b border-neutral-soft pb-1"><span>Product Page Views</span> <span>100% (14,230)</span></li>
            <li className="flex justify-between border-b border-neutral-soft pb-1"><span>Equipped to Cart</span> <span>12% (1,707)</span></li>
            <li className="flex justify-between"><span>Completed checkouts</span> <span>3.1% (441)</span></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Financial Accounting reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-muted">
        {['Q1 Income statement parameters.csv', 'Drone Logistics metrics logs.csv', 'Tax and Customs returns.csv', 'Visitor Conversion Analysis.csv'].map((file, idx) => (
          <div key={idx} className="border border-neutral-soft p-4 bg-neutral-soft/5 flex justify-between items-center">
            <span>{file}</span>
            <button onClick={() => showToast('Starting CSV download stream.', 'success')} className="btn-editorial py-1 px-3 text-[9px] flex items-center gap-1"><Download size={12} /> Get Report</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Fulfillment Support Tickets</h2>
      <div className="flex flex-col gap-4 text-xs text-text-muted">
        {[
          { code: 'TKT-9428', author: 'Aryan Dev', desc: 'Drone package landed on neighbors roof, parcel retrieved but box damaged.', status: 'open' },
          { code: 'TKT-7129', author: 'Meera Sen', desc: 'Size exchange requested, size M is slightly loose.', status: 'closed' }
        ].map((tkt, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center">
            <div>
              <span className="font-semibold text-fg-luxury uppercase tracking-wider">{tkt.code}</span>
              <p className="font-light mt-1">&ldquo;{tkt.desc}&rdquo;</p>
              <span className="text-[8px] uppercase tracking-widest mt-1 block">Customer: {tkt.author}</span>
            </div>
            <button onClick={() => showToast('Opening support response modal dialog.', 'info')} className="btn-editorial py-1.5 px-4 text-[9px] uppercase font-semibold">Reply</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('Alerts and notifications settings saved.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Fulfillment Notifications</h2>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="accent-fg-luxury" />
        <span className="text-[9px] uppercase tracking-widest text-fg-luxury">Send drone tracking link direct via SMS</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="accent-fg-luxury" />
        <span className="text-[9px] uppercase tracking-widest text-fg-luxury">Send email receipts upon successful Razorpay webhook clearance</span>
      </label>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save configuration</button>
    </form>
  );

  const renderSEO = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('SEO Meta parameters saved.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Global SEO Configuration</h2>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">Default meta keywords (comma separated)</label>
        <input type="text" className="input-editorial text-xs" defaultValue="freert, clothing, linen, structured outerwear, minimalist luxury, organic garments" />
      </div>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">Custom URL redirects manager (origin to target)</label>
        <input type="text" className="input-editorial text-xs font-mono" defaultValue="/shop/old-arrival to /shop/new-arrivals" />
      </div>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save SEO configs</button>
    </form>
  );

  const renderSettings = () => (
    <form onSubmit={(e) => { e.preventDefault(); showToast('Brand Visual Settings Saved.', 'success'); }} className="flex flex-col gap-6 text-left max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-6 text-xs text-text-muted">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Store Branding settings</h2>
      <div>
        <label className="text-[8px] uppercase tracking-wider mb-1 block">Brand Name</label>
        <input type="text" className="input-editorial text-xs" defaultValue="FREERT" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Primary Theme Color</label>
          <input type="text" className="input-editorial text-xs font-mono" defaultValue="#faf9f6" />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wider mb-1 block">Secondary Theme Color</label>
          <input type="text" className="input-editorial text-xs font-mono" defaultValue="#111111" />
        </div>
      </div>
      <button type="submit" className="btn-editorial-solid py-3 text-[9px] flex items-center gap-1 justify-center"><Save size={13} /> Save settings</button>
    </form>
  );

  const renderAdmins = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">System Administrators & Roles</h2>
      <div className="flex flex-col gap-3">
        {[
          { name: 'Admin Prince (Owner)', email: 'prince@freert.net', role: 'Superadmin' },
          { name: 'Operator Harsh (Logistics Manager)', email: 'harsh@freert.net', role: 'Fulfillment operator' }
        ].map((adm, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex justify-between items-center text-xs text-text-muted">
            <div>
              <p className="font-semibold text-fg-luxury uppercase tracking-wider">{adm.name}</p>
              <span className="text-[8px] uppercase tracking-widest block mt-1">{adm.email}</span>
            </div>
            <span className="text-[8px] uppercase tracking-widest bg-green-100 text-green-800 py-1 px-3 font-semibold">{adm.role}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Audit System Logs</h2>
      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto text-xs text-text-muted">
        {[
          { time: '2026-07-21 15:42', admin: 'Prince', action: 'Modified announcement bar message parameters.' },
          { time: '2026-07-21 14:15', admin: 'Harsh', action: 'Approved return request verification for order FR-392812.' },
          { time: '2026-07-21 11:00', admin: 'Prince', action: 'Imported batch listing CSV payload parameters.' }
        ].map((log, idx) => (
          <div key={idx} className="border border-neutral-soft p-3 bg-neutral-soft/5 font-mono text-[9.5px]">
            <span className="text-accent-gold mr-3">{log.time}</span>
            <span className="font-semibold text-fg-luxury mr-2">[{log.admin}]</span>
            <span>{log.action}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackups = () => (
    <div className="flex flex-col gap-6 text-left">
      <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury border-b border-neutral-soft pb-2">Platform configuration backups</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-text-muted">
        {[
          { title: 'Database Backup', desc: 'Download a full structured JSON payload of products, categories, orders and customer databases.' },
          { title: 'Media Assets backup', desc: 'Zip and download the campaigns and lookbooks visual media files.' },
          { title: 'Configurations settings', desc: 'Export email templates, Razorpay merchant API parameters.' }
        ].map((bkp, idx) => (
          <div key={idx} className="border border-neutral-soft p-5 bg-neutral-soft/5 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="font-semibold text-fg-luxury uppercase tracking-wider block mb-2">{bkp.title}</span>
              <p className="font-light leading-relaxed">{bkp.desc}</p>
            </div>
            <button onClick={() => showToast('Generating platform archive stream...', 'success')} className="btn-editorial-solid text-[9px] py-1.5 w-fit mt-4 flex items-center gap-1"><Download size={12} /> Export file</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Router matching
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'orders': return renderOrders();
      case 'products': return renderProducts();
      case 'categories': return renderCategories();
      case 'collections': return renderCollections();
      case 'inventory': return renderInventory();
      case 'customers': return renderCustomers();
      case 'reviews': return renderReviews();
      case 'coupons': return renderCoupons();
      case 'cms': return renderCMS();
      case 'hero': return renderHero();
      case 'media': return renderMedia();
      case 'lookbook': return renderLookbook();
      case 'blogs': return renderBlogs();
      case 'pages': return renderPages();
      case 'navigation': return renderNavigation();
      case 'announcements': return renderAnnouncements();
      case 'marketing': return renderMarketing();
      case 'analytics': return renderAnalytics();
      case 'reports': return renderReports();
      case 'tickets': return renderTickets();
      case 'notifications': return renderNotifications();
      case 'seo': return renderSEO();
      case 'settings': return renderSettings();
      case 'admins': return renderAdmins();
      case 'logs': return renderLogs();
      case 'backups': return renderBackups();
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
    <React.Suspense fallback={<div className="text-xs text-text-muted uppercase tracking-widest font-light p-12 text-left">Loading Admin workspace...</div>}>
      <AdminCoreWorkspace />
    </React.Suspense>
  );
}
