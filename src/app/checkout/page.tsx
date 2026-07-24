'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { createOrder, getSiteSettings, validateCoupon } from '@/services/database';
import { ArrowRight, Shield, Truck, Check, Copy, Package, MapPin, CreditCard, Tag, Sparkles, ChevronRight, MessageCircle, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   PREMIUM ANIMATIONS & PARTICLES
───────────────────────────────────────────── */
const PremiumConfetti: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#C9A84C', '#E8D5A3', '#ffffff', '#B8860B', '#DAA520', '#F5F5DC', '#1a1a2e'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 3,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 3,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2.5 + 0.8,
        opacity: 1,
        life: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.y < canvas.height + 20) {
          alive = true;
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;
          p.life -= 0.003;
          p.opacity = Math.max(0, p.life);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

/* ─────────────────────────────────────────────
   MAIN CHECKOUT PAGE
───────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Step: 1=address, 3=payment, 'processing'=loader, 4=success
  const [currentStep, setCurrentStep] = useState<1 | 3 | 4 | 'processing'>(1);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  const [isOnlinePaymentEnabled, setIsOnlinePaymentEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [redirectCount, setRedirectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('Securing your order...');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponShake, setCouponShake] = useState(false);

  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  const shippingCost = cartSubtotal > 499 ? 0 : 80;
  const total = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  useEffect(() => {
    if (cart.length === 0 && currentStep !== 4 && currentStep !== 'processing') {
      router.push('/');
    }
    if (user) {
      setEmail(user.email);
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
    (async () => {
      try {
        const settings = await getSiteSettings();
        const onlineEnabled = settings['online_payment_enabled'] === 'true';
        setIsOnlinePaymentEnabled(onlineEnabled);
        setPaymentMethod(onlineEnabled ? 'razorpay' : 'cod');
      } catch {
        const onlineSaved = localStorage.getItem('freert_online_payment_enabled') === 'true';
        setIsOnlinePaymentEnabled(onlineSaved);
        setPaymentMethod(onlineSaved ? 'razorpay' : 'cod');
      }
    })();
  }, [cart, user, router, currentStep]);

  // Countdown redirect after success
  useEffect(() => {
    if (currentStep === 4) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setRedirectCount(8);
      redirectTimerRef.current = setInterval(() => {
        setRedirectCount(prev => {
          if (prev <= 1) {
            clearInterval(redirectTimerRef.current!);
            router.push('/shop');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (redirectTimerRef.current) clearInterval(redirectTimerRef.current); };
  }, [currentStep, router]);

  const handleCancelRedirect = () => {
    if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    setRedirectCount(0);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || couponApplying) return;
    setCouponApplying(true);
    try {
      const coupon = (await validateCoupon(couponCode.trim())) as any;
      if (!coupon || !coupon.isActive) {
        setCouponShake(true);
        setTimeout(() => setCouponShake(false), 600);
        showToast('Invalid or expired coupon code.', 'error');
        return;
      }
      const now = new Date();
      if (now < new Date(coupon.activeFrom) || now > new Date(coupon.activeTo)) {
        showToast('This coupon has expired.', 'error');
        return;
      }
      if (coupon.currentUses >= coupon.maxUses) {
        showToast('Coupon usage limit exceeded.', 'error');
        return;
      }
      if (cartSubtotal < coupon.minOrderAmount) {
        showToast(`Minimum ₹${coupon.minOrderAmount} order required.`, 'error');
        return;
      }
      let calculatedDiscount = coupon.discountType === 'flat'
        ? coupon.discountValue
        : Math.min(cartSubtotal * (coupon.discountValue / 100), coupon.maxDiscountAmount > 0 ? coupon.maxDiscountAmount : Infinity);
      setAppliedCoupon(coupon);
      setDiscountAmount(calculatedDiscount);
      showToast(`✓ "${coupon.code}" applied — ₹${calculatedDiscount.toLocaleString('en-IN')} saved!`, 'success');
    } catch {
      showToast('Failed to apply coupon.', 'error');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !street || !city || !stateName || !postalCode) {
      showToast('Please fill all address fields.', 'error');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const simulateProcessing = async () => {
    const steps = [
      { text: 'Verifying your details...', progress: 20 },
      { text: 'Securing payment channel...', progress: 45 },
      { text: 'Confirming inventory...', progress: 70 },
      { text: 'Registering your order...', progress: 90 },
      { text: 'Order confirmed!', progress: 100 },
    ];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 700));
      setProcessingProgress(step.progress);
      setProcessingText(step.text);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmittingRef.current || processing) return;
    isSubmittingRef.current = true;
    setProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    simulateProcessing();

    try {
      const dbOrder = await createOrder({
        userId: user?.id || undefined,
        totalAmount: total,
        discountAmount,
        couponId: appliedCoupon?.id || undefined,
        status: 'pending',
        shippingAddress: { fullName, email, phone, street, city, state: stateName, postalCode }
      }, cart);

      const placedOrder = {
        id: dbOrder.orderNumber ? String(dbOrder.orderNumber) : dbOrder.id,
        rawId: dbOrder.id,
        order_number: dbOrder.orderNumber,
        date: new Date().toISOString().split('T')[0],
        totalAmount: total,
        discountAmount,
        status: 'pending',
        paymentMethod: paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery',
        items: cart.map(item => ({
          name: item.variant?.product?.name || 'Garment',
          qty: item.qty,
          price: item.priceOverride || (item.variant?.product?.basePrice || 0) + (item.variant?.additionalPrice || 0),
          size: item.variant?.size || 'One Size',
          color: item.variant?.color || 'Default',
          image: item.variant?.product?.images?.[0] || null,
        })),
        shippingAddress: { fullName, phone, street, city, state: stateName, postalCode },
      };

      setPlacedOrderDetails(placedOrder);
      const existing = localStorage.getItem('freert_orders_log');
      localStorage.setItem('freert_orders_log', JSON.stringify([placedOrder, ...(existing ? JSON.parse(existing) : [])]));
      clearCart();
      sessionStorage.removeItem('freert_discount_active');

      await new Promise(r => setTimeout(r, 800)); // let progress reach 100%
      setCurrentStep(4);
    } catch (err: any) {
      isSubmittingRef.current = false;
      setProcessing(false);
      setCurrentStep(3);
      if (err.message === 'DATABASE_OFFLINE') {
        const fallbackOrderNum = Math.floor(100000 + Math.random() * 900000);
        const fallbackOrder = {
          id: `FR-${fallbackOrderNum}`,
          rawId: `FR-${fallbackOrderNum}`,
          order_number: fallbackOrderNum,
          date: new Date().toISOString().split('T')[0],
          totalAmount: total,
          discountAmount,
          status: 'pending',
          paymentMethod: 'Cash on Delivery',
          items: cart.map(item => ({
            name: item.variant?.product?.name || 'Garment',
            qty: item.qty,
            price: item.variant?.product?.basePrice || 0,
            size: item.variant?.size || 'One Size',
            color: item.variant?.color || 'Default',
            image: item.variant?.product?.images?.[0] || null,
          })),
          shippingAddress: { fullName, phone, street, city, state: stateName, postalCode },
        };
        setPlacedOrderDetails(fallbackOrder);
        clearCart();
        await new Promise(r => setTimeout(r, 500));
        setCurrentStep(4);
      } else {
        showToast(err.message || 'Order submission failed.', 'error');
      }
    } finally {
      isSubmittingRef.current = false;
      setProcessing(false);
    }
  };

  const copyOrderId = () => {
    const id = placedOrderDetails?.order_number || placedOrderDetails?.id;
    navigator.clipboard.writeText(String(id)).then(() => {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    });
  };

  /* ────────── STYLES ────────── */
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .checkout-dark {
      background: #0a0a0f;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      color: #e8e8e8;
    }

    .glass-card {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
    }

    .gold-gradient {
      background: linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #B8860B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn-gold {
      background: linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #B8860B 100%);
      color: #0a0a0f;
      font-weight: 700;
      letter-spacing: 0.08em;
      border: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-gold::before {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .btn-gold:hover::before { left: 100%; }
    .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(201,168,76,0.4); }
    .btn-gold:active { transform: translateY(0) scale(0.98); }

    .btn-outline-gold {
      background: transparent;
      border: 1px solid rgba(201,168,76,0.4);
      color: #C9A84C;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-outline-gold:hover {
      background: rgba(201,168,76,0.1);
      border-color: #C9A84C;
      transform: translateY(-1px);
    }

    .input-dark {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #e8e8e8;
      transition: all 0.3s ease;
      outline: none;
      width: 100%;
    }
    .input-dark:focus {
      border-color: rgba(201,168,76,0.6);
      background: rgba(255,255,255,0.06);
      box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
    }
    .input-dark::placeholder { color: rgba(255,255,255,0.25); }

    .step-active { color: #C9A84C; border-color: #C9A84C; background: rgba(201,168,76,0.1); }
    .step-done { color: #22c55e; border-color: #22c55e; background: rgba(34,197,94,0.1); }
    .step-inactive { color: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.1); }

    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }
    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
      50% { box-shadow: 0 0 0 20px rgba(201,168,76,0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    @keyframes progressFill {
      from { width: 0; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes successRing {
      from { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.15); opacity: 1; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes countDown {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: 226; }
    }

    .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
    .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-success-ring { animation: successRing 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .animate-shake { animation: shake 0.5s ease; }

    .processing-ring {
      animation: spin 1.5s linear infinite;
      transform-origin: center;
    }
    .processing-ring-glow {
      filter: drop-shadow(0 0 8px rgba(201,168,76,0.6));
    }

    .trust-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.05em;
    }

    .product-card-checkout {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    .product-card-checkout:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(201,168,76,0.2);
    }

    .timeline-step-active {
      background: linear-gradient(135deg, #C9A84C, #E8D5A3);
      box-shadow: 0 0 20px rgba(201,168,76,0.5);
    }
    .timeline-step-done {
      background: linear-gradient(135deg, #22c55e, #4ade80);
      box-shadow: 0 0 15px rgba(34,197,94,0.4);
    }
    .timeline-step-inactive {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
    }

    .help-bubble {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 100;
      animation: float 4s ease-in-out infinite;
    }

    .coupon-success {
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: 10px;
      animation: fadeInUp 0.3s ease;
    }
    .coupon-error {
      border-color: rgba(239,68,68,0.4);
    }

    .ripple-btn {
      position: relative;
      overflow: hidden;
    }
    .ripple-btn::after {
      content: '';
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transform: scale(0);
      opacity: 1;
      transition: transform 0.6s ease, opacity 0.6s ease;
    }
    .ripple-btn:active::after {
      transform: scale(4);
      opacity: 0;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
  `;

  /* ────────────── PROCESSING SCREEN ────────────── */
  if (currentStep === 'processing') {
    return (
      <div className="checkout-dark flex items-center justify-center min-h-screen">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="text-center flex flex-col items-center gap-8 px-8" style={{ maxWidth: 400 }}>
          {/* Animated Progress Ring */}
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Background ring */}
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              {/* Progress ring */}
              <circle
                cx="70" cy="70" r="60"
                fill="none"
                stroke="url(#goldGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * processingProgress) / 100}
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A84C" />
                  <stop offset="100%" stopColor="#E8D5A3" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {processingProgress}%
              </span>
            </div>
          </div>

          {/* Status text */}
          <div className="flex flex-col gap-3 items-center">
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.04em', color: '#e8e8e8' }}>
              Processing Your Order
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', transition: 'all 0.5s ease', minHeight: 20 }}>
              {processingText}
            </p>
          </div>

          {/* Floating product thumbnails */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {cart.slice(0, 3).map((item, i) => (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 64,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid rgba(201,168,76,0.2)',
                  animation: `float ${2.5 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {item.variant?.product?.images?.[0] ? (
                  <img src={item.variant.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="rgba(255,255,255,0.2)" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div className="trust-badge" style={{ marginTop: 8 }}>
            <Shield size={12} color="#C9A84C" />
            <span>256-bit SSL Encrypted · Secure Checkout</span>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────── SUCCESS SCREEN ────────────── */
  if (currentStep === 4) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <div className="checkout-dark" style={{ minHeight: '100vh', padding: '0 0 80px' }}>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <PremiumConfetti active={showConfetti} />

        {/* Top minimal bar */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/freert-logo-light.png" alt="FREERT" style={{ height: 32, filter: 'brightness(0) invert(1) opacity(0.8)' }} />
          </Link>
          <div className="trust-badge">
            <Shield size={12} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>Order Secured</span>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 0' }}>

          {/* Hero Success Block */}
          <div className="animate-slideUp" style={{ textAlign: 'center', marginBottom: 48 }}>
            {/* Animated checkmark circle */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
              <div className="animate-success-ring" style={{
                width: 100, height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 70%)',
                border: '2px solid rgba(34,197,94,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M12 25l9 9 15-18"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="60"
                    strokeDashoffset="60"
                    style={{ animation: 'drawCheck 0.8s ease-out 0.3s forwards' }}
                  />
                </svg>
              </div>
              {/* Pulse rings */}
              <div style={{
                position: 'absolute', inset: -12,
                borderRadius: '50%',
                border: '1px solid rgba(34,197,94,0.2)',
                animation: 'pulse-gold 2s ease infinite',
              }} />
            </div>

            <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 12, fontWeight: 600 }}>
              Order Successfully Placed
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8e8e8', marginBottom: 12, lineHeight: 1.2 }}>
              Thank You, {placedOrderDetails?.shippingAddress?.fullName?.split(' ')[0] || 'for shopping'}!
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Your premium FREERT order is confirmed. Our team will carefully curate and dispatch your garments.
            </p>
          </div>

          {/* Order ID Badge */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '20px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '0.1s' }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600 }}>Order Reference</p>
              <p className="gold-gradient" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.05em' }}>
                #{placedOrderDetails?.order_number || placedOrderDetails?.id}
              </p>
            </div>
            <button
              onClick={copyOrderId}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.3s ease' }}
              className={copiedOrderId ? 'btn-gold' : 'btn-outline-gold'}
            >
              {copiedOrderId ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy ID</>}
            </button>
          </div>

          {/* Delivery Timeline */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '24px 28px', marginBottom: 24, animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h3 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8' }}>Delivery Timeline</h3>
              <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600 }}>Est. {deliveryStr}</span>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', top: 18, left: '10%', right: '10%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 18, left: '10%', width: '15%', height: 2, background: 'linear-gradient(90deg,#22c55e,#4ade80)', borderRadius: 1 }} />

              {[
                { label: 'Order\nPlaced', icon: '✓', done: true, active: false },
                { label: 'Being\nPrepared', icon: '📦', done: false, active: true },
                { label: 'Shipped', icon: '🚚', done: false, active: false },
                { label: 'Out for\nDelivery', icon: '📍', done: false, active: false },
                { label: 'Delivered', icon: '🎉', done: false, active: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1, flex: 1 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: step.done || step.active ? 14 : 12,
                    fontWeight: 700,
                    ...(step.done ? { background: 'linear-gradient(135deg,#22c55e,#4ade80)', boxShadow: '0 0 15px rgba(34,197,94,0.4)' }
                      : step.active ? { background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', boxShadow: '0 0 20px rgba(201,168,76,0.5)' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' })
                  }}>
                    {step.done ? <Check size={16} color="#fff" /> : step.icon}
                  </div>
                  <p style={{
                    fontSize: 9, textAlign: 'center', letterSpacing: '0.05em',
                    color: step.done ? '#22c55e' : step.active ? '#C9A84C' : 'rgba(255,255,255,0.3)',
                    fontWeight: step.done || step.active ? 600 : 400,
                    whiteSpace: 'pre-line', lineHeight: 1.4
                  }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '24px 28px', marginBottom: 24, animationDelay: '0.3s' }}>
            <h3 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8', marginBottom: 20 }}>
              Your Items ({placedOrderDetails?.items?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {placedOrderDetails?.items?.map((item: any, idx: number) => (
                <div key={idx} className="product-card-checkout" style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="rgba(255,255,255,0.15)" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', marginBottom: 5 }}>{item.name}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '2px 8px', color: '#C9A84C', fontWeight: 600, letterSpacing: '0.05em' }}>
                        SIZE {item.size}
                      </span>
                      <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                        {item.color}
                      </span>
                      <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                        QTY {item.qty}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#e8e8e8', flexShrink: 0 }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              {/* Total */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Total Paid · {placedOrderDetails?.paymentMethod}</p>
                </div>
                <p className="gold-gradient" style={{ fontSize: 24, fontWeight: 800 }}>
                  ₹{placedOrderDetails?.totalAmount?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '20px 28px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start', animationDelay: '0.35s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={16} color="#C9A84C" />
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontWeight: 600 }}>Delivering To</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>{placedOrderDetails?.shippingAddress?.fullName}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {placedOrderDetails?.shippingAddress?.street}, {placedOrderDetails?.shippingAddress?.city}<br />
                {placedOrderDetails?.shippingAddress?.state} — {placedOrderDetails?.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          {/* Redirect timer */}
          {redirectCount > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 50, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'relative', width: 24, height: 24 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle
                      cx="12" cy="12" r="9" fill="none"
                      stroke="#C9A84C" strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="56.5"
                      strokeDashoffset={56.5 * (redirectCount / 8)}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '12px 12px', transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#C9A84C' }}>{redirectCount}</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                  Redirecting to shop...
                </span>
                <button onClick={handleCancelRedirect} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="animate-fadeInUp" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.4s' }}>
            <button
              onClick={() => { handleCancelRedirect(); router.push(`/order/${placedOrderDetails?.rawId || placedOrderDetails?.id}`); }}
              className="btn-gold ripple-btn"
              style={{ flex: 1, minWidth: 160, padding: '16px 20px', borderRadius: 14, fontSize: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Package size={15} />
              Track Order
            </button>
            <button
              onClick={() => { handleCancelRedirect(); router.push('/shop'); }}
              className="btn-outline-gold ripple-btn"
              style={{ flex: 1, minWidth: 160, padding: '16px 20px', borderRadius: 14, fontSize: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Sparkles size={15} />
              Shop More
            </button>
          </div>
        </div>

        {/* Help Bubble */}
        <div className="help-bubble">
          <Link href="/support" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', color: '#0a0a0f', textDecoration: 'none', boxShadow: '0 8px 24px rgba(201,168,76,0.4)' }}>
            <MessageCircle size={20} />
          </Link>
        </div>
      </div>
    );
  }

  /* ────────────── CHECKOUT FORM ────────────── */
  return (
    <div className="checkout-dark">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Premium Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/freert-logo-light.png" alt="FREERT" style={{ height: 28, filter: 'brightness(0) invert(1) opacity(0.85)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.25em', color: '#e8e8e8', textTransform: 'uppercase' }}>FREERT</span>
        </Link>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[{ n: 1, label: 'Address' }, { n: 3, label: 'Payment' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, border: '1.5px solid',
                  transition: 'all 0.3s ease',
                  ...(currentStep === s.n
                    ? { borderColor: '#C9A84C', background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }
                    : (currentStep as any) > s.n
                      ? { borderColor: '#22c55e', background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                      : { borderColor: 'rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.3)' })
                }}>
                  {(currentStep as any) > s.n ? <Check size={12} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: currentStep === s.n ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}>
                  {s.label}
                </span>
              </div>
              {i === 0 && <ChevronRight size={14} color="rgba(255,255,255,0.2)" />}
            </React.Fragment>
          ))}
        </div>

        <div className="trust-badge">
          <Shield size={12} color="#C9A84C" />
          <span>SSL Secured</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 32 }} className="checkout-grid">
        <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr !important; } }` }} />

        {/* LEFT: Form */}
        <div>
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="animate-slideUp">
              {/* Contact */}
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', color: '#0a0a0f', fontSize: 12, fontWeight: 800 }}>1</span>
                  Contact Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" style={{ padding: '12px 16px', fontSize: 13 }} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Phone Number</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="input-dark" style={{ padding: '12px 16px', fontSize: 13 }} placeholder="+91 98765 43210" />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                <h2 style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', color: '#0a0a0f', fontSize: 12, fontWeight: 800 }}>2</span>
                  Delivery Address
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Full Name</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-dark" style={{ padding: '12px 16px', fontSize: 13 }} placeholder="Recipient name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Street Address</label>
                    <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="input-dark" style={{ padding: '12px 16px', fontSize: 13 }} placeholder="House, Street, Landmark" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>City</label>
                      <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="input-dark" style={{ padding: '12px 14px', fontSize: 13 }} placeholder="City" />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>State</label>
                      <input type="text" required value={stateName} onChange={e => setStateName(e.target.value)} className="input-dark" style={{ padding: '12px 14px', fontSize: 13 }} placeholder="State" />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Pincode</label>
                      <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="input-dark" style={{ padding: '12px 14px', fontSize: 13 }} placeholder="110001" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-gold ripple-btn" style={{ width: '100%', padding: '18px', borderRadius: 14, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.1em' }}>
                Continue to Payment <ArrowRight size={16} />
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleSubmitOrder} className="animate-slideUp">
              <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', color: '#0a0a0f', fontSize: 12, fontWeight: 800 }}>3</span>
                  Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {isOnlinePaymentEnabled && (
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderRadius: 14, border: `1.5px solid ${paymentMethod === 'razorpay' ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`, background: paymentMethod === 'razorpay' ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>Online Payment</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>UPI · Cards · Net Banking · Wallets</p>
                        </div>
                      </div>
                      <CreditCard size={18} color="#C9A84C" />
                    </label>
                  )}
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderRadius: 14, border: `1.5px solid ${paymentMethod === 'cod' ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`, background: paymentMethod === 'cod' ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: '#C9A84C', width: 16, height: 16 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>Cash on Delivery</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Pay when your order arrives</p>
                      </div>
                    </div>
                    <Truck size={18} color="#C9A84C" />
                  </label>
                </div>
              </div>

              {/* Trust signals */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { icon: <Shield size={13} color="#22c55e" />, text: '256-bit SSL' },
                  { icon: <Check size={13} color="#22c55e" />, text: 'Secure Checkout' },
                  { icon: <Truck size={13} color="#22c55e" />, text: 'Safe Delivery' },
                ].map((t, i) => (
                  <div key={i} className="trust-badge">
                    {t.icon}
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{t.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setCurrentStep(1)} className="btn-outline-gold" style={{ flex: '0 0 auto', padding: '16px 22px', borderRadius: 14, fontSize: 12, letterSpacing: '0.08em' }}>
                  ← Back
                </button>
                <button type="submit" disabled={processing} className="btn-gold ripple-btn" style={{ flex: 1, padding: '18px', borderRadius: 14, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '0.08em', opacity: processing ? 0.7 : 1 }}>
                  {processing ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    <><Shield size={16} /> Pay Securely · ₹{total.toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT: Order Summary */}
        <div>
          <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#e8e8e8', marginBottom: 20 }}>
              Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 280, overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
              {cart.map((item, i) => {
                const price = (item.variant?.product?.basePrice || 0) + (item.variant?.additionalPrice || 0);
                const image = item.variant?.product?.images?.[0] || null;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                      {image ? (
                        <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={16} color="rgba(255,255,255,0.15)" />
                        </div>
                      )}
                      {/* Qty badge */}
                      <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#0a0a0f' }}>
                        {item.qty}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.variant?.product?.name}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.05em' }}>{item.variant?.size || item.size} · {item.variant?.color || item.color}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', flexShrink: 0 }}>₹{((item.priceOverride || price) * item.qty).toLocaleString('en-IN')}</p>
                  </div>
                );
              })}
            </div>

            {/* Coupon */}
            {currentStep <= 3 && (
              <div style={{ marginBottom: 16 }}>
                {appliedCoupon ? (
                  <div className="coupon-success" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={13} color="#22c55e" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>— ₹{discountAmount.toLocaleString('en-IN')} off</span>
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8 }} className={couponShake ? 'animate-shake' : ''}>
                    <input
                      type="text"
                      placeholder="Promo code (e.g. FREERT20)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="input-dark"
                      style={{ padding: '10px 14px', fontSize: 11, flex: 1, letterSpacing: '0.08em' }}
                    />
                    <button
                      type="submit"
                      disabled={couponApplying || !couponCode.trim()}
                      className="btn-outline-gold"
                      style={{ padding: '10px 16px', borderRadius: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', flexShrink: 0, opacity: (!couponCode.trim() || couponApplying) ? 0.5 : 1 }}
                    >
                      {couponApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#22c55e' }}>
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                <span>Delivery</span>
                <span style={{ color: shippingCost === 0 ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                  {shippingCost === 0 ? '✓ FREE' : `₹${shippingCost}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.7)', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 8, padding: '6px 10px', lineHeight: 1.5 }}>
                  Add ₹{(500 - cartSubtotal).toLocaleString('en-IN')} more for FREE delivery
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e8e8e8', letterSpacing: '0.05em' }}>Total</span>
                <span className="gold-gradient" style={{ fontSize: 20, fontWeight: 800 }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* GST note */}
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12, letterSpacing: '0.05em' }}>
              All prices inclusive of GST · Free returns within 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Floating Help */}
      <div className="help-bubble">
        <Link href="/support" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8D5A3)', color: '#0a0a0f', textDecoration: 'none', boxShadow: '0 8px 24px rgba(201,168,76,0.4)' }}>
          <MessageCircle size={20} />
        </Link>
      </div>
    </div>
  );
}
