'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

interface NotificationData {
  name: string;
  city: string;
  product: string;
  time: string;
}

const NAMES = ['Aarav', 'Rahul', 'Kabir', 'Meera', 'Priya', 'Rohan', 'Ananya', 'Ishaan', 'Dev', 'Aditi', 'Siddharth', 'Nisha'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Jaipur', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Chandigarh'];
const PRODUCTS = [
  'Raw Silk Blazer',
  'Trench Dress',
  'Loom Knit Trousers',
  'Fine Cashmere Cardigan',
  'Linen Editorial Shirt',
  'Architectural Wool Coat',
  'Ribbed Column Dress',
  'Luxury Trench Coat'
];
const TIMES = ['2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', '19 minutes ago', '24 minutes ago', '35 minutes ago', '48 minutes ago'];

export const SocialProofPopup: React.FC = () => {
  const [current, setCurrent] = useState<NotificationData | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // First popup after 12 seconds
    const firstTimeout = setTimeout(() => {
      triggerNotification();
    }, 12000);

    // Interval to trigger subsequent popups every 40 seconds to avoid irritation
    const interval = setInterval(() => {
      triggerNotification();
    }, 40000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [dismissed]);

  const triggerNotification = () => {
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

    setCurrent({
      name: randomName,
      city: randomCity,
      product: randomProduct,
      time: randomTime
    });
    setVisible(true);

    // Dismiss automatically after 6 seconds
    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('freert_social_proof_dismissed', 'true');
  };

  useEffect(() => {
    if (sessionStorage.getItem('freert_social_proof_dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  if (dismissed || !current) return null;

  return (
    <div 
      className={`fixed bottom-6 left-6 z-40 bg-bg-luxury/95 backdrop-blur-md border border-accent-gold/45 shadow-2xl p-4 flex items-center gap-3.5 max-w-xs w-full transition-all duration-500 ease-in-out rounded-sm ${
        visible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}
    >
      <div className="w-9 h-9 bg-accent-gold/10 rounded-full flex items-center justify-center text-accent-gold flex-shrink-0">
        <ShoppingBag size={14} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 text-left flex flex-col gap-0.5 pr-2">
        <p className="text-[8.5px] uppercase tracking-[0.2em] font-semibold text-fg-luxury">
          {current.name} from {current.city}
        </p>
        <p className="text-[9.5px] text-text-muted font-light leading-relaxed">
          Purchased <span className="font-semibold text-fg-luxury">{current.product}</span>
        </p>
        <p className="text-[7.5px] uppercase tracking-wider text-accent-gold font-medium mt-0.5">
          {current.time}
        </p>
      </div>

      <button 
        onClick={handleClose}
        className="text-stone-400 hover:text-fg-luxury transition-colors cursor-pointer p-1 absolute top-2 right-2"
        aria-label="Close notification"
      >
        <X size={10} strokeWidth={2} />
      </button>
    </div>
  );
};
