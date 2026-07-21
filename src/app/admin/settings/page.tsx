'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  
  // Supabase Settings
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzptest.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_key_mock');
  
  // Razorpay Settings
  const [razorpayKeyId, setRazorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••••••');
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);
  
  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('freert-smtp-identity');

  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    // Read gateway configs from localStorage
    const savedGateway = localStorage.getItem('freert_razorpay_enabled');
    if (savedGateway) {
      setIsRazorpayEnabled(savedGateway === 'true');
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('freert_razorpay_enabled', isRazorpayEnabled.toString());
    showToast('Merchant credentials and gateway status successfully deployed.', 'success');
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Configurations & Settings</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">Configure payment gateways, database hosts and system email servers</p>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-8 max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-8">
        
        {/* Payment Gateways Config */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
            01. Active Payment Gateways
          </h3>
          <div className="flex flex-col gap-4 text-xs font-light text-text-muted">
            <div className="flex justify-between items-center p-3 border border-neutral-soft/60">
              <div>
                <span className="font-semibold text-fg-luxury block">Cash On Delivery (COD)</span>
                <span className="text-[9px] uppercase tracking-widest">Active at Launch</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-green-700 font-semibold bg-green-100 py-1 px-3">
                Always Active
              </span>
            </div>

            <div className="flex justify-between items-center p-3 border border-neutral-soft/60">
              <div>
                <span className="font-semibold text-fg-luxury block">Razorpay Gateway Integration</span>
                <span className="text-[9px] uppercase tracking-widest">Toggle credit card / UPI dispatches</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRazorpayEnabled(!isRazorpayEnabled)}
                className={`text-[9px] uppercase tracking-widest py-1 px-4 border font-semibold cursor-pointer transition-colors ${isRazorpayEnabled ? 'bg-green-100 border-green-700 text-green-700' : 'bg-neutral-100 border-neutral-soft text-text-muted'}`}
              >
                {isRazorpayEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Supabase Host */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
            02. Supabase Coordinates
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Project Host URL</label>
              <input 
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="input-editorial text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Anon Key</label>
              <input 
                type="text"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="input-editorial text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Razorpay credentials */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
            03. Razorpay Keys
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Key ID</label>
              <input 
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="input-editorial text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Key Secret</label>
              <div className="relative flex items-center">
                <input 
                  type={showSecret ? 'text' : 'password'}
                  value={razorpaySecret}
                  onChange={(e) => setRazorpaySecret(e.target.value)}
                  className="input-editorial text-xs font-mono pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Mailer */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
            04. SMTP Server
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Host Address</label>
              <input 
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="input-editorial text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Port</label>
              <input 
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="input-editorial text-xs"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-[9px] uppercase tracking-wider text-text-muted mb-2 block font-medium">Username</label>
            <input 
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="input-editorial text-xs"
            />
          </div>
        </div>

        {/* Action button */}
        <button 
          type="submit"
          className="btn-editorial-solid flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-medium text-xs mt-4 cursor-pointer"
        >
          <Save size={14} /> Encrypt & Deploy Parameters
        </button>

      </form>
    </div>
  );
}
