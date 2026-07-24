'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { getOrderForTracking } from '@/services/database';
import { useToast } from '@/contexts/ToastContext';
import { Search, Compass, Package, Truck, CheckCircle2, Clipboard, ShieldAlert, AlertCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await getOrderForTracking(searchQuery.trim());
      setOrder(data);
      if (!data) {
        showToast('No active orders matching this reference query.', 'info');
      } else {
        showToast('Tracking details synchronized.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('System offline. Please try again shortly.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Tracking code copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format date string
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Tracking timeline state builder
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: 'placed', label: 'Order Placed', desc: 'Secure verification complete', done: true },
      { key: 'processing', label: 'Processing', desc: 'Sartorial tailoring & packaging', done: false },
      { key: 'shipped', label: 'Dispatched', desc: 'Handed to premium courier logisticians', done: false },
      { key: 'delivered', label: 'Delivered', desc: 'Consignment successfully completed', done: false },
    ];

    if (status === 'processing') {
      steps[1].done = true;
    } else if (status === 'shipped') {
      steps[1].done = true;
      steps[2].done = true;
    } else if (status === 'delivered') {
      steps[1].done = true;
      steps[2].done = true;
      steps[3].done = true;
    }

    return steps;
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left max-w-4xl">
        {/* Header Title */}
        <div className="flex flex-col gap-2 mb-10 border-b border-neutral-soft/20 pb-6">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-fg-luxury">
            Track Consignment
          </h1>
          <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">
            Check expected delivery times, courier status, and package updates.
          </p>
        </div>

        {/* Search Input bar */}
        <form onSubmit={handleSearch} className="flex gap-4 border-b border-neutral-soft/80 pb-3 mb-12">
          <input
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ENTER ORDER ID OR TRACKING ID"
            className="bg-transparent text-xs font-light placeholder-neutral-400 focus:outline-none w-full text-fg-luxury uppercase tracking-wider"
          />
          <button type="submit" className="hover:text-accent-gold transition-colors duration-300 cursor-pointer" aria-label="Search Order">
            <Search size={16} strokeWidth={1.5} />
          </button>
        </form>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-6 h-6 border border-neutral-soft border-t-fg-luxury rounded-full animate-spin mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium">Synchronizing Courier Status...</p>
          </div>
        ) : searched && !order ? (
          /* Search Fail Screen */
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto animate-[fadeIn_0.4s_ease-out]">
            <AlertCircle size={24} className="text-red-700/80 stroke-[1.2] mb-5" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Reference Not Found</h3>
            <p className="text-[10px] uppercase tracking-widest text-text-muted leading-relaxed mb-6">
              We could not locate any active deliveries matching this code. Please verify the ID or contact client concierge support.
            </p>
            <Link href="/support" className="text-[9px] uppercase tracking-[0.25em] font-semibold text-fg-luxury hover:text-accent-gold transition-colors border-b border-fg-luxury hover:border-accent-gold pb-0.5">
              Contact Support
            </Link>
          </div>
        ) : order ? (
          /* Tracking Details Layout */
          <div className="flex flex-col gap-10 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Timeline Header Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-neutral-soft/50 p-6 bg-neutral-soft/5">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] uppercase tracking-widest text-text-muted font-semibold">Delivery Reference</span>
                <span className="text-xs font-semibold text-fg-luxury uppercase tracking-wider">
                  Order #{order.order_number || order.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] uppercase tracking-widest text-text-muted font-semibold">Logistic Courier</span>
                <span className="text-xs font-semibold text-fg-luxury uppercase tracking-wider">
                  {order.courier_name || 'Blue Dart Logistics'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] uppercase tracking-widest text-text-muted font-semibold">Expected Handover</span>
                <span className="text-xs font-semibold text-fg-luxury uppercase tracking-wider">
                  {formatDate(order.expected_delivery_date)}
                </span>
              </div>
            </div>

            {/* Tracking ID and copy details */}
            {order.tracking_number && (
              <div className="flex justify-between items-center bg-bg-luxury border border-neutral-soft/40 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-text-muted">Awb Tracking ID:</span>
                  <span className="text-[10px] font-semibold text-fg-luxury uppercase tracking-wider font-mono">{order.tracking_number}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(order.tracking_number)}
                  className="flex items-center gap-1 text-[8.5px] uppercase tracking-widest text-fg-luxury hover:text-accent-gold transition-colors font-semibold cursor-pointer"
                >
                  {copied ? <Check size={11} className="text-green-700" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Cancelled Alert Banner */}
            {order.status === 'cancelled' ? (
              <div className="p-5 border border-red-700 bg-red-50/10 text-left flex items-start gap-4 animate-[slideInLeft_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                <ShieldAlert size={18} className="text-red-700 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-red-700">Delivery Cancelled</span>
                  <p className="text-[10px] text-red-700/80 leading-relaxed max-w-2xl font-light">
                    This order was cancelled at customer request or due to fulfillment limits. {order.cancel_reason && `Reason: ${order.cancel_reason}`}
                  </p>
                </div>
              </div>
            ) : (
              /* Timeline progress indicators */
              <div className="flex flex-col gap-6 p-6 border border-neutral-soft/50 bg-bg-luxury">
                <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/20"> FULFILLMENT PATH </h3>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 py-4">
                  {/* Horizontal Bar background for Desktop */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-neutral-soft/30 -translate-y-1/2 z-0 hidden md:block" />
                  
                  {getTimelineSteps(order.status).map((step, idx) => (
                    <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 z-10 bg-bg-luxury md:px-4 flex-1">
                      {/* Check mark indicator */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                        step.done 
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' 
                          : 'border-neutral-soft/60 bg-bg-luxury text-text-muted'
                      }`}>
                        {step.done ? <CheckCircle2 size={16} /> : <Package size={14} className="stroke-[1.3]" />}
                      </div>

                      {/* Labels and description */}
                      <div className="flex flex-col md:items-center text-left md:text-center gap-0.5">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${step.done ? 'text-fg-luxury' : 'text-text-muted'}`}>
                          {step.label}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-text-muted font-light max-w-[140px] leading-relaxed">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consignment Items Details List */}
            <div className="border border-neutral-soft/50 p-6 bg-bg-luxury flex flex-col gap-4 text-left">
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/20"> CONSIGNMENT ARTICLES </h3>
              <div className="flex flex-col gap-4">
                {order.items?.map((item: any) => {
                  const prod = item.variant?.product;
                  const thumb = prod?.images?.[0] || '/assets/trench_coat.jpg';
                  return (
                    <div key={item.id} className="flex justify-between items-center gap-6 pb-4 border-b border-neutral-soft/20 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <img src={thumb} className="w-10 h-14 object-cover border border-neutral-soft/40" alt="" />
                        <div className="flex flex-col gap-0.5">
                          <Link href={`/product/${prod?.slug || ''}`} className="text-[11px] uppercase tracking-wider font-semibold text-fg-luxury hover:text-accent-gold transition-colors">
                            {prod?.name || 'Garment Article'}
                          </Link>
                          <span className="text-[8px] uppercase text-text-muted tracking-widest font-light">
                            Size: {item.variant?.size || 'One Size'} · Color: {item.variant?.color || 'Default'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold text-fg-luxury">₹{Number(item.unit_price).toLocaleString('en-IN')}</span>
                        <span className="text-[8.5px] uppercase tracking-widest text-text-muted font-light">Qty: {item.qty}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Billing */}
              <div className="border-t border-neutral-soft/20 pt-4 flex justify-between items-baseline font-semibold text-fg-luxury text-xs">
                <span className="uppercase tracking-wider">Total Package Value</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        ) : (
          /* Initial Empty state prompt */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto animate-[fadeIn_0.5s_ease-out]">
            <Compass size={24} className="text-text-muted/6 stroke-[1.2] mb-5 animate-spin" style={{ animationDuration: '30s' }} />
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Ready to Track</h3>
            <p className="text-[10px] uppercase tracking-widest text-text-muted leading-relaxed">
              Enter your order reference code or logistics air waybill ID in the search input above to coordinate timelines.
            </p>
          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
