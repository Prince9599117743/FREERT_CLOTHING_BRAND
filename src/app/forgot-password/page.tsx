'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Send, ShieldCheck, RotateCcw, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

type Step = 'email' | 'otp' | 'new_password' | 'success';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown when OTP step starts
  useEffect(() => {
    if (step !== 'otp') return;
    setResendCountdown(30);
    setCanResend(false);
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), purpose: 'reset_password' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to send OTP. Please try again.', 'error');
      } else {
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setStep('otp');
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError('');
    if (cleaned && index < 5) otpRefs[index + 1].current?.focus();
    if (cleaned && index === 5 && newOtp.every(d => d !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      otpRefs[5].current?.focus();
      verifyOtp(pasted);
    }
    e.preventDefault();
  };

  const verifyOtp = async (otpValue: string) => {
    if (loading) return;
    setLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otpValue, purpose: 'reset_password' })
      });
      const data = await res.json();

      if (!data.valid) {
        const msgs: Record<string, string> = {
          expired: 'This OTP has expired. Please request a new one.',
          invalid: 'Incorrect OTP. Please try again.',
          not_found: 'OTP not found. Please request a new one.'
        };
        setOtpError(msgs[data.reason] || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      } else {
        if (data.resetToken) setResetToken(data.resetToken);
        setStep('new_password');
      }
    } catch {
      setOtpError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits of your OTP.');
      return;
    }
    await verifyOtp(otpValue);
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), purpose: 'reset_password' })
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

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          verifiedToken: resetToken,
          newPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to reset password. Please start over.', 'error');
        setStep('email');
      } else {
        setStep('success');
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

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <>
              <div>
                <Link href="/login" className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-text-muted hover:text-fg-luxury transition-colors mb-4">
                  <ArrowLeft size={11} /> Back to Sign In
                </Link>
                <h1 className="text-2xl uppercase tracking-widest font-light text-fg-luxury mb-2">Reset Password</h1>
                <p className="text-[10px] text-text-muted font-light uppercase tracking-wider">Enter your email to receive a verification code</p>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Send size={12} /> Send Verification Code</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 bg-neutral-950 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={14} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-xl uppercase tracking-widest font-light text-fg-luxury">Enter Code</h1>
                </div>
                <p className="text-[10px] text-text-muted font-light leading-relaxed">
                  A 6-digit code was sent to <span className="text-fg-luxury font-medium">{email}</span>. Enter it below to continue.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-3 block font-medium">Verification Code</label>
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
                        className={`w-11 h-12 text-center font-mono font-medium border bg-bg-luxury outline-none transition-all
                          ${otpError
                            ? 'border-red-400 text-red-700 bg-red-50'
                            : digit
                              ? 'border-neutral-900 text-fg-luxury'
                              : 'border-neutral-soft text-fg-luxury focus:border-neutral-900'
                          }`}
                        style={{ fontSize: '18px' }}
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
                    <><ShieldCheck size={12} /> Verify Code</>
                  )}
                </button>

                <div className="flex items-center justify-between text-[9.5px] text-text-muted">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
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
                        <RotateCcw size={10} /> Resend Code
                      </button>
                    ) : (
                      <span>Resend in {resendCountdown}s</span>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'new_password' && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 bg-neutral-950 rounded-full flex items-center justify-center flex-shrink-0">
                    <KeyRound size={14} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-xl uppercase tracking-widest font-light text-fg-luxury">New Password</h1>
                </div>
                <p className="text-[10px] text-text-muted font-light">Identity verified. Set your new password below.</p>
              </div>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
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

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1.5 block font-medium">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input-editorial text-xs"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1 text-[9px] text-red-600">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword}
                  className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="w-14 h-14 bg-neutral-950 rounded-full flex items-center justify-center">
                <CheckCircle2 size={26} className="text-white" strokeWidth={1.3} />
              </div>
              <div>
                <h2 className="text-xl uppercase tracking-widest font-light text-fg-luxury mb-2">Password Updated</h2>
                <p className="text-[10px] text-text-muted font-light leading-relaxed max-w-xs">
                  Your password has been successfully changed. You can now sign in with your new password.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest py-3.5 font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
