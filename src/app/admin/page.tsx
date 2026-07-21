'use client';

import React from 'react';
import { DollarSign, ClipboardList, Eye, Landmark } from 'lucide-react';

export default function AdminDashboardPage() {
  const metrics = [
    { title: 'Gross Revenue', value: '₹14,84,300', change: '+14.2% vs last cycle', icon: <DollarSign size={16} /> },
    { title: 'Registered Orders', value: '112', change: '+22.5% vs last cycle', icon: <ClipboardList size={16} /> },
    { title: 'Listing Traffic', value: '14,230', change: '+8.1% vs last cycle', icon: <Eye size={16} /> },
    { title: 'Conversion Rate', value: '3.1%', change: '+0.4% vs last cycle', icon: <Landmark size={16} /> }
  ];

  const recentOrders = [
    { id: 'FR-847291', customer: 'Aryan Dev', amount: '₹20,300', date: '2026-07-20', status: 'processing' },
    { id: 'FR-712891', customer: 'Meera Sen', amount: '₹8,900', date: '2026-07-19', status: 'delivered' },
    { id: 'FR-392812', customer: 'Kabir Lal', amount: '₹14,500', date: '2026-07-18', status: 'delivered' }
  ];

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Dashboard Operations</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Platform Analytics and Sales Volumes</p>
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
              <span className="text-[9px] text-green-700 block font-light mt-1">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Visualizer */}
      <div className="bg-bg-luxury border border-neutral-soft/80 p-6">
        <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
          Revenue Chart Wave (Last 7 Cycles)
        </h3>
        
        {/* SVG Minimal Line Graph */}
        <div className="w-full h-48 bg-neutral-soft/10 relative">
          <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c5a880" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#c5a880" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path 
              d="M 0 160 Q 116 110 233 130 T 466 70 T 700 30 L 700 200 L 0 200 Z" 
              fill="url(#chartGrad)"
            />
            {/* Smooth Line */}
            <path 
              d="M 0 160 Q 116 110 233 130 T 466 70 T 700 30" 
              fill="none" 
              stroke="#c5a880" 
              strokeWidth="2.5" 
            />
            {/* Data Points */}
            <circle cx="233" cy="130" r="4.5" fill="#111111" />
            <circle cx="466" cy="70" r="4.5" fill="#111111" />
            <circle cx="700" cy="30" r="4.5" fill="#111111" />
          </svg>

          {/* Grid lines */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[9px] uppercase tracking-wider text-text-muted mt-2">
            <span>Cycle 1</span>
            <span>Cycle 2</span>
            <span>Cycle 3</span>
            <span>Cycle 4</span>
            <span>Cycle 5</span>
            <span>Cycle 6</span>
            <span>Current</span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="bg-bg-luxury border border-neutral-soft/80 p-6">
        <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
          Recent Logged Ingress
        </h3>

        <div className="flex flex-col gap-4">
          {recentOrders.map((o) => (
            <div key={o.id} className="flex justify-between items-center text-xs border-b border-neutral-soft/20 pb-3 last:border-b-0 last:pb-0 font-light text-text-muted">
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

    </div>
  );
}
