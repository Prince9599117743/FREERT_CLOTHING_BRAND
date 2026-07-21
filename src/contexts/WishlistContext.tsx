'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('freert_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        setWishlist([]);
      }
    }
  }, []);

  const toggleWishlist = (productId: string, productName: string) => {
    let updated: string[];
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
      updated = wishlist.filter(id => id !== productId);
      showToast(`Removed ${productName} from wishlist.`, 'info');
    } else {
      updated = [...wishlist, productId];
      showToast(`Added ${productName} to wishlist.`, 'success');
    }
    
    setWishlist(updated);
    localStorage.setItem('freert_wishlist', JSON.stringify(updated));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider context.');
  }
  return context;
};
