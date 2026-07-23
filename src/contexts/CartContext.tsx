'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, ProductVariant, Product } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (variant: ProductVariant & { product?: Product }, qty?: number) => Promise<void>;
  updateQty: (variantId: string, qty: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);


  // Sync / Load cart items
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Authenticated users: Load cart from database
        try {
          const { data, error } = await supabase
            .from('cart')
            .select(`
              id,
              user_id,
              variant_id,
              qty,
              created_at,
              updated_at,
              variant:product_variants (
                id,
                product_id,
                size,
                color,
                additional_price,
                stock,
                product:products (
                  id,
                  name,
                  slug,
                  base_price,
                  images
                )
              )
            `)
            .eq('user_id', user.id);

          if (!error && data) {
            // Map db elements to CartItem interfaces
            const items: CartItem[] = data.map((item: any) => ({
              id: item.id,
              userId: item.user_id,
              variantId: item.variant_id,
              qty: item.qty,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              variant: item.variant ? {
                id: item.variant.id,
                productId: item.variant.product_id,
                size: item.variant.size,
                color: item.variant.color,
                sku: item.variant.sku || '',
                stockQty: item.variant.stock_qty || item.variant.stock || 0,
                additionalPrice: item.variant.additional_price || 0,
                createdAt: item.variant.created_at || '',
                updatedAt: item.variant.updated_at || '',
                product: item.variant.product ? {
                  ...item.variant.product,
                  basePrice: item.variant.product.base_price,
                  isPublished: item.variant.product.is_published,
                  createdAt: item.variant.product.created_at,
                  updatedAt: item.variant.product.updated_at
                } : undefined
              } as any : undefined
            }));
            setCart(items);
          }
        } catch (err) {
          console.error('Failed to sync DB cart:', err);
        }
      } else {
        // Unauthenticated users: Load cart from LocalStorage
        const localData = localStorage.getItem('freert_local_cart');
        if (localData) {
          try {
            setCart(JSON.parse(localData));
          } catch (e) {
            setCart([]);
          }
        }
      }
    };

    loadCart();
  }, [user]);

  // Backup local cart changes to localstorage when unauthenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem('freert_local_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (variant: ProductVariant & { product?: Product }, qty = 1) => {
    const existingIndex = cart.findIndex(item => item.variantId === variant.id);

    if (existingIndex >= 0) {
      const updatedQty = cart[existingIndex].qty + qty;
      await updateQty(variant.id, updatedQty);
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(), // Temp local ID
        userId: user?.id || 'guest',
        variantId: variant.id,
        qty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variant
      };

      setCart(prev => [...prev, newItem]);

      if (user) {
        // Auth user: Persist in DB
        await supabase.from('cart').insert({
          user_id: user.id,
          variant_id: variant.id,
          qty
        });
      }
    }
  };

  const updateQty = async (variantId: string, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(variantId);
      return;
    }

    setCart(prev => prev.map(item => item.variantId === variantId ? { ...item, qty } : item));

    if (user) {
      await supabase
        .from('cart')
        .update({ qty })
        .eq('user_id', user.id)
        .eq('variant_id', variantId);
    }
  };

  const removeFromCart = async (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));

    if (user) {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('variant_id', variantId);
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.variant?.product?.basePrice || 0;
    const additionalPrice = item.variant?.additionalPrice || 0;
    return sum + (price + additionalPrice) * item.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, cartSubtotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be wrapped in CartProvider context scope.');
  }
  return context;
};
