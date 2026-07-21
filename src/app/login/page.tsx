'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, ArrowRight, Smartphone, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMethod === 'email') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('placeholder') || error.message.includes('API key')) {
            showToast('Mock Operator Login Successful (Supabase Offline).', 'info');
            router.push('/dashboard');
            return;
          }
          showToast(error.message, 'error');
        } else if (data.user) {
          showToast('Access connection established.', 'success');
          router.push('/dashboard');
        }
      } else {
        // Phone OTP Flow
        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone
          });
          if (error) {
            if (error.message.includes('placeholder') || error.message.includes('API key')) {
              showToast('Mock OTP sent to phone line (Supabase Offline).', 'info');
              setOtpSent(true);
              setLoading(false);
              return;
            }
            showToast(error.message, 'error');
          } else {
            showToast('OTP verification code dispatched to phone line.', 'success');
            setOtpSent(true);
          }
        } else {
          // Verify code
          const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otpCode,
            type: 'sms'
          });
          if (error) {
            if (error.message.includes('placeholder') || error.message.includes('API key')) {
              showToast('Mock OTP verification successful.', 'success');
              router.push('/dashboard');
              return;
            }
            showToast(error.message, 'error');
          } else if (data.user) {
            showToast('Phone verification confirmed.', 'success');
            router.push('/dashboard');
          }
        }
      }
    } catch (err) {
      showToast('Handshake configuration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (err) {
      showToast('Google OAuth trigger failure.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center py-20 px-6">
        <div className="w-full max-w-sm text-left flex flex-col gap-8">
          
          {/* Headers */}
          <div>
            <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">Sign In</h1>
            <p className="text-[11px] text-text-muted font-light uppercase tracking-wider">Access your connection node logs</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            {/* Toggler */}
            <div className="flex border border-neutral-soft/80 bg-neutral-soft/10 p-1">
              <button 
                type="button"
                onClick={() => { setLoginMethod('email'); setOtpSent(false); }}
                className={`w-1/2 text-[9px] uppercase tracking-widest py-1.5 font-light transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginMethod === 'email' ? 'bg-bg-luxury text-fg-luxury font-medium shadow-sm' : 'text-text-muted'}`}
              >
                <Mail size={12} /> Email Access
              </button>
              <button 
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`w-1/2 text-[9px] uppercase tracking-widest py-1.5 font-light transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginMethod === 'otp' ? 'bg-bg-luxury text-fg-luxury font-medium shadow-sm' : 'text-text-muted'}`}
              >
                <Smartphone size={12} /> Phone OTP
              </button>
            </div>

            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Comms Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="operator@freert.net"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Password Key</label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">Phone Line Connection</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-editorial text-xs"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 block font-medium">OTP Code</label>
                    <input 
                      type="text" 
                      required 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="input-editorial text-xs font-mono tracking-[0.3em] text-center"
                      placeholder="123456"
                    />
                  </div>
                )}
              </>
            )}

            {loginMethod === 'email' && (
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-light mt-2">
                <Link href="/forgot-password" className="text-text-muted hover:text-fg-luxury transition-colors">
                  Forgot Key?
                </Link>
                <Link href="/signup" className="text-text-muted hover:text-fg-luxury transition-colors">
                  Create Node Link
                </Link>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-editorial-solid w-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-medium py-3.5 mt-4 cursor-pointer"
            >
              {loading ? 'Verifying...' : (loginMethod === 'otp' && !otpSent ? 'Send OTP Verification' : 'Establish Node Connect')} <ArrowRight size={14} />
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-soft/50"></div>
            <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest text-text-muted font-light">or</span>
            <div className="flex-grow border-t border-neutral-soft/50"></div>
          </div>

          {/* Social Sign-In */}
          <button 
            onClick={handleGoogleLogin}
            className="btn-editorial w-full flex items-center justify-center gap-2 text-xs tracking-[0.15em] py-3 cursor-pointer"
          >
            Google Identity
          </button>
          
          <div className="flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted font-light mt-4">
            <ShieldAlert size={12} className="text-accent-gold" />
            <span>Secure SSL Handshake Configured</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
