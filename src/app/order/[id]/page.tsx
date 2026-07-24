'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getOrderById, updateOrderDetails } from '@/services/database';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, Calendar, CreditCard, ShieldCheck, Printer, Truck, FileText, ChevronRight, PackageCheck, AlertCircle 
} from 'lucide-react';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancellationReason, setCancellationReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      if (data) {
        setOrder(data);
      } else {
        // Fallback check in local storage logs for guest checkouts
        const localLogs = localStorage.getItem('freert_orders_log');
        if (localLogs) {
          const list = JSON.parse(localLogs);
          const matched = list.find((item: any) => String(item.id) === orderId || String(item.order_number) === orderId);
          if (matched) {
            setOrder({
              id: matched.id,
              order_number: matched.order_number,
              created_at: new Date(matched.date).toISOString(),
              total_amount: matched.totalAmount,
              discount_amount: matched.discountAmount,
              status: matched.status,
              payment_provider: matched.paymentMethod,
              is_local_guest: true,
              items: matched.items.map((i: any) => ({
                qty: i.qty,
                unit_price: i.price,
                variant: {
                  size: i.size,
                  color: i.color,
                  product: {
                    name: i.name,
                    images: ['/assets/trench_coat.jpg']
                  }
                }
              }))
            });
            setLoading(false);
            return;
          }
        }
        showToast('Order details could not be found.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading order records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const finalReason = cancellationReason === 'Other' ? customReason.trim() : cancellationReason;
    if (!finalReason) {
      showToast('Please specify a cancellation reason.', 'error');
      return;
    }

    setIsSubmittingCancellation(true);
    try {
      if (order.is_local_guest) {
        // Update guest checkout local log
        const localLogs = localStorage.getItem('freert_orders_log');
        if (localLogs) {
          const list = JSON.parse(localLogs);
          const updated = list.map((item: any) => {
            if (String(item.id) === order.id) {
              return { 
                ...item, 
                cancelRequested: true, 
                cancelReason: finalReason, 
                cancelRequestStatus: 'pending' 
              };
            }
            return item;
          });
          localStorage.setItem('freert_orders_log', JSON.stringify(updated));
        }
        setOrder((prev: any) => ({
          ...prev,
          cancel_requested: true,
          cancel_reason: finalReason,
          cancel_request_status: 'pending'
        }));
      } else {
        await updateOrderDetails(order.id, {
          cancelRequested: true,
          cancelReason: finalReason,
          cancelRequestStatus: 'pending'
        });
        setOrder((prev: any) => ({
          ...prev,
          cancel_requested: true,
          cancel_reason: finalReason,
          cancel_request_status: 'pending'
        }));
      }

      showToast('Cancellation request submitted successfully.', 'success');
      setIsCancelModalOpen(false);
    } catch (err) {
      showToast('Failed to register cancellation request.', 'error');
    } finally {
      setIsSubmittingCancellation(false);
    }
  };

  const getTimelineSteps = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'cancelled') {
      return [
        { label: 'Placed', done: true },
        { label: 'Cancelled', done: true, isError: true }
      ];
    }
    return [
      { label: 'Ordered', done: true },
      { label: 'Packed', done: s === 'packed' || s === 'shipped' || s === 'out_for_delivery' || s === 'delivered' },
      { label: 'Dispatched', done: s === 'shipped' || s === 'out_for_delivery' || s === 'delivered' },
      { label: 'Delivered', done: s === 'delivered' }
    ];
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-luxury">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-32 text-center gap-4">
          <div className="w-8 h-8 border border-neutral-soft border-t-fg-luxury rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Fetching Order Credentials...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-luxury">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-32 text-center gap-6 max-w-md mx-auto px-4">
          <AlertCircle size={28} className="text-red-700 stroke-[1.2]" />
          <h2 className="text-sm uppercase tracking-widest font-semibold text-fg-luxury">Order Reference Missing</h2>
          <p className="text-[10px] uppercase tracking-widest text-text-muted leading-relaxed">
            The referenced order ID could not be loaded. Please ensure the routing parameters match your checkout receipt.
          </p>
          <Link href="/dashboard" className="btn-editorial-solid text-[9px] py-3 px-6 tracking-widest">
            Return to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const creationDate = order.created_at?.split('T')[0] || '—';
  const displayId = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8).toUpperCase();
  const itemsSubtotal = order.items?.reduce((sum: number, item: any) => sum + (item.unit_price * item.qty), 0) || 0;
  const shippingCost = Math.max(0, order.total_amount - itemsSubtotal + (order.discount_amount || 0));
  const expectedDateText = order.expected_delivery_date ? new Date(order.expected_delivery_date).toDateString() : '3-5 Business Days';

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-soft/20 pb-6 mb-10">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard?tab=orders" className="text-text-muted hover:text-fg-luxury text-[9px] uppercase tracking-widest flex items-center gap-1.5 mb-2 font-medium">
              <ArrowLeft size={10} /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-widest text-fg-luxury flex items-center gap-3">
              Order {displayId}
            </h1>
            <span className="text-[9px] text-text-muted uppercase tracking-wider font-light flex items-center gap-1.5 mt-0.5">
              <Calendar size={11} /> Registered: {creationDate}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[9.5px] uppercase font-semibold py-1 px-3 border border-neutral-soft ${
              order.status === 'delivered' ? 'bg-green-50 text-green-800 border-green-200' : 
              order.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 
              'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {order.cancel_requested && order.cancel_request_status === 'pending' ? 'Cancellation Pending' : order.status}
            </span>
            <Link 
              href={`/order/${order.id}/invoice`} 
              target="_blank" 
              className="btn-editorial py-1.5 px-4 text-[9px] uppercase tracking-widest font-semibold flex items-center gap-1.5"
            >
              <Printer size={12} /> Print Invoice
            </Link>
          </div>
        </div>

        {/* Cancellation Warnings */}
        {order.cancel_requested && (
          <div className="border border-red-700 bg-red-50/5 p-5 mb-10 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-red-700">Cancellation request registered</span>
            <p className="text-[10.5px] text-text-muted leading-relaxed">
              <strong>Status:</strong> {order.cancel_request_status || 'Pending Review'}<br/>
              <strong>Reason:</strong> {order.cancel_reason}
            </p>
            {order.cancel_admin_notes && (
              <p className="text-[9.5px] text-red-800 italic border-l border-red-200 pl-2 mt-2">
                <strong>Admin Rejection Memo:</strong> {order.cancel_admin_notes}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Main Details Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Tracking Progression */}
            {order.status !== 'cancelled' && (
              <div className="border border-neutral-soft/60 p-6 bg-bg-luxury/50 rounded-sm">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-neutral-soft/20 pb-3">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">Logistics Consignment Progression</h3>
                  <span className="text-[9px] uppercase font-light text-text-muted tracking-wider">Est. Delivery: {expectedDateText}</span>
                </div>
                
                <div className="grid grid-cols-4 text-center relative items-center max-w-lg mx-auto py-2">
                  <div className="absolute top-[8px] left-[12.5%] right-[12.5%] h-[1.5px] bg-neutral-soft z-0" />
                  {getTimelineSteps(order.status).map((pt, idx) => (
                    <div key={idx} className="z-10 flex flex-col items-center gap-1.5">
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[8.5px] transition-all duration-300 ${
                        pt.done 
                          ? 'bg-fg-luxury text-bg-luxury border-fg-luxury font-semibold' 
                          : 'bg-bg-luxury text-text-muted border-neutral-soft'
                      }`}>
                        ✓
                      </div>
                      <span className={`text-[7.5px] uppercase tracking-widest font-semibold ${pt.done ? 'text-fg-luxury' : 'text-text-muted'}`}>
                        {pt.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                {order.tracking_number && (
                  <div className="mt-6 pt-4 border-t border-neutral-soft/10 flex justify-between items-center text-[9px] uppercase tracking-wider text-text-muted font-light">
                    <span>AWB Courier Partner: {order.courier_name || 'Logistics Provider'}</span>
                    <span>AWB Consignment Ref: <strong className="text-fg-luxury select-all ml-1 font-semibold">{order.tracking_number}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Order Items list */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2 mb-2">
                Order Specifications
              </h3>
              <div className="flex flex-col gap-4">
                {order.items?.map((item: any, idx: number) => {
                  const name = item.product?.name || item.variant?.product?.name || 'Garment Detail';
                  const price = item.unit_price || 0;
                  const qty = item.qty || 1;
                  const size = item.size || item.variant?.size || 'One Size';
                  const color = item.color || item.variant?.color || 'Default';
                  const slug = item.product?.slug || item.variant?.product?.slug || '';
                  const itemImg = item.product?.images?.[0] || item.variant?.product?.images?.[0] || '/assets/trench_coat.jpg';
                  
                  const ItemContent = () => (
                    <div className="border border-neutral-soft/30 p-4 bg-neutral-soft/5 flex justify-between items-center gap-6 hover:border-neutral-soft transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <img 
                          src={itemImg} 
                          className="w-12 h-16 object-cover border border-neutral-soft/30" 
                          alt={name} 
                        />
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury">{name}</span>
                          <span className="text-[8.5px] uppercase tracking-widest text-text-muted font-light">
                            Size: {size} · Color: {color}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold text-fg-luxury">₹{(price * qty).toLocaleString('en-IN')}</span>
                        <span className="text-[8.5px] uppercase tracking-widest text-text-muted font-light">
                          ₹{price.toLocaleString('en-IN')} × {qty}
                        </span>
                      </div>
                    </div>
                  );

                  return slug ? (
                    <Link key={idx} href={`/product/${slug}`} className="block cursor-pointer">
                      <ItemContent />
                    </Link>
                  ) : (
                    <div key={idx}>
                      <ItemContent />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support trigger */}
            <div className="border border-neutral-soft/60 p-5 bg-neutral-soft/5 text-center flex flex-col gap-3 justify-center items-center">
              <span className="text-[9.5px] uppercase tracking-[0.2em] font-bold text-fg-luxury">Need Assistance With This Order?</span>
              <p className="text-[9.5px] text-text-muted uppercase max-w-sm font-light">
                Our concierge service is available to handle dispatch modifications, address corrections, and size updates.
              </p>
              <Link href="/support" className="text-[9px] uppercase font-semibold text-accent-gold border-b border-accent-gold pb-0.5">
                Contact Concierge Helpdesk
              </Link>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Address Recipient Details */}
            {order.address && (
              <div className="border border-neutral-soft/50 p-6 bg-neutral-soft/5 flex flex-col gap-4 text-left">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/35 pb-2">
                  Delivery Destination
                </h3>
                <div className="text-[10.5px] font-light text-text-muted leading-relaxed flex flex-col gap-1">
                  <p className="font-semibold text-fg-luxury uppercase tracking-wider">{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state}</p>
                  <p>{order.address.country} &middot; {order.address.postal_code}</p>
                </div>
              </div>
            )}

            {/* Financial Invoice Specs summary */}
            <div className="border border-neutral-soft/60 p-6 bg-bg-luxury text-left flex flex-col gap-5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury border-b border-neutral-soft/30 pb-2">
                Order Billing
              </h3>
              
              <div className="flex flex-col gap-2.5 text-xs text-text-muted">
                <div className="flex justify-between uppercase tracking-wider text-[9px]">
                  <span>Subtotal</span>
                  <span className="text-fg-luxury font-medium">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between uppercase tracking-wider text-[9px] text-green-700 font-medium">
                    <span>Coupon Deductions</span>
                    <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between uppercase tracking-wider text-[9px]">
                  <span>Logistics Charges</span>
                  <span className="text-fg-luxury font-medium">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between text-fg-luxury font-semibold uppercase tracking-[0.1em] text-sm pt-4 border-t border-neutral-soft/20 mt-2">
                  <span>Grand Total (Inc. GST)</span>
                  <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-text-muted justify-center border-t border-neutral-soft/10 pt-4 font-light uppercase tracking-widest">
                <CreditCard size={12} strokeWidth={1.5} /> Paid via: <strong className="text-fg-luxury font-medium">{order.payment_provider || order.payment?.provider || 'COD'}</strong>
              </div>

              {/* Cancellation triggers */}
              {!order.cancel_requested && order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full bg-red-800 text-white text-[9.5px] font-semibold tracking-widest py-3 hover:bg-red-950 transition-colors uppercase border border-red-700 cursor-pointer mt-2"
                >
                  Request Cancellation
                </button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Cancellation Modal (Concierge Request Portal) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease-out] no-print">
          <div className="w-full max-w-sm bg-bg-luxury border border-neutral-soft/90 p-8 shadow-2xl flex flex-col gap-6 text-left animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="text-center pb-4 border-b border-neutral-soft/30">
              <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">Order Cancellation</h3>
              <p className="text-[9px] text-text-muted font-light uppercase tracking-widest leading-relaxed mt-1.5">
                Are you sure you wish to initiate a cancellation request for order {displayId}?
              </p>
            </div>
            
            <form onSubmit={handleRequestCancellation} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-semibold">Select Reason</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="input-editorial text-xs py-1.5 bg-bg-luxury"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Selected incorrect variant size">Selected incorrect variant size</option>
                  <option value="Delivery transit delay concerns">Delivery transit delay concerns</option>
                  <option value="Found alternative item listings">Found alternative item listings</option>
                  <option value="Other">Other (Write Custom Reason)</option>
                </select>
              </div>

              {cancellationReason === 'Other' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-semibold">Custom Explanation</label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Provide cancellation memo"
                    className="input-editorial text-xs py-1.5"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="btn-editorial flex-1 text-[9.5px] uppercase font-semibold py-3 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancellation}
                  className="bg-red-800 hover:bg-red-950 text-white flex-1 text-[9.5px] font-semibold tracking-widest py-3 uppercase border border-red-700 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCancellation ? 'Submitting...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}
