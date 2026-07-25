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
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-white/95 backdrop-blur-md border border-neutral-200/80 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.08)] z-[999] rounded-none animate-[slideInUp_0.5s_cubic-bezier(0.16,1,0.3,1)] select-none text-left">
      <div className="flex flex-col gap-4">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-pulse" />
            <span className="text-[9px] font-sans uppercase tracking-[0.25em] font-semibold text-neutral-800">
              Cookie Preferences
            </span>
          </div>
          <button 
            onClick={handleReject}
            className="text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors p-1"
            title="Decline all tracking"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content Statement */}
        <p className="text-[10px] text-neutral-500 leading-relaxed font-light tracking-wide">
          WE CURATE INDIVIDUALIZED EXPERIENCES. ENABLING DATA PREFERENCES ALLOWS OUR CONCIERGE TO MEASURE CATALOG PERFORMANCE AND SECURE WORKSPACE ENGAGEMENT. SELECT PREFERENCES TO PERSONALIZE YOUR WORKSPACE.
        </p>

        {/* Dynamic Buttons Panel */}
        <div className="flex items-center gap-3 mt-1.5 text-[8.5px] uppercase font-semibold tracking-[0.2em]">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 bg-transparent hover:bg-neutral-50 text-neutral-800 border border-neutral-200 py-3 cursor-pointer transition-all duration-300 rounded-none hover:border-neutral-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 py-3 cursor-pointer transition-all duration-300 rounded-none border border-neutral-900"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
