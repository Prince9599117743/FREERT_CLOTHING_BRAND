'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
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
  const referralCode = 'invite-node-9441281ff';

  useEffect(() => {
    // Read orders from localStorage
    const saved = localStorage.getItem('freert_orders_log');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        setOrders([]);
      }
    } else {
      // Setup some initial mock orders to make the UI look rich and professional!
      const initialLogs: OrderLog[] = [
        {
          id: 'FR-847291',
          date: '2026-07-15',
          totalAmount: 18300.00,
          status: 'delivered',
          items: [
            { name: 'Linen Trench Coat', qty: 1, price: 14500.00, size: 'L', color: 'Natural Flax' },
            { name: 'Structured Kimono Shirt', qty: 1, price: 5800.00, size: 'M', color: 'Ivory Cream' }
          ]
        },
        {
          id: 'FR-712891',
          date: '2026-06-20',
          totalAmount: 8900.00,
          status: 'delivered',
          items: [
            { name: 'Raw Silk Utility Trouser', qty: 1, price: 8900.00, size: 'M', color: 'Sand Beige' }
          ]
        }
      ];
      localStorage.setItem('freert_orders_log', JSON.stringify(initialLogs));
      setOrders(initialLogs);
    }
  }, []);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://freert.net/invite/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        <h1 className="text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left panel: user summary details */}
          <div className="lg:col-span-4 bg-neutral-soft/15 p-8 border border-neutral-soft/50 text-left flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-fg-luxury text-bg-luxury rounded-full flex items-center justify-center font-editorial font-semibold text-lg">
                {user ? user.fullName?.charAt(0) || 'U' : 'O'}
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-fg-luxury">
                  {user ? user.fullName || 'Identity Configured' : 'Operator #9441'}
                </h3>
                <p className="text-[10px] text-text-muted font-light lowercase mt-0.5">{user?.email || 'operator@freert.net'}</p>
              </div>
            </div>

            <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1 font-medium">Rank Tier</p>
                <p className="text-xs uppercase tracking-widest text-fg-luxury font-semibold flex items-center gap-1.5">
                  <Star size={12} className="text-accent-gold fill-accent-gold" /> Cyber-Elite
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-text-muted mb-1 font-medium">Loyalty Credits</p>
                <p className="text-xs uppercase tracking-wider text-fg-luxury font-semibold">1,240 RT</p>
              </div>
            </div>

            {/* Invite program */}
            <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-fg-luxury">Invite Connection</h4>
              <p className="text-[11px] text-text-muted font-light leading-relaxed">
                Connect additional nodes. Earn 200 Loyalty credits (RT) per contact.
              </p>
              <div className="flex border border-neutral-soft/80 bg-bg-luxury p-2">
                <input 
                  type="text" 
                  readOnly 
                  value={referralCode}
                  className="bg-transparent text-[10px] font-light w-full text-fg-luxury focus:outline-none"
                />
                <button 
                  onClick={handleCopyReferral}
                  className="text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
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
              Order Database History ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="py-12 border border-dashed border-neutral-soft text-center text-xs text-text-muted uppercase tracking-widest font-light">
                No orders registered on this workspace node.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-neutral-soft/50 p-6 flex flex-col gap-4 hover:border-neutral-400 transition-colors duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">{order.id}</span>
                        <span className="text-[10px] text-text-muted font-light ml-3">Logged: {order.date}</span>
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

                    <div className="flex justify-between items-baseline pt-4 border-t border-neutral-soft/20 text-xs font-semibold uppercase tracking-[0.1em] text-fg-luxury">
                      <span>Paid Total</span>
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
