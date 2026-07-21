import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS } from './mockData';
import type { Product, Category, Collection, Address, Order } from '@/types';

const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined;
};

// Helper to check if execution is on client
const isClient = typeof window !== 'undefined';

// 1. PRODUCT SERVICE METHODS
export const getProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          collection:collections(*),
          variants:product_variants(*)
        `);
      if (!error && data) return data as Product[];
    } catch (e) {
      console.warn('Supabase query failed, falling back to local storage.');
    }
  }

  // Fallback to local storage
  if (isClient) {
    const saved = localStorage.getItem('freert_products_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return MOCK_PRODUCTS;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          collection:collections(*),
          variants:product_variants(*)
        `)
        .eq('slug', slug)
        .single();
      if (!error && data) return data as Product;
    } catch (e) {}
  }

  // Local storage find fallback
  const list = await getProducts();
  return list.find(p => p.slug === slug) || null;
};

// 2. CATEGORIES & COLLECTIONS METHODS
export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data as Category[];
    } catch (e) {}
  }

  if (isClient) {
    const saved = localStorage.getItem('freert_categories_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
  }
  return MOCK_CATEGORIES;
};

export const getCollections = async (): Promise<Collection[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('collections').select('*');
      if (!error && data) return data as Collection[];
    } catch (e) {}
  }
  return MOCK_COLLECTIONS;
};

// 3. ADDRESSES METHODS
export const getAddresses = async (userId: string): Promise<Address[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as Address[];
    } catch (e) {}
  }

  if (isClient) {
    const saved = localStorage.getItem(`freert_addresses_${userId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
  }
  return [];
};

export const saveAddress = async (address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert(address)
        .select()
        .single();
      if (!error && data) return data as Address;
    } catch (e) {}
  }

  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  if (isClient) {
    const key = `freert_addresses_${address.userId}`;
    const existing = localStorage.getItem(key);
    const list = existing ? JSON.parse(existing) : [];
    localStorage.setItem(key, JSON.stringify([newAddress, ...list]));
  }
  return newAddress;
};

// 4. TRANSACTION ORDERS METHODS
export const getOrders = async (userId: string): Promise<Order[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          payment:payments(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    } catch (e) {}
  }

  if (isClient) {
    const saved = localStorage.getItem('freert_orders_log');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
  }
  return [];
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, items: any[]): Promise<Order> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
        
      if (!error && data) {
        const itemsWithOrderId = items.map(item => ({ ...item, order_id: data.id }));
        await supabase.from('order_items').insert(itemsWithOrderId);
        return data as Order;
      }
    } catch (e) {}
  }

  // Fallback to local storage logs
  const newOrder: Order = {
    ...order,
    id: `FR-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isClient) {
    const existing = localStorage.getItem('freert_orders_log');
    const orderHistory = existing ? JSON.parse(existing) : [];
    localStorage.setItem('freert_orders_log', JSON.stringify([newOrder, ...orderHistory]));
  }
  return newOrder;
};

// 5. SUPPORT TICKETS & REVIEWS
export const createSupportTicket = async (ticket: { name: string; email: string; message: string }): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('support_tickets').insert(ticket);
      return;
    } catch (e) {}
  }
  if (isClient) {
    const existing = localStorage.getItem('freert_support_tickets');
    const list = existing ? JSON.parse(existing) : [];
    localStorage.setItem('freert_support_tickets', JSON.stringify([ticket, ...list]));
  }
};

export const getProductReviews = async (productId: string): Promise<any[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId);
      if (!error && data) return data;
    } catch (e) {}
  }

  if (isClient) {
    const saved = localStorage.getItem('freert_reviews');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        return list.filter((r: any) => r.product_id === productId);
      } catch (e) {}
    }
  }
  return [];
};

export const createProductReview = async (review: any): Promise<void> => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').insert(review);
      return;
    } catch (e) {}
  }

  if (isClient) {
    const existing = localStorage.getItem('freert_reviews');
    const list = existing ? JSON.parse(existing) : [];
    localStorage.setItem('freert_reviews', JSON.stringify([review, ...list]));
  }
};
