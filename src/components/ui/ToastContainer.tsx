'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import type { ToastMessage } from '@/contexts/ToastContext';
import { X, Check, AlertOctagon, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <style>{`
        @keyframes toastSlideIn {
          0% { transform: translateX(110%) scale(0.95); opacity: 0; }
          70% { transform: translateX(-5%) scale(1.01); opacity: 0.9; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes toastShrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onRemove(toast.id);
      }, 300); // match exit transition duration
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const statusConfig = {
    success: {
      bg: 'bg-stone-950/95 border-emerald-800/40 shadow-emerald-950/15',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      icon: <Check size={10} strokeWidth={3} />
    },
    error: {
      bg: 'bg-stone-950/95 border-red-800/40 shadow-red-950/15',
      iconBg: 'bg-red-500/10 text-red-400',
      progressBg: 'bg-gradient-to-r from-red-500 to-rose-400',
      icon: <AlertOctagon size={10} strokeWidth={3} />
    },
    info: {
      bg: 'bg-stone-950/95 border-accent-gold/40 shadow-amber-950/15',
      iconBg: 'bg-amber-500/10 text-accent-gold',
      progressBg: 'bg-gradient-to-r from-amber-500 to-yellow-300',
      icon: <Info size={10} strokeWidth={3} />
    }
  };

  const config = statusConfig[toast.type] || statusConfig.info;

  return (
    <div 
      className={`pointer-events-auto relative overflow-hidden backdrop-blur-lg border shadow-2xl p-4 flex items-center justify-between gap-4 rounded-sm transition-all duration-300 ease-in-out ${config.bg} ${
        isExiting 
          ? 'opacity-0 translate-x-12 scale-95 blur-sm' 
          : 'animate-[toastSlideIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${config.iconBg}`}>
          {config.icon}
        </div>
        <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-stone-200">
          {toast.message}
        </span>
      </div>
      <button 
        onClick={handleDismiss}
        className="text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
        aria-label="Dismiss notification"
      >
        <X size={10} strokeWidth={2} />
      </button>

      {/* Luxury Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div 
          className={`h-full ${config.progressBg}`}
          style={{
            animation: 'toastShrinkProgress 3.2s linear forwards'
          }}
        />
      </div>
    </div>
  );
};
