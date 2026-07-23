'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user.app_metadata?.role;
        router.push(role === 'admin' || role === 'superadmin' ? '/admin' : '/');
      }
    });
  }, [router]);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showToast(error.message, 'error');
      } else if (data.user) {
        showToast('Welcome back.', 'success');
        const role = data.user.app_metadata?.role;
        router.push(role === 'admin' || role === 'superadmin' ? '/admin' : '/');
      }
    } catch (err) {
      showToast('An error occurred. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      if (error) {
        showToast(error.message || 'Google sign-in failed. Please try again.', 'error');
      }
    } catch (err: any) {
      showToast('An error occurred during Google sign-in. Please try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center py-16 md:py-24 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-soft/10 via-bg-luxury to-bg-luxury">
        <style>{`
          @keyframes slideUpCard {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        
        <div className="w-full max-w-[420px] bg-bg-luxury/50 backdrop-blur-sm border border-neutral-soft/80 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] animate-[slideUpCard_0.5s_ease-out] flex flex-col gap-6">
          
          {/* Headers */}
          <div className="text-center pb-4 border-b border-neutral-soft/30">
            <h1 className="text-xl uppercase tracking-[0.3em] font-light text-fg-luxury mb-2">Sign In</h1>
            <p className="text-[9px] text-text-muted font-light uppercase tracking-widest leading-relaxed">
              Access your bespoke customer dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial text-xs transition-all duration-300 focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                placeholder="name@domain.com"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-editorial text-xs transition-all duration-300 focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-light mt-1 text-text-muted">
              <Link href="/forgot-password" className="hover:text-fg-luxury transition-colors">
                Forgot Password?
              </Link>
              <Link href="/signup" className="hover:text-fg-luxury transition-colors">
                Create Account
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-2 cursor-pointer transition-all duration-300 hover:tracking-[0.25em]"
            >
              {loading ? 'Verifying...' : 'Sign In'} <ArrowRight size={14} />
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-neutral-soft/50"></div>
            <span className="flex-shrink mx-4 text-[8px] uppercase tracking-[0.25em] text-text-muted font-light">or</span>
            <div className="flex-grow border-t border-neutral-soft/50"></div>
          </div>

          {/* Social Sign-In */}
          <button 
            onClick={handleGoogleLogin}
            className="btn-editorial w-full flex items-center justify-center gap-2.5 text-[10px] tracking-[0.18em] py-3.5 uppercase font-medium cursor-pointer transition-colors hover:bg-neutral-soft/10"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.77-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.68-5.17 3.68-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5.01H1.31v3.1c1.97 3.92 6.03 6.66 10.69 6.66z" />
              <path fill="#FBBC05" d="M5.24 14.24a7.17 7.17 0 0 1 0-4.48V6.66H1.31a11.96 11.96 0 0 0 0 10.68l3.93-3.1z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.74 1.31 6.66l3.93 3.1c.95-2.88 3.61-5.01 6.76-5.01z" />
            </svg>
            Sign In with Google
          </button>
          
          <div className="flex justify-center items-center gap-2 text-[8px] uppercase tracking-widest text-text-muted font-light mt-1">
            <ShieldAlert size={12} className="text-accent-gold" />
            <span>Secure Encryption Parameters</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
