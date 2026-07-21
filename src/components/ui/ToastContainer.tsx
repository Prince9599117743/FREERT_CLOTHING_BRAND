'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import type { ToastMessage } from '@/contexts/ToastContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
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
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons: { [key in ToastMessage['type']]: React.ReactNode } = {
    success: <CheckCircle size={14} className="text-green-700" />,
    error: <AlertTriangle size={14} className="text-red-700" />,
    info: <Info size={14} className="text-accent-gold" />
  };

  return (
    <div className="pointer-events-auto bg-bg-luxury border border-neutral-soft/80 shadow-md p-4 flex items-center justify-between gap-4 animate-[slideInLeft_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <span className="text-[11px] uppercase tracking-wider font-light text-fg-luxury">{toast.message}</span>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className="text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={12} strokeWidth={1.5} />
      </button>
    </div>
  );
};
