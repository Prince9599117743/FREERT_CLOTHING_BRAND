import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS } from './mockData';
import type { Product, Category, Collection, Address, Order } from '@/types';

const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined;
};

// 1. PRODUCT SERVICE METHODS
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS;
  }
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
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
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
  if (error) return null;
  return data as Product;
};

// 2. CATEGORIES & COLLECTIONS METHODS
export const getCategories = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return MOCK_CATEGORIES;
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data as Category[];
};

export const getCollections = async (): Promise<Collection[]> => {
  if (!isSupabaseConfigured()) return MOCK_COLLECTIONS;
  const { data, error } = await supabase.from('collections').select('*');
  if (error) throw error;
  return data as Collection[];
};

// 3. ADDRESSES METHODS (Enforce connectivity checks)
export const getAddresses = async (userId: string): Promise<Address[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data as Address[];
};

export const saveAddress = async (address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  const { data, error } = await supabase
    .from('addresses')
    .insert(address)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
};

// 4. TRANSACTION ORDERS METHODS
export const getOrders = async (userId: string): Promise<Order[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
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
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, items: any[]): Promise<Order> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
    
  if (error) throw error;
  
  const itemsWithOrderId = items.map(item => ({ ...item, order_id: data.id }));
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);
    
  if (itemsError) throw itemsError;
  return data as Order;
};

// 5. SUPPORT TICKETS & REVIEWS
export const createSupportTicket = async (ticket: { name: string; email: string; message: string }): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  const { error } = await supabase.from('support_tickets').insert(ticket);
  if (error) throw error;
};
export const getProductReviews = async (productId: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId);
  if (error) throw error;
  return data;
};

export const createProductReview = async (review: any): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_OFFLINE');
  }
  const { error } = await supabase.from('reviews').insert(review);
  if (error) throw error;
};
