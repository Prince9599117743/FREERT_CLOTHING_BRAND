'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById } from '@/services/database';
import { Printer, ArrowLeft, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          }
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading invoice details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-4 py-32 text-center text-neutral-800">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-widest font-semibold">Generating Print Layout...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-6 py-32 text-center text-neutral-800 max-w-sm mx-auto px-4">
        <h2 className="text-xs uppercase tracking-widest font-bold">Invoice Details Missing</h2>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 leading-relaxed">
          The requested invoice parameters could not be resolved from local or remote database contexts.
        </p>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 border border-neutral-800 text-[10px] uppercase tracking-widest font-semibold hover:bg-neutral-800 hover:text-white transition-colors"
        >
          Return back
        </button>
      </div>
    );
  }

  const creationDate = order.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
  const displayId = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8).toUpperCase();
  const address = order.address || {
    street: 'Guest Address Coordinates',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    postal_code: '110001'
  };

  const itemsSubtotal = order.items?.reduce((sum: number, item: any) => sum + (item.unit_price * item.qty), 0) || 0;
  const gstAmount = Math.round(order.total_amount * 0.05); // 5% GST included
  const totalItemsCount = order.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans p-6 md:p-12 relative flex flex-col items-center">
      {/* Floating Action Topbar (Hidden on Print) */}
      <div className="no-print w-full max-w-4xl bg-neutral-50 border border-neutral-200 p-4 mb-8 flex justify-between items-center rounded-sm">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-semibold hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft size={12} /> Return to Order
        </button>
        <button 
          onClick={handlePrint}
          className="bg-neutral-900 text-white text-[9.5px] font-semibold tracking-widest py-2 px-5 hover:bg-neutral-800 transition-colors uppercase rounded-sm flex items-center gap-2 cursor-pointer"
        >
          <Printer size={13} /> Print Invoice (A4 / PDF)
        </button>
      </div>

      {/* Invoice Sheet Area */}
      <div className="w-full max-w-4xl border border-neutral-300 p-8 md:p-12 bg-white flex flex-col gap-10 shadow-sm text-left relative">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-300 pb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-[0.2em] uppercase text-neutral-900">
              FREERT
            </h1>
            <span className="text-[7.5px] uppercase tracking-[0.25em] text-neutral-500 font-medium">Concierge Division &bull; New Delhi</span>
          </div>
          <div className="text-right sm:text-right flex flex-col gap-0.5 text-xs">
            <span className="text-[11px] uppercase tracking-widest text-neutral-400">Tax Invoice Receipt</span>
            <span className="font-semibold text-neutral-950 text-sm">Invoice ID: {displayId}</span>
            <span className="text-[9.5px] font-light text-neutral-500">Date: {creationDate}</span>
          </div>
        </div>

        {/* Recipient Details & Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-light text-neutral-600">
          {/* Customer coordinates */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 border-b border-neutral-200 pb-1.5">Recipient Particulars</span>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-neutral-950 uppercase tracking-wide text-xs">{order.user?.full_name || 'Guest Receiver'}</p>
              <p className="flex items-center gap-1.5"><Mail size={11} /> {order.user?.email || order.email || '—'}</p>
              <p className="flex items-center gap-1.5"><Phone size={11} /> {order.user?.phone || order.phone || '—'}</p>
            </div>
          </div>

          {/* Delivery destination addresses */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 border-b border-neutral-200 pb-1.5">Shipping Destination</span>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-neutral-950 flex items-center gap-1.5"><MapPin size={11} /> {address.street}</p>
              <p>{address.city}, {address.state}</p>
              <p>{address.country} &middot; {address.postal_code}</p>
            </div>
          </div>
        </div>

        {/* Product Items Table Layout */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-400 text-neutral-900 uppercase font-semibold text-[8.5px] tracking-wider bg-neutral-50">
                <th className="py-3 px-4 w-[60%]">Garment Specifications</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, idx: number) => {
                const name = item.variant?.product?.name || 'Garment Detail';
                const price = item.unit_price || 0;
                const qty = item.qty || 1;
                const size = item.variant?.size || 'One Size';
                const color = item.variant?.color || 'Default';
                
                return (
                  <tr key={idx} className="border-b border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img src={item.variant?.product?.images?.[0] || '/assets/trench_coat.jpg'} className="w-8 h-10 object-cover border border-neutral-200" alt="" />
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-semibold text-neutral-950 uppercase tracking-wide">{name}</span>
                        <span className="text-[8.5px] text-neutral-500 uppercase tracking-widest font-light">Size: {size} · Color: {color}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-neutral-950">{qty}</td>
                    <td className="py-4 px-4 text-right">₹{price.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-right font-medium text-neutral-950">₹{(price * qty).toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Footnotes Block */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-8 pt-4">
          {/* GST and Payment indicators */}
          <div className="flex flex-col gap-2.5 text-[9.5px] text-left text-neutral-500 max-w-sm">
            <span className="text-[8px] uppercase tracking-widest font-bold text-neutral-800">Compliance &amp; Terms</span>
            <p className="leading-relaxed">
              * This is a computer generated tax receipt document. No physical signature is required under IGST Act regulations. All items include combined SGST + CGST values (5% total).
            </p>
            <div className="flex items-center gap-1.5 text-neutral-800 font-semibold uppercase tracking-wider text-[8px] mt-1 bg-neutral-100 p-2 rounded-sm w-fit">
              <ShieldCheck size={12} className="text-emerald-700" /> Settled via {order.payment_provider || order.payment?.provider || 'COD'}
            </div>
          </div>

          {/* Financial Breakdown calculations */}
          <div className="min-w-[280px] flex flex-col gap-2.5 border-t md:border-t-0 pt-4 md:pt-0 text-xs">
            <div className="flex justify-between text-neutral-500 uppercase tracking-wider text-[9px]">
              <span>Items Total ({totalItemsCount} units)</span>
              <span className="text-neutral-900 font-medium">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-700 font-medium uppercase tracking-wider text-[9px]">
                <span>Campaign Discount</span>
                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500 uppercase tracking-wider text-[9px]">
              <span>Consignment Shipping</span>
              <span className="text-neutral-900 font-medium">
                {order.total_amount >= 15000 ? 'FREE' : '₹500'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500 uppercase tracking-wider text-[9px] border-b border-neutral-200 pb-2">
              <span>Tax component (5% GST included)</span>
              <span className="text-neutral-900 font-medium">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-neutral-950 font-bold uppercase tracking-[0.15em] text-sm pt-2">
              <span>Grand Total</span>
              <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Printable Footer block */}
        <div className="text-center text-[8.5px] uppercase tracking-widest text-neutral-400 mt-12 pt-6 border-t border-neutral-200">
          Thank you for curating your wardrobe with FREERT &bull; support@freert.com
        </div>
      </div>
    </div>
  );
}
