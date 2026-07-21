'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Search, User, Mail, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: string;
  address: string;
  wishlistCount: number;
  reviewsCount: number;
  blocked: boolean;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Aryan Dev', email: 'aryan@freert.net', ordersCount: 5, totalSpent: '₹1,12,500', address: 'B-4, Green Meadows, Gurgaon, Haryana 122002', wishlistCount: 14, reviewsCount: 3, blocked: false },
  { id: 'cust-2', name: 'Meera Sen', email: 'meera.sen@gmail.com', ordersCount: 3, totalSpent: '₹42,800', address: 'Apt 12, Sky Heights, Indiranagar, Bangalore 560038', wishlistCount: 5, reviewsCount: 1, blocked: false },
  { id: 'cust-3', name: 'Kabir Lal', email: 'kabir.lal@yahoo.com', ordersCount: 8, totalSpent: '₹2,34,000', address: 'House 410, Sector 15, Chandigarh 160015', wishlistCount: 22, reviewsCount: 6, blocked: false },
  { id: 'cust-4', name: 'Pooja Nair', email: 'pooja.nair@icloud.com', ordersCount: 1, totalSpent: '₹7,200', address: '12/4, Park Street, Kolkata, WB 700016', wishlistCount: 2, reviewsCount: 0, blocked: false },
  { id: 'cust-5', name: 'Rohan Shah', email: 'rohan.spammer@temp.org', ordersCount: 0, totalSpent: '₹0', address: 'N/A', wishlistCount: 0, reviewsCount: 12, blocked: true }
];

export default function CustomersManagerPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(INITIAL_CUSTOMERS[0]);

  const handleToggleBlock = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.blocked;
        showToast(nextState ? `Customer blocked from checkout ingress.` : `Customer account restored.`, nextState ? 'info' : 'success');
        
        // update selected state inline if selected
        if (selectedCustomer?.id === id) {
          setSelectedCustomer({ ...c, blocked: nextState });
        }

        return { ...c, blocked: nextState };
      }
      return c;
    }));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Customers Database</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Review customer dispatches history, address directories and block lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customers List & Search (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-bg-luxury border border-neutral-soft/80 p-6">
          <div className="relative border-b border-neutral-soft pb-2 flex items-center">
            <Search size={14} className="text-text-muted mr-2" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] focus:outline-none w-full text-fg-luxury font-light placeholder-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => (
              <div 
                key={cust.id} 
                onClick={() => setSelectedCustomer(cust)}
                className={`p-4 border text-xs cursor-pointer text-left flex justify-between items-center transition-all ${selectedCustomer?.id === cust.id ? 'border-fg-luxury bg-neutral-soft/10' : 'border-neutral-soft/60 bg-neutral-soft/5 hover:border-fg-luxury'}`}
              >
                <div>
                  <h4 className="font-semibold text-fg-luxury uppercase tracking-wider">{cust.name}</h4>
                  <span className="text-[9px] text-text-muted block mt-0.5">{cust.email}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 ${cust.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {cust.blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Customer Details Workspace (Col span 7) */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-bg-luxury border border-neutral-soft/80 p-8 flex flex-col gap-6 text-xs text-text-muted text-left">
              
              {/* Header profile info */}
              <div className="flex justify-between items-center border-b border-neutral-soft/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-neutral-soft/20 rounded-full text-fg-luxury">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-fg-luxury">{selectedCustomer.name}</h3>
                    <span className="text-[10px] text-text-muted">{selectedCustomer.id}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleToggleBlock(selectedCustomer.id)}
                  className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest py-2.5 px-6 font-semibold border transition-colors cursor-pointer ${selectedCustomer.blocked ? 'border-green-800 text-green-800 hover:bg-green-50' : 'border-red-800 text-red-800 hover:bg-red-50'}`}
                >
                  {selectedCustomer.blocked ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                  {selectedCustomer.blocked ? 'Unblock Customer' : 'Block Customer'}
                </button>
              </div>

              {/* Grid Metrics details */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-neutral-soft/20">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Email Node</span>
                  <span className="text-fg-luxury font-medium flex items-center gap-1">
                    <Mail size={12} /> {selectedCustomer.email}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1 block">Total Orders / Value</span>
                  <span className="text-fg-luxury font-semibold">
                    {selectedCustomer.ordersCount} Orders ({selectedCustomer.totalSpent})
                  </span>
                </div>
              </div>

              {/* Address details */}
              <div className="pb-6 border-b border-neutral-soft/20">
                <span className="text-[8px] uppercase tracking-wider text-text-muted mb-1.5 block">Delivery Address Directory</span>
                <p className="text-fg-luxury font-light leading-relaxed">{selectedCustomer.address}</p>
              </div>

              {/* Interaction Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-text-muted mb-2 block">Wishlist Inventory ({selectedCustomer.wishlistCount} Items)</span>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10 p-2.5 font-light">
                    {selectedCustomer.wishlistCount > 0 ? 'Customer currently holds items in active buffer' : 'Wishlist Empty'}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-text-muted mb-2 block">Reviews Contributed ({selectedCustomer.reviewsCount})</span>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted bg-neutral-soft/10 p-2.5 font-light">
                    {selectedCustomer.reviewsCount > 0 ? 'Verified Buyer rating logs submitted' : 'No reviews logs'}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-soft/5 border border-dashed border-neutral-soft/80 p-12 text-center text-xs text-text-muted uppercase tracking-widest font-light">
              Select a customer to inspect parameters
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
