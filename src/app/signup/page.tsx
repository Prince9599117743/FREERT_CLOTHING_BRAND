'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ArrowRight, RotateCcw, CheckCircle2, Eye, EyeOff } from 'lucide-react';

type Step = 'details' | 'otp' | 'success';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Step 1 — Details
  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 — OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user.app_metadata?.role;
        router.push(role === 'admin' || role === 'superadmin' ? '/admin' : '/');
      }
    });
  }, [router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step !== 'otp') return;
    setResendCountdown(30);
    setCanResend(false);
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Step 1: Submit details, send OTP
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existingUser) {
        showToast('An account already exists with this email. Please sign in.', 'error');
        setLoading(false);
        return;
      }

      // Send OTP via Brevo
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), name: fullName, purpose: 'signup' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to send verification code. Please try again.', 'error');
      } else {
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setStep('otp');
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      }
    } catch {
      showToast('An error occurred. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // OTP input change handler — auto advance
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError('');

    if (cleaned && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (cleaned && index === 5 && newOtp.every(d => d !== '')) {
      verifyAndSignup(newOtp.join(''));
    }
  };

  // OTP backspace handler
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs[index - 1].current?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handle paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      otpRefs[5].current?.focus();
      verifyAndSignup(pasted);
    }
    e.preventDefault();
  };

  const verifyAndSignup = async (otpValue: string) => {
    if (loading) return;
    setLoading(true);
    setOtpError('');

    try {
      // Verify OTP against our Brevo-sent OTP in DB
      const verRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otpValue, purpose: 'signup' })
      });
      const verData = await verRes.json();

      if (!verData.valid) {
        const msgs: Record<string, string> = {
          expired: 'This code has expired. Please request a new one.',
          invalid: 'Incorrect code. Please check and try again.',
          not_found: 'Code not found. Please request a new one.'
        };
        setOtpError(msgs[verData.reason] || 'Invalid code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
        setLoading(false);
        return;
      }

      // OTP verified ✅ — Create account via server route (skips Supabase confirmation email)
      const signupRes = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          fullName,
          phone
        })
      });
      const signupData = await signupRes.json();

      if (!signupRes.ok || !signupData.success) {
        setOtpError(signupData.error || 'Account creation failed. Please try again.');
      } else {
        setStep('success');
      }
    } catch {
      setOtpError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits of your OTP.');
      return;
    }
    await verifyAndSignup(otpValue);
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), name: fullName, purpose: 'signup' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('A new OTP has been sent to your email.', 'success');
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setResendCountdown(30);
        setCanResend(false);
        const timer = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
            return prev - 1;
          });
        }, 1000);
        otpRefs[0].current?.focus();
      } else {
        showToast(data.error || 'Failed to resend OTP.', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-luxury">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center py-16 px-6">
        <div className="w-full max-w-sm text-left flex flex-col gap-8">

          {/* ── STEP 1: Details ── */}
          {step === 'details' && (
            <>
              <div>
                <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">Create Account</h1>
                <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">Join FREERT — we'll send a verification code to your email</p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="input-editorial text-xs"
                    placeholder="10-digit Indian mobile number"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-editorial text-xs pr-10"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-fg-luxury transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} strokeWidth={1.4} /> : <Eye size={14} strokeWidth={1.4} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send Verification Code <ArrowRight size={12} /></>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-text-muted text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-fg-luxury underline underline-offset-4 hover:opacity-70 transition-opacity">Sign In</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 bg-neutral-950 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={14} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-xl uppercase tracking-widest font-light text-fg-luxury">Verify Email</h1>
                </div>
                <p className="text-[10px] text-text-muted font-light leading-relaxed">
                  A 6-digit code was sent to <span className="text-fg-luxury font-medium">{email}</span>. Enter it below to complete your registration.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">
                {/* 6-digit OTP Input */}
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-3 block font-medium">Enter Verification Code</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-12 text-center text-base font-mono font-medium border bg-bg-luxury outline-none transition-all
                          ${otpError
                            ? 'border-red-400 text-red-700 bg-red-50'
                            : digit
                              ? 'border-neutral-900 text-fg-luxury'
                              : 'border-neutral-soft text-fg-luxury focus:border-neutral-900'
                          }`}
                        style={{ fontSize: '18px', letterSpacing: '0.05em' }}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="mt-2 text-[10px] text-red-700 font-medium leading-relaxed">{otpError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify & Create Account <ShieldCheck size={12} /></>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="flex items-center justify-between text-[9.5px] text-text-muted">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="hover:text-fg-luxury transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    ← Change Email
                  </button>
                  <div className="flex items-center gap-1">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="flex items-center gap-1 text-fg-luxury hover:opacity-70 transition-opacity cursor-pointer font-medium uppercase tracking-wider"
                      >
                        <RotateCcw size={10} />
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-text-muted">Resend in {resendCountdown}s</span>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="w-14 h-14 bg-neutral-950 rounded-full flex items-center justify-center">
                <CheckCircle2 size={26} className="text-white" strokeWidth={1.3} />
              </div>
              <div>
                <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury mb-2">Account Created</h2>
                <p className="text-[10px] text-text-muted font-light leading-relaxed max-w-xs">
                  Welcome to FREERT, {fullName.split(' ')[0]}. Your account has been verified and activated.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer"
              >
                Sign In to Continue
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
