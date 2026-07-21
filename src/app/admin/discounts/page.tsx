'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Tag, Plus, Trash2, Calendar, AlertCircle, Percent, Gift } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  minValue: number;
  maxDiscount?: number;
  enabled: boolean;
}

const INITIAL_COUPONS: Coupon[] = [
  { id: 'c-1', code: 'FREERT20', type: 'percentage', value: 20, expiryDate: '2026-12-31', usageLimit: 500, usedCount: 142, minValue: 5000, maxDiscount: 2000, enabled: true },
  { id: 'c-2', code: 'DRONEFREE', type: 'shipping', value: 0, expiryDate: '2026-08-31', usageLimit: 1000, usedCount: 89, minValue: 15000, enabled: true },
  { id: 'c-3', code: 'LUXE1000', type: 'fixed', value: 1000, expiryDate: '2026-10-15', usageLimit: 100, usedCount: 12, minValue: 8000, enabled: true }
];

export default function DiscountsManagerPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  
  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed' | 'shipping'>('percentage');
  const [value, setValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState('100');
  const [minValue, setMinValue] = useState('2000');
  const [maxDiscount, setMaxDiscount] = useState('');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    const newCoupon: Coupon = {
      id: `c-${Math.random().toString(36).substring(2, 9)}`,
      code: code.toUpperCase().replace(/ /g, ''),
      type,
      value: type === 'shipping' ? 0 : parseFloat(value) || 0,
      expiryDate,
      usageLimit: parseInt(usageLimit) || 100,
      usedCount: 0,
      minValue: parseFloat(minValue) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      enabled: true
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setCode('');
    setValue('');
    setMaxDiscount('');
    showToast(`Coupon coupon code ${newCoupon.code} published live.`, 'success');
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast(`Deleted coupon code: ${code}`, 'info');
  };

  const handleToggleEnable = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Coupon Discounts CMS</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Configure coupons, percentage offsets and usage parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Create Coupon (Col span 4) */}
        <form onSubmit={handleCreateCoupon} className="lg:col-span-4 flex flex-col gap-6 bg-bg-luxury border border-neutral-soft/80 p-6 text-xs">
          <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Publish New Coupon
          </h3>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Coupon Code</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-editorial text-xs font-semibold"
              placeholder="e.g. AUTUMN50"
              required
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block">Discount Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-bg-luxury border border-neutral-soft/80 py-2 px-3 text-[11px] focus:outline-none uppercase tracking-wider"
            >
              <option value="percentage">Percentage Offset (%)</option>
              <option value="fixed">Fixed Deduction (INR)</option>
              <option value="shipping">Free Drone Shipping</option>
            </select>
          </div>

          {type !== 'shipping' && (
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Discount Value</label>
              <input 
                type="number" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input-editorial text-xs"
                placeholder={type === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Min Order Value</label>
              <input 
                type="number" 
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="input-editorial text-xs"
                placeholder="e.g. 3000"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Usage Limit</label>
              <input 
                type="number" 
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="input-editorial text-xs"
                placeholder="e.g. 200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Expiry Date</label>
              <input 
                type="date" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-editorial text-xs"
                required
              />
            </div>
            {type === 'percentage' && (
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Max Discount Value</label>
                <input 
                  type="number" 
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="input-editorial text-xs"
                  placeholder="e.g. 1500"
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn-editorial-solid text-[9px] tracking-widest py-3 mt-2">Publish Coupon</button>
        </form>

        {/* Right Column: List Coupons (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-fg-luxury pb-2 border-b border-neutral-soft/30">
            Active Coupon Rules
          </h3>

          <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-soft text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10">
                  <th className="p-4 font-semibold">Code / Type</th>
                  <th className="p-4 font-semibold">Value Details</th>
                  <th className="p-4 font-semibold">Usage Logs</th>
                  <th className="p-4 font-semibold">Expiry Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-soft/30 font-light text-text-muted">
                {coupons.map((c) => (
                  <tr key={c.id} className={c.enabled ? '' : 'opacity-50'}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {c.type === 'percentage' ? <Percent size={13} className="text-accent-gold" /> : <Gift size={13} className="text-accent-gold" />}
                        <div>
                          <span className="font-semibold text-fg-luxury block">{c.code}</span>
                          <span className="text-[8px] uppercase tracking-widest block">{c.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-fg-luxury">
                        {c.type === 'shipping' ? 'FREE DRONE' : (c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`)}
                      </span>
                      <span className="text-[8px] block uppercase tracking-widest mt-0.5">Min: ₹{c.minValue.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-fg-luxury">{c.usedCount} / {c.usageLimit}</span>
                      <span className="text-[8px] block uppercase tracking-widest mt-0.5">redemptions</span>
                    </td>
                    <td className="p-4 flex items-center gap-1 mt-2.5">
                      <Calendar size={11} /> {c.expiryDate}
                    </td>
                    <td className="p-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={c.enabled}
                          onChange={() => handleToggleEnable(c.id)}
                          className="accent-fg-luxury"
                        />
                        <span className="text-[9px] uppercase tracking-wider">{c.enabled ? 'Active' : 'Disabled'}</span>
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
