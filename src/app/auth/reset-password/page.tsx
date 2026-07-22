'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase injects the session from the magic link on load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in password recovery session
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Password updated successfully. Please sign in.', 'success');
        router.push('/login');
      }
    } catch (err) {
      showToast('Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center py-20 px-6">
        <div className="w-full max-w-sm text-left flex flex-col gap-8">
          <div>
            <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">New Password</h1>
            <p className="text-[11px] text-text-muted font-light uppercase tracking-wider">Choose a secure password for your account</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-editorial text-xs"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-editorial text-xs"
                placeholder="Repeat your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-4 cursor-pointer"
            >
              {loading ? 'Updating...' : 'Set New Password'} <ArrowRight size={14} />
            </button>
          </form>
          <div className="flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light mt-4">
            <Lock size={12} className="text-accent-gold" />
            <span>Secure SSL Encryption</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
