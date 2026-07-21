import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS } from './mockData';
import type { Product, Category, Collection, Address, Order } from '@/types';

const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

// Enforce backend connectivity validation in production
const verifyConnection = () => {
  if (!isSupabaseConfigured()) {
    if (isProduction) {
      throw new Error("DATABASE_CONNECTION_ERROR");
    }
  }
};

// Helper to check if execution is on client
const isClient = typeof window !== 'undefined';

// 1. PRODUCT SERVICE METHODS
export const getProducts = async (): Promise<Product[]> => {
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        collection:collections(*),
        variants:product_variants(*)
      `);
    if (error) throw error;
    return data as Product[];
  }

  // Fallback to local storage (Development only)
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
  verifyConnection();
  if (isSupabaseConfigured()) {
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
    if (error) throw error;
    return data as Product;
  }

  // Local storage find fallback (Development only)
  const list = await getProducts();
  return list.find(p => p.slug === slug) || null;
};

// 2. CATEGORIES & COLLECTIONS METHODS
export const getCategories = async (): Promise<Category[]> => {
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data as Category[];
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw error;
    return data as Collection[];
  }
  return MOCK_COLLECTIONS;
};

// 3. ADDRESSES METHODS
export const getAddresses = async (userId: string): Promise<Address[]> => {
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data as Address[];
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();
    if (error) throw error;
    return data as Address;
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment:payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Order[];
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
      
    if (error) throw error;
    
    const itemsWithOrderId = items.map(item => ({ ...item, order_id: data.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);
    if (itemsError) throw itemsError;

    return data as Order;
  }

  // Fallback to local storage logs (Development only)
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('support_tickets').insert(ticket);
    if (error) throw error;
    return;
  }
  if (isClient) {
    const existing = localStorage.getItem('freert_support_tickets');
    const list = existing ? JSON.parse(existing) : [];
    localStorage.setItem('freert_support_tickets', JSON.stringify([ticket, ...list]));
  }
};

export const getProductReviews = async (productId: string): Promise<any[]> => {
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId);
    if (error) throw error;
    return data;
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
  verifyConnection();
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('reviews').insert(review);
    if (error) throw error;
    return;
  }

  if (isClient) {
    const existing = localStorage.getItem('freert_reviews');
    const list = existing ? JSON.parse(existing) : [];
    localStorage.setItem('freert_reviews', JSON.stringify([review, ...list]));
  }
};
