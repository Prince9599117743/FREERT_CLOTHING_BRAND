'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-VPREWNQ88F';

const loadGoogleAnalytics = (gaId: string) => {
  if (typeof window === 'undefined') return;
  if (document.getElementById('google-analytics-script')) return;

  try {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script1.id = 'google-analytics-script';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.id = 'google-analytics-init';
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
    console.log(`[Analytics] Google Analytics ${gaId} initialized.`);
  } catch (err) {
    console.error('[Analytics] Failed to inject GA scripts:', err);
  }
};

export function CookieConsent() {
  const [consentState, setConsentState] = useState<'pending' | 'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    const storedChoice = localStorage.getItem('freert_cookie_consent');
    if (storedChoice === 'accepted') {
      setConsentState('accepted');
      loadGoogleAnalytics(GA_MEASUREMENT_ID);
    } else if (storedChoice === 'rejected') {
      setConsentState('rejected');
      // Disable GA tracking
      (window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    } else {
      setConsentState('pending');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('freert_cookie_consent', 'accepted');
    setConsentState('accepted');
    loadGoogleAnalytics(GA_MEASUREMENT_ID);
  };

  const handleReject = () => {
    localStorage.setItem('freert_cookie_consent', 'rejected');
    setConsentState('rejected');
    // Disable GA tracking
    (window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  };

  if (consentState !== 'pending') return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-[#FFFCF8] border border-neutral-soft/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] z-[999] rounded-[20px] animate-[slideInUp_0.5s_cubic-bezier(0.16,1,0.3,1)] select-none text-left">
      <div className="flex flex-col gap-4">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-neutral-soft/20 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent-gold" />
            <span className="text-[10px] font-editorial uppercase tracking-[0.2em] font-semibold text-fg-luxury">
              Cookie Preferences
            </span>
          </div>
          <button 
            onClick={handleReject}
            className="text-stone-400 hover:text-fg-luxury cursor-pointer transition-colors p-1"
            title="Reject all tracking"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content Statement */}
        <p className="text-[10px] text-text-muted leading-relaxed font-light uppercase tracking-wider">
          We curate customizable styling coordinates. Enabling standard analytics tags assists our design house in optimizing catalog presentation. Review cookie choices to personalize your wardrobe workspace.
        </p>

        {/* Dynamic Buttons Panel */}
        <div className="flex items-center gap-3 mt-1.5 text-[8.5px] uppercase font-semibold tracking-[0.15em]">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 bg-transparent hover:bg-neutral-soft/20 text-fg-luxury border border-neutral-soft/60 py-2.5 cursor-pointer transition-colors rounded-[8px]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 bg-fg-luxury text-bg-luxury hover:bg-neutral-800 py-2.5 cursor-pointer transition-colors rounded-[8px]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
