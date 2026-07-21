'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Printer, Check, X, Truck } from 'lucide-react';

interface OrderAdmin {
  id: string;
  customer: string;
  email: string;
  address: string;
  amount: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'returned' | 'return_requested';
  items: string;
}

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState<OrderAdmin[]>([
    { id: 'FR-847291', customer: 'Aryan Dev', email: 'aryan@dev.com', address: 'Apt 12, Sector-4, Noida, UP, 201301', amount: 20300, date: '2026-07-20', status: 'processing', items: 'Linen Trench Coat (L) x1, Structured Kimono Shirt (M) x1' },
    { id: 'FR-712891', customer: 'Meera Sen', email: 'meera@sen.com', address: 'Flat B3, Green View Apartments, South Delhi, Delhi, 110017', amount: 8900, date: '2026-07-19', status: 'delivered', items: 'Raw Silk Utility Trouser (M) x1' },
    { id: 'FR-392812', customer: 'Kabir Lal', email: 'kabir@lal.com', address: 'House 43, Sector-7, HSR Layout, Bangalore, Karnataka, 560102', amount: 14500, date: '2026-07-18', status: 'return_requested', items: 'Linen Trench Coat (S) x1' }
  ]);

  const handleUpdateStatus = (id: string, newStatus: OrderAdmin['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Order status updated to ${newStatus.toUpperCase()}.`, 'success');
  };

  const handlePrintInvoice = (id: string) => {
    showToast(`Generating print invoice parameters for ${id}...`, 'info');
    // Open a simple window print dialog mockup
    window.print();
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Order Database</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Status changes, return requests and transactions invoice printing</p>
      </div>

      {/* Orders Grid cards */}
      <div className="flex flex-col gap-6">
        {orders.map((o) => (
          <div key={o.id} className="border border-neutral-soft/80 bg-bg-luxury p-6 flex flex-col gap-4">
            
            {/* Header section */}
            <div className="flex justify-between items-start border-b border-neutral-soft/30 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-fg-luxury mr-3">{o.id}</span>
                <span className="text-[10px] text-text-muted font-light">Logged: {o.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-light ${
                  o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  o.status === 'return_requested' ? 'bg-red-100 text-red-800' :
                  o.status === 'returned' ? 'bg-neutral-200 text-neutral-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {o.status.replace('_', ' ')}
                </span>
                <button 
                  onClick={() => handlePrintInvoice(o.id)}
                  className="p-1 border border-neutral-soft hover:border-fg-luxury hover:text-fg-luxury transition-colors text-text-muted cursor-pointer"
                  title="Print Invoice"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* Info details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-light text-text-muted leading-relaxed">
              <div>
                <h4 className="text-[9px] uppercase tracking-widest font-semibold text-fg-luxury mb-1">Customer</h4>
                <p>{o.customer}</p>
                <p className="text-[10px]">{o.email}</p>
              </div>
              <div>
                <h4 className="text-[9px] uppercase tracking-widest font-semibold text-fg-luxury mb-1">Address Node</h4>
                <p className="max-w-xs">{o.address}</p>
              </div>
              <div>
                <h4 className="text-[9px] uppercase tracking-widest font-semibold text-fg-luxury mb-1">Garments</h4>
                <p>{o.items}</p>
                <p className="font-semibold text-fg-luxury mt-2">Paid: ₹{o.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-neutral-soft/30 pt-4 flex gap-3 flex-wrap">
              {o.status === 'processing' && (
                <button 
                  onClick={() => handleUpdateStatus(o.id, 'shipped')}
                  className="btn-editorial flex items-center gap-1.5 py-1.5 px-4 text-[9px]"
                >
                  <Truck size={12} /> Dispatch Shipment
                </button>
              )}
              {o.status === 'shipped' && (
                <button 
                  onClick={() => handleUpdateStatus(o.id, 'delivered')}
                  className="btn-editorial flex items-center gap-1.5 py-1.5 px-4 text-[9px]"
                >
                  <Check size={12} /> Confirm Delivery
                </button>
              )}
              {o.status === 'return_requested' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(o.id, 'returned')}
                    className="btn-editorial flex items-center gap-1.5 py-1.5 px-4 text-[9px] hover:border-green-700 hover:text-green-700"
                  >
                    <Check size={12} /> Approve Return
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(o.id, 'delivered')}
                    className="btn-editorial flex items-center gap-1.5 py-1.5 px-4 text-[9px] hover:border-red-700 hover:text-red-700"
                  >
                    <X size={12} /> Reject Return
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
