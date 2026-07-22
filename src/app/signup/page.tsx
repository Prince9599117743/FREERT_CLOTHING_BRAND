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
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        showToast(error.message, 'error');
      } else if (data.user) {
        showToast('Account created. Please check your email to verify.', 'success');
        router.push('/login');
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
            <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">Create Account</h1>
            <p className="text-[11px] text-text-muted font-light uppercase tracking-wider">Register your details below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Full Name</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-editorial text-xs"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial text-xs"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-editorial text-xs"
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="flex justify-end text-[10px] uppercase tracking-wider font-light mt-2">
              <Link href="/login" className="text-text-muted hover:text-fg-luxury transition-colors">
                Already registered? Sign In
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-4 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={14} />
            </button>
          </form>
          
          <div className="flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light mt-4">
            <ShieldCheck size={12} className="text-accent-gold" />
            <span>Secure SSL Encryption</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
