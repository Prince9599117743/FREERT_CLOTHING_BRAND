'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      showToast(decodeURIComponent(errorParam), 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user.app_metadata?.role;
        router.push(role === 'admin' || role === 'superadmin' ? '/admin' : '/');
      }
    });
  }, [router, showToast]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        showToast('Customer already exists. Please sign in.', 'error');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone // Write in user metadata only to bypass strict E.164 phone formats
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
          showToast('Customer already exists. Please sign in.', 'error');
        } else {
          showToast(error.message, 'error');
        }
      } else if (data.user) {
        showToast('Account created successfully. Please check your email to verify.', 'success');
        router.push('/login');
      }
    } catch (err) {
      showToast('An error occurred. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
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
            <h1 className="text-xl uppercase tracking-[0.3em] font-light text-fg-luxury mb-2">Create Account</h1>
            <p className="text-[9px] text-text-muted font-light uppercase tracking-widest leading-relaxed">
              Register your details for bespoke services
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Full Name</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-editorial text-xs transition-all duration-300 focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                placeholder="First Last"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Phone Number (Optional)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-editorial text-xs transition-all duration-300 focus:border-fg-luxury focus:ring-1 focus:ring-fg-luxury"
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            
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
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="flex justify-end text-[9px] uppercase tracking-widest font-light mt-1 text-text-muted">
              <Link href="/login" className="hover:text-fg-luxury transition-colors">
                Already registered? Sign In
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-2 cursor-pointer transition-all duration-300 hover:tracking-[0.25em]"
            >
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={14} />
            </button>
          </form>
          
          <div className="flex justify-center items-center gap-2 text-[8px] uppercase tracking-widest text-text-muted font-light mt-1">
            <ShieldCheck size={12} className="text-accent-gold" />
            <span>Secure Encryption Parameters</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
