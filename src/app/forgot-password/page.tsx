'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        if (error.message.includes('placeholder') || error.message.includes('API key')) {
          showToast('Mock Recovery Email Dispatched (Supabase Offline).', 'info');
          return;
        }
        showToast(error.message, 'error');
      } else {
        showToast('Password recovery payload dispatched.', 'success');
      }
    } catch (err) {
      showToast('Handshake failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center py-20 px-6">
        <div className="w-full max-w-sm text-left flex flex-col gap-8">
          
          {/* Headers */}
          <div>
            <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">Reset Key</h1>
            <p className="text-[11px] text-text-muted font-light uppercase tracking-wider">Dispatch password key recovery</p>
          </div>

          {/* Form */}
          <form onSubmit={handleReset} className="flex flex-col gap-6">
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Comms Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial text-xs"
                placeholder="operator@freert.net"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-4 cursor-pointer"
            >
              {loading ? 'Dispatching...' : 'Dispatch Reset Email'} <Send size={14} />
            </button>
          </form>

          <div className="flex justify-start text-[10px] uppercase tracking-wider font-light mt-2">
            <Link href="/login" className="text-text-muted hover:text-fg-luxury transition-colors flex items-center gap-2">
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
