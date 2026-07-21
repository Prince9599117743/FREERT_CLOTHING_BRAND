'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getOrders } from '@/services/database';
import { Package, User, Star, Copy, Check } from 'lucide-react';

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
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart } = useCart();
  
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [copied, setCopied] = useState(false);
  const referralCode = 'FR-LOYAL-9599';

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
          id: o.id,
          date: o.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          totalAmount: o.totalAmount,
          status: o.status,
          items: o.items ? o.items.map((i: any) => ({
            name: i.variant?.product?.name || 'Garment Article',
            qty: i.qty,
            price: i.unitPrice,
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
        <p style={{ color: '#888', fontSize: 12, maxWidth: 320, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>We are currently updating our database clusters. Secure connections will resume shortly.</p>
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
                <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1 font-medium">Membership Level</p>
                <p className="text-xs uppercase tracking-widest text-fg-luxury font-semibold flex items-center gap-1.5">
                  <Star size={12} className="text-accent-gold fill-accent-gold" /> Gold Member
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1 font-medium">Loyalty Points</p>
                <p className="text-xs uppercase tracking-wider text-fg-luxury font-semibold">1,240 Points</p>
              </div>
            </div>

            {/* Invite program */}
            <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-fg-luxury">Referral Program</h4>
              <p className="text-[11px] text-text-muted font-light leading-relaxed">
                Invite friends to join FREERT. Earn 200 Loyalty points for each referral.
              </p>
              <div className="flex border border-neutral-soft/80 bg-bg-luxury p-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`https://freertclothing.vercel.app/signup?ref=${referralCode}`}
                  className="bg-transparent text-[9px] font-light w-full text-fg-luxury focus:outline-none truncate"
                />
                <button 
                  onClick={handleCopyReferral}
                  className="text-text-muted hover:text-fg-luxury transition-colors cursor-pointer ml-1"
                  aria-label="Copy Referral URL"
                >
                  {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
                </button>
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
                        <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">{order.id}</span>
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
