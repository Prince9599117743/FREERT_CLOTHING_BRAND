'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      if (code) {
        try {
          // Exchange PKCE authorization code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          if (data?.session) {
            // Write access token to cookie immediately to prevent middleware redirection bails
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
            window.location.href = '/';
            return;
          }
        } catch (err) {
          console.error('OAuth code exchange failed:', err);
        }
      }
      
      // Fallback redirection on check fail
      window.location.href = '/login';
    };

    handleCallback();
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
