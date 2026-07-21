'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Save, Eye, EyeOff, Palette, Shield, Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'brand' | 'credentials'>('brand');

  // Brand Settings State
  const [brandName, setBrandName] = useState('FREERT');
  const [logoPath, setLogoPath] = useState('/assets/brand_logo.png');
  const [faviconPath, setFaviconPath] = useState('/favicon.ico');
  const [primaryColor, setPrimaryColor] = useState('#faf9f6');
  const [secondaryColor, setSecondaryColor] = useState('#111111');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/freert');
  const [pinterestLink, setPinterestLink] = useState('https://pinterest.com/freert');
  const [supportEmail, setSupportEmail] = useState('concierge@freert.net');
  const [hotline, setHotline] = useState('+91 95991 17743');
  const [footerContent, setFooterContent] = useState('FREERT Clothing House. All Rights Reserved.');
  const [announcementBar, setAnnouncementBar] = useState('Complimentary drone delivery on orders above ₹15,000');
  const [seoTitle, setSeoTitle] = useState('FREERT | Minimalist Luxury Garments');
  const [seoDesc, setSeoDesc] = useState('A global luxury clothing label designing minimalist structures and organic linens in small batches.');

  // Supabase Settings State
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzptest.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_key_mock');
  
  // Razorpay Settings State
  const [razorpayKeyId, setRazorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••••••');
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);
  
  // SMTP Settings State
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('freert-smtp-identity');

  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    // Load Brand parameters from local storage if saved
    const savedBrand = localStorage.getItem('freert_brand_settings');
    if (savedBrand) {
      try {
        const parsed = JSON.parse(savedBrand);
        setBrandName(parsed.brandName || 'FREERT');
        setLogoPath(parsed.logoPath || '/assets/brand_logo.png');
        setPrimaryColor(parsed.primaryColor || '#faf9f6');
        setSecondaryColor(parsed.secondaryColor || '#111111');
        setInstagramLink(parsed.instagramLink || '');
        setSupportEmail(parsed.supportEmail || '');
        setAnnouncementBar(parsed.announcementBar || '');
      } catch (e) {
        // ignore fallback
      }
    }

    const savedGateway = localStorage.getItem('freert_razorpay_enabled');
    if (savedGateway) {
      setIsRazorpayEnabled(savedGateway === 'true');
    }
  }, []);

  const handleSaveBrandSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsObj = {
      brandName,
      logoPath,
      faviconPath,
      primaryColor,
      secondaryColor,
      fontFamily,
      instagramLink,
      pinterestLink,
      supportEmail,
      hotline,
      footerContent,
      announcementBar,
      seoTitle,
      seoDesc
    };
    localStorage.setItem('freert_brand_settings', JSON.stringify(settingsObj));
    showToast('Brand Visuals and announcement configurations successfully deployed.', 'success');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('freert_razorpay_enabled', isRazorpayEnabled.toString());
    showToast('Merchant API credentials and gateway parameters successfully deployed.', 'success');
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      <div>
        <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury">Global Store Settings</h1>
        <p className="text-[11px] text-text-muted font-light uppercase tracking-wider mt-1">
          Configure branding visuals, active gateways, coordinates and SEO defaults
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-4 border-b border-neutral-soft/60 pb-3">
        <button
          onClick={() => setActiveTab('brand')}
          className={`text-[10px] uppercase tracking-widest py-1.5 px-4 cursor-pointer font-medium border-b-2 transition-all ${activeTab === 'brand' ? 'border-accent-gold text-fg-luxury' : 'border-transparent text-text-muted hover:text-fg-luxury'}`}
        >
          Brand Settings
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`text-[10px] uppercase tracking-widest py-1.5 px-4 cursor-pointer font-medium border-b-2 transition-all ${activeTab === 'credentials' ? 'border-accent-gold text-fg-luxury' : 'border-transparent text-text-muted hover:text-fg-luxury'}`}
        >
          Gateway & Credentials
        </button>
      </div>

      {/* TAB 1: Brand Settings */}
      {activeTab === 'brand' && (
        <form onSubmit={handleSaveBrandSettings} className="flex flex-col gap-8 max-w-4xl bg-bg-luxury border border-neutral-soft/80 p-8 text-xs text-text-muted">
          <div className="border-b border-neutral-soft/30 pb-2">
            <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury">
              Branding & Design System
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Brand Name</label>
              <input 
                type="text" 
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="input-editorial text-xs" 
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Logo Image Path</label>
              <input 
                type="text" 
                value={logoPath}
                onChange={(e) => setLogoPath(e.target.value)}
                className="input-editorial text-xs" 
                required
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Favicon Path</label>
              <input 
                type="text" 
                value={faviconPath}
                onChange={(e) => setFaviconPath(e.target.value)}
                className="input-editorial text-xs" 
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Primary Color</label>
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input-editorial text-xs font-mono" 
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Secondary Color</label>
                <input 
                  type="text" 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="input-editorial text-xs font-mono" 
                  required
                />
              </div>
            </div>
          </div>

          {/* Social and Contact details */}
          <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury">
              Social Links & Customer Comms
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Instagram Profile Link</label>
                <input 
                  type="text" 
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  className="input-editorial text-xs" 
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Pinterest Profile Link</label>
                <input 
                  type="text" 
                  value={pinterestLink}
                  onChange={(e) => setPinterestLink(e.target.value)}
                  className="input-editorial text-xs" 
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Support Email</label>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Customer Hotline</label>
                <input 
                  type="text" 
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar & SEO */}
          <div className="border-t border-neutral-soft/30 pt-6 flex flex-col gap-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury">
              Announcement & SEO Defaults
            </h3>
            
            <div>
              <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Announcement Ribbon Message</label>
              <input 
                type="text" 
                value={announcementBar}
                onChange={(e) => setAnnouncementBar(e.target.value)}
                className="input-editorial text-xs" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Default Page Title Template</label>
                <input 
                  type="text" 
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-text-muted mb-1 block">Default Meta Description</label>
                <input 
                  type="text" 
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="input-editorial text-xs" 
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="btn-editorial-solid flex items-center justify-center gap-2 py-3.5 tracking-[0.2em] font-medium text-xs mt-4 cursor-pointer"
          >
            <Save size={14} /> Deploy Brand settings
          </button>
        </form>
      )}

      {/* TAB 2: merchant credentials */}
      {activeTab === 'credentials' && (
        <form onSubmit={handleSaveCredentials} className="flex flex-col gap-8 max-w-2xl bg-bg-luxury border border-neutral-soft/80 p-8 text-xs text-text-muted">
          {/* Payment Gateways Config */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
              01. Payment Gateways
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
                  <span className="text-[9px] uppercase tracking-widest">Toggle credit card / UPI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRazorpayEnabled(!isRazorpayEnabled)}
                  className={`text-[9px] uppercase tracking-widest py-1.5 px-4 border font-semibold cursor-pointer transition-colors ${isRazorpayEnabled ? 'bg-green-100 border-green-700 text-green-700' : 'bg-neutral-100 border-neutral-soft text-text-muted'}`}
                >
                  {isRazorpayEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Supabase Host */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-4 border-b border-neutral-soft/30 pb-2">
              02. Supabase Settings
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
              03. Razorpay Credentials
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
              04. SMTP Settings
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
            <Save size={14} /> Deploy Credentials
          </button>
        </form>
      )}

    </div>
  );
}
