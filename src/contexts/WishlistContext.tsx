'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/services/database';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const dbWish = await getWishlist(user.id);
          setWishlist(dbWish.map(item => item.product_id));
        } catch (e) {
          console.error('Failed to load wishlist from DB:', e);
        }
      } else {
        const saved = localStorage.getItem('freert_wishlist');
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch (e) {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
    };
    loadWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string, productName: string) => {
    let updated: string[];
    const index = wishlist.indexOf(productId);
    const exists = index > -1;

    try {
      if (user) {
        if (exists) {
          await removeFromWishlist(user.id, productId);
          updated = wishlist.filter(id => id !== productId);
          showToast(`Removed ${productName} from wishlist.`, 'info');
        } else {
          await addToWishlist(user.id, productId);
          updated = [...wishlist, productId];
          showToast(`Added ${productName} to wishlist.`, 'success');
        }
      } else {
        if (exists) {
          updated = wishlist.filter(id => id !== productId);
          showToast(`Removed ${productName} from wishlist.`, 'info');
        } else {
          updated = [...wishlist, productId];
          showToast(`Added ${productName} to wishlist.`, 'success');
        }
        localStorage.setItem('freert_wishlist', JSON.stringify(updated));
      }
      setWishlist(updated);
    } catch (err) {
      showToast('Failed to update wishlist.', 'error');
    }
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

