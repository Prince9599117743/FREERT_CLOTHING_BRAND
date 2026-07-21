'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    // Disable body scroll when modal open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/30 backdrop-blur-[2px] transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
      />

      {/* Modal box */}
      <div className="relative w-full max-w-lg bg-bg-luxury border border-neutral-soft/80 shadow-lg p-8 flex flex-col z-10 max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-muted hover:text-fg-luxury transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {title && (
          <h3 className="text-sm uppercase tracking-[0.2em] font-semibold text-fg-luxury mb-6 border-b border-neutral-soft/30 pb-2">
            {title}
          </h3>
        )}

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
