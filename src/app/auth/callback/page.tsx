'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;
    let subscription: any = null;

    const handleCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (error || errorDescription) {
        const message = errorDescription || error || 'Authentication failed.';
        window.location.href = `/login?error=${encodeURIComponent(message)}`;
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;

          if (data?.session && active) {
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
            window.location.href = '/';
            return;
          }
        } catch (err) {
          console.error('OAuth code exchange failed:', err);
        }
      }
      
      // Implicit flow: Check if session is already parsed
      const { data: { session } } = await supabase.auth.getSession();
      if (session && active) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        window.location.href = '/';
        return;
      }

      // Listen for auth state changes (implicit flow async parsing)
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && active) {
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
          if (subscription) subscription.unsubscribe();
          window.location.href = '/';
        }
      });
      subscription = data.subscription;

      // Safety timeout fallback
      const timeout = setTimeout(() => {
        if (active) {
          if (subscription) subscription.unsubscribe();
          window.location.href = '/login';
        }
      }, 3500);

      return () => {
        clearTimeout(timeout);
        if (subscription) subscription.unsubscribe();
      };
    };

    handleCallback();

    return () => {
      active = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs tracking-widest uppercase font-light text-neutral-400">Authenticating session...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-xs tracking-widest uppercase font-light text-neutral-400">Loading callback...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
