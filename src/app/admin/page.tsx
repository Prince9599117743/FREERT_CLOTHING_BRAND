'use client';

import React from 'react';
import { DollarSign, ClipboardList, Eye, Landmark, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const metrics = [
    { title: 'Total Sales', value: '₹14,84,300', change: '+14.2% vs last cycle', icon: <DollarSign size={15} /> },
    { title: 'Total Orders', value: '112', change: '45 Pending · 67 Delivered', icon: <ClipboardList size={15} /> },
    { title: 'Total Customers', value: '489', change: '+22.5% registration rate', icon: <Users size={15} /> },
    { title: 'Total Products', value: '66 Articles', change: '8 Low Stock warnings', icon: <Package size={15} /> }
  ];

  const lowStockItems = [
    { name: 'FR Boxy Heavyweight Oversized Tee 01', sku: 'FR-OV-1-0', stock: 3 },
    { name: 'Fluid Satin Drape Oversized Shirt 02', sku: 'FR-SH-8-1', stock: 2 },
    { name: 'Vegetable-Tanned Bridle Cardholder Wallet 01', sku: 'FR-CA-14-0', stock: 1 }
  ];

  const bestSellers = [
    { name: 'FR Boxy Heavyweight Oversized Tee', sold: '94 Units', revenue: '₹3,00,800', rate: '4.8 ★' },
    { name: 'Sandwashed Cowl Mulberry Slip Dress', sold: '72 Units', revenue: '₹9,00,000', rate: '4.9 ★' },
    { name: 'Bouclé French Terry Boxy Hoodie', sold: '54 Units', revenue: '₹3,51,000', rate: '4.7 ★' }
  ];

  const recentOrders = [
    { id: 'FR-847291', customer: 'Aryan Dev', amount: '₹20,300', date: '2026-07-20', status: 'pending' },
    { id: 'FR-712891', customer: 'Meera Sen', amount: '₹8,900', date: '2026-07-19', status: 'delivered' },
    { id: 'FR-392812', customer: 'Kabir Lal', amount: '₹14,500', date: '2026-07-18', status: 'delivered' },
    { id: 'FR-512903', customer: 'Pooja Nair', amount: '₹7,200', date: '2026-07-18', status: 'pending' }
  ];

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Analytics Dashboard</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">
          Store Performance and Inventory Control Dashboard
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-center text-text-muted">
              <span className="text-[9px] uppercase tracking-widest font-semibold">{m.title}</span>
              {m.icon}
            </div>
            <div className="mt-4">
              <span className="text-xl font-light text-fg-luxury tracking-wide">{m.value}</span>
              <span className="text-[9px] text-text-muted block font-light mt-1">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Graph & Best Sellers split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graph */}
        <div className="lg:col-span-2 bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
              Monthly Revenue Performance
            </h3>
          </div>
          
          <div className="w-full h-48 bg-neutral-soft/10 relative mt-4">
            <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c5a880" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#c5a880" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 160 Q 116 110 233 130 T 466 70 T 700 30 L 700 200 L 0 200 Z" 
                fill="url(#chartGrad)"
              />
              <path 
                d="M 0 160 Q 116 110 233 130 T 466 70 T 700 30" 
                fill="none" 
                stroke="#c5a880" 
                strokeWidth="2.5" 
              />
              <circle cx="233" cy="130" r="4" fill="#111111" />
              <circle cx="466" cy="70" r="4" fill="#111111" />
              <circle cx="700" cy="30" r="4" fill="#111111" />
            </svg>
            <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-[8px] uppercase tracking-widest text-text-muted">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul (Current)</span>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
              Best Sellers
            </h3>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {bestSellers.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-soft/10 pb-3 last:border-b-0 last:pb-0 font-light text-text-muted">
                <div className="text-left max-w-[65%]">
                  <p className="font-medium text-fg-luxury truncate">{item.name}</p>
                  <span className="text-[8px] uppercase tracking-wider">{item.sold} sold · {item.rate}</span>
                </div>
                <span className="font-semibold text-fg-luxury">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders & Low Stock split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6">
          <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
            Recent Orders
          </h3>
          <div className="flex flex-col gap-4">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between items-center text-xs border-b border-neutral-soft/10 pb-3 last:border-b-0 last:pb-0 font-light text-text-muted">
                <div>
                  <span className="font-medium text-fg-luxury mr-3">{o.id}</span>
                  <span>{o.customer}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span>{o.date}</span>
                  <span className="font-semibold text-fg-luxury">{o.amount}</span>
                  <span className={`text-[8px] uppercase tracking-widest px-2.5 py-0.5 font-light ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Warns */}
        <div className="bg-bg-luxury border border-neutral-soft/80 p-6">
          <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-2 mb-6">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury">
              Low Stock Warnings
            </h3>
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <div className="flex flex-col gap-4">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-soft/10 pb-3 last:border-b-0 last:pb-0 font-light text-text-muted">
                <div className="text-left">
                  <p className="font-medium text-fg-luxury">{item.name}</p>
                  <span className="text-[8px] uppercase tracking-wider">SKU: {item.sku}</span>
                </div>
                <span className="font-semibold text-red-600 bg-red-50 py-0.5 px-2.5 text-[9px]">{item.stock} left</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
