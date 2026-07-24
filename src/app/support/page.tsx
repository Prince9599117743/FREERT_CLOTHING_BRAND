'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';
import { createSupportTicket } from '@/services/database';
import { Mail, Compass, HelpCircle, AlertTriangle } from 'lucide-react';

export default function SupportPage() {
  const { showToast } = useToast();
  const { getSetting } = useSettings();
  const storeEmail = getSetting('store_email', 'concierge@freert.net');
  const storePhone = getSetting('store_phone', '+91 95991 17743');
  const storeAddress = getSetting('store_address', 'Sector-7, Shibuya District, Tokyo, Japan 150-0002');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [databaseOffline, setDatabaseOffline] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDatabaseOffline(false);

    try {
      await createSupportTicket({ name, email, phone, subject, message });
      showToast(`Your message was sent successfully.`, 'success');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('DATABASE_OFFLINE') || msg.includes('connection') || msg.includes('fetch')) {
        setDatabaseOffline(true);
        showToast('Messaging system is temporarily offline. Please try again later.', 'error');
      } else {
        showToast('Something went wrong. Please check your inputs and try again.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 container-editorial py-12 md:py-20">
        <h1 className="text-3xl font-light uppercase tracking-widest text-left mb-12 text-fg-luxury">Contact Us</h1>

        {databaseOffline && (
          <div className="mb-10 p-6 border border-amber-700 bg-amber-50/20 text-left flex items-start gap-4 max-w-2xl">
            <AlertTriangle size={20} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-1">Service Under Maintenance</h4>
              <p className="text-xs font-light text-amber-700/80 leading-relaxed">
                Our messaging service is temporarily offline. Please contact us directly at {storeEmail} or try again later.
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
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-editorial"
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Email Address</label>
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
                  <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-editorial"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-editorial"
                  placeholder="Specify subject of enquiry"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Message</label>
                <textarea 
                  required 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-editorial h-28 resize-none"
                  placeholder="Detail your request or query..."
                />
              </div>
              <button 
                type="submit" 
                className="btn-editorial-solid w-full text-xs tracking-[0.25em] font-medium py-3.5 mt-2 cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* Right panel: locations & coordinates */}
          <div className="lg:col-span-5 text-left flex flex-col gap-8">
            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4 animate-[fadeIn_0.4s_ease-out]">
              <Compass size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Headquarters</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed whitespace-pre-line">
                  {storeAddress}
                </p>
              </div>
            </div>

            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4 animate-[fadeIn_0.5s_ease-out]">
              <Mail size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Contact Information</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed whitespace-pre-line">
                  {storeEmail}
                  {"\n"}{storePhone}
                </p>
              </div>
            </div>

            <div className="p-6 border border-neutral-soft/50 flex items-start gap-4">
              <HelpCircle size={18} className="text-accent-gold mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-2">Delivery Policy</h4>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  Shipping dispatches complete within 48 standard hours. Delivery is completed inside 3 to 5 business cycles.
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
