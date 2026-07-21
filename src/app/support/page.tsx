'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useToast } from '@/contexts/ToastContext';
import { createSupportTicket } from '@/services/database';
import { Mail, Compass, HelpCircle, AlertTriangle } from 'lucide-react';

export default function SupportPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [databaseOffline, setDatabaseOffline] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDatabaseOffline(false);

    try {
      await createSupportTicket({ name, email, message });
      showToast(`Comms payload logged successfully for ${name}.`, 'success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      if (err.message === 'DATABASE_OFFLINE') {
        setDatabaseOffline(true);
        showToast('Database coordinates are offline.', 'error');
      } else {
        showToast(err.message || 'Support submission failed.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        <h1 className="text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">Support Center</h1>

        {databaseOffline && (
          <div className="mb-10 p-6 border border-red-700 bg-red-50 text-left flex items-start gap-4 max-w-2xl">
            <AlertTriangle size={20} className="text-red-700 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-red-700 mb-1">Operations Node Offline</h4>
              <p className="text-xs font-light text-red-700/80 leading-relaxed">
                The database credentials are unconfigured. To submit support ticket payloads, please check your `.env.local` Supabase parameters setup.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left panel: enquiry form */}
          <div className="lg:col-span-7 bg-neutral-soft/10 p-8 border border-neutral-soft/50 text-left">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
              Submit Enquiry
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Name Identifier</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-editorial"
                  placeholder="Operator 01"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Comms Address (Email)</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-editorial"
                  placeholder="name@domain.com"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Enquiry Message Payload</label>
                <textarea 
                  required 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-editorial h-28 resize-none"
                  placeholder="Detail delivery node updates or catalog questions..."
                />
              </div>
              <button 
                type="submit" 
                className="btn-editorial-solid w-full text-xs tracking-[0.25em] font-medium py-3.5 mt-2 cursor-pointer"
              >
                Dispatch Comms Payload
              </button>
            </form>
          </div>

          {/* Right panel: locations & coordinates */}
          <div className="lg:col-span-5 text-left flex flex-col gap-8">
            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4">
              <Compass size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Comms HQ Station</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  Sector-7, Shibuya District,<br />Tokyo, Japan 150-0002
                </p>
              </div>
            </div>

            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4">
              <Mail size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Satellite Frequencies</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  comms@freert.net<br />+91 94412 81177
                </p>
              </div>
            </div>

            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4">
              <HelpCircle size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Logistics Guidelines</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  Shipping drone dispatches complete within 48 standard hours. Delivery loops are completed inside 5 business cycles.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
