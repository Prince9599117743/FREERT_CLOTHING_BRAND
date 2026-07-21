'use client';

import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '@/services/mockData';
import { useToast } from '@/contexts/ToastContext';
import { Upload, Plus, Edit, AlertCircle, Save } from 'lucide-react';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [editingPrice, setEditingPrice] = useState<{ [id: string]: number }>({});
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});

  const handlePriceChange = (id: string, val: string) => {
    setEditingPrice(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const handleStockChange = (id: string, val: string) => {
    setEditingStock(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
  };

  const handleSaveProduct = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updatedPrice = editingPrice[id] !== undefined ? editingPrice[id] : p.basePrice;
        const updatedVariants = p.variants ? p.variants.map(v => ({
          ...v,
          stockQty: editingStock[id] !== undefined ? editingStock[id] : v.stockQty
        })) : [];
        return { ...p, basePrice: updatedPrice, variants: updatedVariants };
      }
      return p;
    }));

    showToast(`Garment parameters updated for ID: ${id}.`, 'success');
  };

  // Simulated CSV Import handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Parsing CSV inventory payload...', 'info');
      // Simulate mapping after a small timeout
      setTimeout(() => {
        showToast('Successfully merged 4 inventory listings.', 'success');
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-soft/40 pb-4">
        <div>
          <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Inventory Nodes</h1>
          <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Bulk edits and listings configurations</p>
        </div>

        {/* CSV Import */}
        <label className="btn-editorial flex items-center gap-2 py-2 px-5 cursor-pointer self-start">
          <Upload size={14} /> Import CSV
          <input 
            type="file" 
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Catalog Table */}
      <div className="bg-bg-luxury border border-neutral-soft/80 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-soft text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10">
              <th className="p-4 font-semibold">Garment details</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price (INR)</th>
              <th className="p-4 font-semibold">Stock Qty</th>
              <th className="p-4 font-semibold text-right">Commit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-soft/30 font-light text-text-muted">
            {products.map(p => {
              const totalStock = p.variants ? p.variants.reduce((sum, v) => sum + v.stockQty, 0) : 0;
              const isLowStock = totalStock < 25;
              
              return (
                <tr key={p.id} className="hover:bg-neutral-soft/5">
                  <td className="p-4 flex items-center gap-3">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-10 aspect-[3/4] object-cover bg-neutral-soft/20 flex-shrink-0"
                    />
                    <div>
                      <span className="block font-medium text-fg-luxury text-xs">{p.name}</span>
                      <span className="text-[9px] block uppercase tracking-widest mt-0.5">{p.id}</span>
                    </div>
                  </td>
                  <td className="p-4 uppercase tracking-wider text-[10px]">{p.category?.name || 'Garment'}</td>
                  <td className="p-4">
                    <input 
                      type="number"
                      defaultValue={p.basePrice}
                      onChange={(e) => handlePriceChange(p.id, e.target.value)}
                      className="w-20 bg-transparent border-b border-neutral-soft/50 py-1 focus:border-fg-luxury focus:outline-none text-fg-luxury font-medium"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        defaultValue={totalStock}
                        onChange={(e) => handleStockChange(p.id, e.target.value)}
                        className="w-16 bg-transparent border-b border-neutral-soft/50 py-1 focus:border-fg-luxury focus:outline-none text-fg-luxury"
                      />
                      {isLowStock && (
                        <span className="text-[8px] uppercase tracking-widest bg-amber-100 text-amber-800 py-0.5 px-2 font-medium flex items-center gap-1">
                          <AlertCircle size={10} /> Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleSaveProduct(p.id)}
                      className="text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                      aria-label="Save parameters"
                    >
                      <Save size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
