'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { getOrders } from '@/services/database';
import { Package, User, Star, Copy, Check, Edit2 } from 'lucide-react';

interface OrderItemLog {
  name: string;
  qty: number;
  price: number;
  size: string;
  color: string;
}

interface OrderLog {
  id: string;
  date: string;
  totalAmount: number;
  status: string;
  items: OrderItemLog[];
  orderNumber?: number;
  order_number?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { cart } = useCart();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [copied, setCopied] = useState(false);
  const referralCode = 'FR-LOYAL-9599';

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Initialize edit fields when user profile loads
  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name is required.', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(editName.trim(), editPhone.trim());
      showToast('Profile updated successfully.', 'success');
      setIsEditingProfile(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getTimelineSteps = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') {
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: true },
        { label: 'Out for Delivery', done: true },
        { label: 'Delivered', done: true }
      ];
    } else if (s === 'shipped') {
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: true },
        { label: 'Out for Delivery', done: false },
        { label: 'Delivered', done: false }
      ];
    } else if (s === 'cancelled') {
      return [
        { label: 'Ordered', done: false },
        { label: 'Packed', done: false },
        { label: 'Shipped', done: false },
        { label: 'Out for Delivery', done: false },
        { label: 'Cancelled', done: true, isCancel: true }
      ];
    } else {
      // pending / processing
      return [
        { label: 'Ordered', done: true },
        { label: 'Packed', done: true },
        { label: 'Shipped', done: false },
        { label: 'Out for Delivery', done: false },
        { label: 'Delivered', done: false }
      ];
    }
  };

  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const data = await getOrders(user.id);
        // Map Order records to local OrderLog format
        const mapped: OrderLog[] = data.map((o: any) => ({
          id: o.order_number ? String(o.order_number) : (o.orderNumber ? String(o.orderNumber) : o.id),
          date: (o.created_at || o.createdAt)?.split('T')[0] || new Date().toISOString().split('T')[0],
          totalAmount: Number(o.total_amount || o.totalAmount || 0),
          status: o.status,
          items: o.items ? o.items.map((i: any) => ({
            name: i.variant?.product?.name || 'Garment Article',
            qty: i.qty,
            price: Number(i.unit_price || i.unitPrice || 0),
            size: i.variant?.size || 'M',
            color: i.variant?.color || 'Black'
          })) : []
        }));
        setOrders(mapped);
      } catch (e: any) {
        if (e.message === 'DATABASE_CONNECTION_ERROR') {
          setDbError(true);
        } else {
          // Fallback to local storage (Development only)
          const saved = localStorage.getItem('freert_orders_log');
          if (saved) {
            try { setOrders(JSON.parse(saved)); } catch (e) {}
          }
        }
      }
    };
    fetchUserOrders();
  }, [user]);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://freertclothing.vercel.app/signup?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (dbError) {
    return (
      <div style={{ background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, padding: 20, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontSize: 16 }}>System Maintenance</h2>
        <p style={{ color: '#888', fontSize: 12, maxWidth: 320, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We are currently carrying out system updates. Services will resume shortly.</p>
        <div style={{ width: 20, height: 20, border: '1px solid #333', borderTop: '1px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        <h1 className="text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left panel: user summary details */}
          <div className="lg:col-span-4 bg-neutral-soft/15 p-8 border border-neutral-soft/50 text-left flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fg-luxury text-bg-luxury rounded-full flex items-center justify-center font-editorial font-semibold text-lg">
                {user ? user.fullName?.charAt(0).toUpperCase() || 'U' : 'C'}
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-fg-luxury">
                  {user ? user.fullName || 'Registered Customer' : 'Customer Account'}
                </h3>
                <p className="text-[10px] text-text-muted font-light lowercase mt-0.5">{user?.email || 'guest@domain.com'}</p>
              </div>
            </div>

            <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Account Details</p>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-[9px] uppercase tracking-wider text-accent-gold hover:text-fg-luxury flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 size={10} /> Edit Details
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[8px] uppercase tracking-[0.15em] text-text-muted font-medium">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-editorial text-xs py-1.5 px-2 bg-transparent text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[8px] uppercase tracking-[0.15em] text-text-muted font-medium">Phone Number (Optional)</label>
                      <input 
                        type="tel" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="input-editorial text-xs py-1.5 px-2 bg-transparent text-white"
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-2 text-[9px] tracking-wider uppercase font-semibold">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="btn-editorial py-2 px-3 border border-neutral-soft/40 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSavingProfile}
                        className="btn-editorial-solid py-2 px-4 cursor-pointer"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 text-xs uppercase tracking-wider text-fg-luxury font-light">
                    <p className="border-b border-neutral-soft/10 pb-2">
                      <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-0.5">Full Name</span> 
                      {user?.fullName || 'N/A'}
                    </p>
                    <p className="border-b border-neutral-soft/10 pb-2">
                      <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-0.5">Email Address</span> 
                      <span className="lowercase tracking-normal font-light">{user?.email || 'N/A'}</span>
                    </p>
                    <p className="pb-1">
                      <span className="text-[9px] text-text-muted font-normal block normal-case tracking-wider mb-0.5">Phone Number</span> 
                      {user?.phone || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: orders log list */}
          <div className="lg:col-span-8 text-left">
            <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/40 pb-2">
              Order History ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="py-12 border border-dashed border-neutral-soft text-center text-xs text-text-muted uppercase tracking-widest font-light">
                You have not placed any orders yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-neutral-soft/50 p-6 flex flex-col gap-4 hover:border-neutral-400 transition-colors duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">#{order.orderNumber || order.order_number || order.id}</span>
                        <span className="text-[10px] text-text-muted font-light ml-3">Date: {order.date}</span>
                      </div>
                      <span className={`text-[9px] uppercase tracking-widest py-1 px-3.5 font-light ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-neutral-soft/20">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-light text-text-muted">
                          <span>{item.name} ({item.color} | {item.size}) x {item.qty}</span>
                          <span className="text-fg-luxury">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer-Facing Tracking Timeline */}
                    <div className="border-t border-neutral-soft/20 pt-4 pb-2">
                      <p className="text-[8px] uppercase tracking-widest text-text-muted mb-4 font-semibold">Delivery Timeline Tracker</p>
                      <div className="grid grid-cols-5 text-center relative items-center max-w-md">
                        <div className="absolute top-[8px] left-[10%] right-[10%] h-[1px] bg-neutral-soft z-0" />
                        {getTimelineSteps(order.status).map((pt, idx) => (
                          <div key={idx} className="z-10 flex flex-col items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] transition-all duration-300 ${pt.done ? 'bg-fg-luxury text-bg-luxury border-fg-luxury' : 'bg-bg-luxury text-text-muted border-neutral-soft'}`}>
                              {pt.done ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[7px] uppercase tracking-widest font-semibold ${pt.done ? 'text-fg-luxury' : 'text-text-muted'}`}>{pt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline pt-4 border-t border-neutral-soft/20 text-xs font-semibold uppercase tracking-[0.1em] text-fg-luxury">
                      <span>Total Paid</span>
                      <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
