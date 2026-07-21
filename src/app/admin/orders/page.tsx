'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Printer, Check, X, Truck, FileText, Calendar, DollarSign, PenTool, Edit3 } from 'lucide-react';

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

const INITIAL_ORDERS: OrderAdmin[] = [
  { 
    id: 'FR-847291', 
    customer: 'Aryan Dev', 
    email: 'aryan@dev.com', 
    address: 'Apt 12, Sector-4, Noida, UP, 201301', 
    amount: 20300, 
    date: '2026-07-20', 
    status: 'processing', 
    items: 'FR Boxy Heavyweight Oversized Tee 01 (M) x1, Sandwashed Cowl Mulberry Slip Dress 02 (S) x1', 
    notes: 'Deliver to security guard cabin if flat number locked.',
    timeline: [
      { title: 'Order Placed & Paid', time: '2026-07-20 14:32', done: true },
      { title: 'Batch Verification', time: '2026-07-20 16:00', done: true },
      { title: 'Courier Dispatch', time: '--', done: false },
      { title: 'Delivered', time: '--', done: false }
    ]
  },
  { 
    id: 'FR-712891', 
    customer: 'Meera Sen', 
    email: 'meera@sen.com', 
    address: 'Flat B3, Green View Apartments, South Delhi, Delhi, 110017', 
    amount: 8900, 
    date: '2026-07-19', 
    status: 'delivered', 
    items: 'Raw Silk Utility Trouser (M) x1', 
    notes: 'Gift pack wrap please.',
    timeline: [
      { title: 'Order Placed & Paid', time: '2026-07-19 10:15', done: true },
      { title: 'Batch Verification', time: '2026-07-19 11:30', done: true },
      { title: 'Courier Dispatch', time: '2026-07-19 15:40', done: true },
      { title: 'Delivered', time: '2026-07-21 11:20', done: true }
    ]
  },
  { 
    id: 'FR-392812', 
    customer: 'Kabir Lal', 
    email: 'kabir@lal.com', 
    address: 'House 43, Sector-7, HSR Layout, Bangalore, Karnataka, 560102', 
    amount: 14500, 
    date: '2026-07-18', 
    status: 'return_requested', 
    items: 'Bouclé French Terry Boxy Hoodie 01 (S) x1', 
    notes: 'None.',
    timeline: [
      { title: 'Order Placed & Paid', time: '2026-07-18 09:20', done: true },
      { title: 'Batch Verification', time: '2026-07-18 10:00', done: true },
      { title: 'Courier Dispatch', time: '2026-07-18 14:30', done: true },
      { title: 'Delivered', time: '2026-07-20 12:00', done: true },
      { title: 'Return Request Logged', time: '2026-07-21 15:00', done: true }
    ]
  }
];

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderAdmin[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderAdmin | null>(INITIAL_ORDERS[0]);

  // Update order status
  const handleUpdateStatus = (id: string, newStatus: OrderAdmin['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updatedTimeline = [...o.timeline];
        if (newStatus === 'shipped') {
          updatedTimeline[2] = { title: 'Courier Dispatch', time: new Date().toISOString().replace('T', ' ').substring(0, 16), done: true };
        } else if (newStatus === 'delivered') {
          updatedTimeline[3] = { title: 'Delivered', time: new Date().toISOString().replace('T', ' ').substring(0, 16), done: true };
        }
        
        const updated = { ...o, status: newStatus, timeline: updatedTimeline };
        if (selectedOrder?.id === id) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    }));
    showToast(`Order status updated to ${newStatus.toUpperCase()}.`, 'success');
  };

  // Update customer notes
  const handleUpdateNotes = (id: string, notes: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, notes };
        if (selectedOrder?.id === id) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    }));
    showToast('Customer order notes updated.', 'success');
  };

  const handlePrintInvoice = (id: string) => {
    showToast(`Generating print invoice payload for: ${id}...`, 'info');
    window.print();
  };

  const handleGeneratePackingSlip = (id: string) => {
    showToast(`Packing slip ready for dispatch drone payload.`, 'success');
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Orders Fulfillment</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Status timelines, print invoices, return approvals and parcel packing slips</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Orders list (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-bg-luxury border border-neutral-soft/80 p-6">
          <span className="text-[9px] uppercase tracking-widest text-text-muted font-semibold pb-2 border-b border-neutral-soft/30">
            Active Orders
          </span>
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((o) => (
              <div 
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`p-4 border cursor-pointer flex flex-col gap-2 transition-all text-left ${selectedOrder?.id === o.id ? 'border-fg-luxury bg-neutral-soft/10' : 'border-neutral-soft/60 bg-neutral-soft/5 hover:border-fg-luxury'}`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-fg-luxury">{o.id}</span>
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 ${
                    o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    o.status === 'return_requested' ? 'bg-red-100 text-red-800' :
                    o.status === 'returned' ? 'bg-neutral-200 text-neutral-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-muted">
                  <span>{o.customer}</span>
                  <span className="font-semibold text-fg-luxury">₹{o.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Timeline CMS (Col span 7) */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-bg-luxury border border-neutral-soft/80 p-8 flex flex-col gap-6 text-xs text-text-muted text-left">
              
              {/* Header profile info */}
              <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-fg-luxury">{selectedOrder.id}</h3>
                  <span className="text-[10px] text-text-muted">Logged: {selectedOrder.date}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePrintInvoice(selectedOrder.id)}
                    className="btn-editorial py-2 px-3 text-[9px] flex items-center gap-1.5"
                    title="Print Invoice"
                  >
                    <Printer size={12} /> Invoice
                  </button>
                  <button 
                    onClick={() => handleGeneratePackingSlip(selectedOrder.id)}
                    className="btn-editorial py-2 px-3 text-[9px] flex items-center gap-1.5"
                    title="Print Packing Slip"
                  >
                    <FileText size={12} /> Packing Slip
                  </button>
                </div>
              </div>

              {/* Order products details */}
              <div className="pb-4 border-b border-neutral-soft/20">
                <span className="text-[8px] uppercase tracking-wider text-text-muted mb-2 block">Garment Items</span>
                <p className="text-fg-luxury font-medium leading-relaxed">{selectedOrder.items}</p>
                <p className="text-fg-luxury font-semibold mt-2 text-sm">Amount Paid: ₹{selectedOrder.amount.toLocaleString('en-IN')}</p>
              </div>

              {/* Timeline Track */}
              <div className="pb-4 border-b border-neutral-soft/20 flex flex-col gap-3">
                <span className="text-[8px] uppercase tracking-wider text-text-muted block">Order Timeline Status</span>
                <div className="flex flex-col gap-3 pl-3">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-0.5 ${step.done ? 'bg-accent-gold' : 'bg-neutral-300'}`} />
                      <div>
                        <p className={`font-semibold uppercase tracking-wider ${step.done ? 'text-fg-luxury' : 'text-neutral-400'}`}>
                          {step.title}
                        </p>
                        <span className="text-[9px] text-text-muted">{step.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="pb-4 border-b border-neutral-soft/20">
                <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Address Directory</span>
                <p className="text-fg-luxury font-light">{selectedOrder.address}</p>
              </div>

              {/* Notes editor */}
              <div>
                <label className="text-[8px] uppercase tracking-wider text-text-muted mb-1.5 block">Customer Notes</label>
                <textarea 
                  rows={3}
                  defaultValue={selectedOrder.notes}
                  onBlur={(e) => handleUpdateNotes(selectedOrder.id, e.target.value)}
                  className="input-editorial h-16 resize-none leading-relaxed text-xs"
                />
              </div>

              {/* Actions controls */}
              <div className="border-t border-neutral-soft/30 pt-4 flex gap-3 flex-wrap">
                {selectedOrder.status === 'processing' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    className="btn-editorial-solid flex items-center gap-1.5 py-2 px-5 text-[9px]"
                  >
                    <Truck size={12} /> Dispatch Shipment
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    className="btn-editorial-solid flex items-center gap-1.5 py-2 px-5 text-[9px]"
                  >
                    <Check size={12} /> Confirm Delivery
                  </button>
                )}
                {selectedOrder.status === 'return_requested' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'returned')}
                      className="btn-editorial-solid flex items-center gap-1.5 py-2 px-5 text-[9px] hover:border-green-700 hover:text-green-700 bg-green-800 border-green-800"
                    >
                      <Check size={12} /> Approve Return
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className="btn-editorial flex items-center gap-1.5 py-2 px-5 text-[9px] hover:border-red-700 hover:text-red-700"
                    >
                      <X size={12} /> Reject Return
                    </button>
                  </>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-neutral-soft/5 border border-dashed border-neutral-soft/80 p-12 text-center text-xs text-text-muted uppercase tracking-widest font-light">
              Select an order to inspect parameters
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
