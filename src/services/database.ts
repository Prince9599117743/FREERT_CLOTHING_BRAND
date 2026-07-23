import { supabase } from '@/lib/supabase';
import type { Product, Category, Collection, Address, Order, Coupon, Review } from '@/types';

const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
};

const isProduction = process.env.NODE_ENV === 'production';
const isClient = typeof window !== 'undefined';

// Enforce backend connectivity validation
const verifyConnection = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('DATABASE_CONNECTION_ERROR');
  }
};

// ─────────────────────────────────────────────
// 1. PRODUCTS
// ─────────────────────────────────────────────

const mapProduct = (row: any): Product => ({
  ...row,
  basePrice: row.base_price ?? row.basePrice,
  mrp: row.mrp,
  isPublished: row.is_published ?? row.isPublished,
  stockQty: row.stock_qty ?? row.stockQty ?? 0,
  parentCategory: row.parent_category ?? row.parentCategory,
  subCategory: row.sub_category ?? row.subCategory,
  tags: row.tags || [],
  rating: row.rating || 0,
  reviewsCount: row.reviews_count ?? row.reviewsCount ?? 0,
  createdAt: row.created_at ?? row.createdAt,
  updatedAt: row.updated_at ?? row.updatedAt,
});

export const getProducts = async (): Promise<Product[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      collection:collections(*),
      variants:product_variants(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  verifyConnection();
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
  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapProduct(data) : null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  verifyConnection();
  const payload = {
    name: product.name,
    slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: product.description || '',
    short_description: (product as any).shortDescription || '',
    base_price: product.basePrice,
    mrp: product.mrp || product.basePrice,
    is_published: product.isPublished ?? true,
    images: product.images || [],
    brand: product.brand || 'Made in India',
    category_id: product.categoryId || null,
    collection_id: product.collectionId || null,
    stock_qty: product.stockQty ?? 10,
    parent_category: product.parentCategory || null,
    sub_category: product.subCategory || null,
    tags: product.tags || [],
    rating: product.rating || 0,
    reviews_count: product.reviewsCount || 0,
  };
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  verifyConnection();
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if ((updates as any).shortDescription !== undefined) payload.short_description = (updates as any).shortDescription;
  if (updates.basePrice !== undefined) payload.base_price = updates.basePrice;
  if (updates.mrp !== undefined) payload.mrp = updates.mrp;
  if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;
  if (updates.images !== undefined) payload.images = updates.images;
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId || null;
  if (updates.collectionId !== undefined) payload.collection_id = updates.collectionId || null;
  if (updates.stockQty !== undefined) payload.stock_qty = updates.stockQty;
  if ((updates as any).status !== undefined) payload.status = (updates as any).status;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.parentCategory !== undefined) payload.parent_category = updates.parentCategory || null;
  if (updates.subCategory !== undefined) payload.sub_category = updates.subCategory || null;
  if ((updates as any).seoTitle !== undefined) payload.seo_title = (updates as any).seoTitle;
  if ((updates as any).seoDescription !== undefined) payload.seo_description = (updates as any).seoDescription;
  if (updates.rating !== undefined) payload.rating = updates.rating;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

export const uploadMedia = async (file: File, folder: string = 'products'): Promise<string> => {
  verifyConnection();
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const { data, error } = await supabase.storage.from('freert_media').upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('freert_media').getPublicUrl(data.path);
  return publicUrl;
};

export const deleteMedia = async (url: string): Promise<void> => {
  verifyConnection();
  // Extract path from URL
  const marker = '/freert_media/';
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.substring(idx + marker.length);
  await supabase.storage.from('freert_media').remove([path]);
};

// ─────────────────────────────────────────────
// 3. CATEGORIES & COLLECTIONS
// ─────────────────────────────────────────────

export const getCategories = async (): Promise<Category[]> => {
  verifyConnection();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image_url,
    parentCategory: item.parent_category,
    createdAt: item.created_at
   })) as Category[];
};

export const createCategory = async (category: { name: string; slug: string; description?: string; imageUrl?: string; parentCategory?: string | null }): Promise<Category> => {
  verifyConnection();
  const { data, error } = await supabase.from('categories').insert({
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image_url: category.imageUrl || '',
    parent_category: category.parentCategory || null
  }).select().single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    imageUrl: data.image_url,
    parentCategory: data.parent_category,
    createdAt: data.created_at
  } as Category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

export const getCollections = async (): Promise<Collection[]> => {
  verifyConnection();
  const { data, error } = await supabase.from('collections').select('*').order('name');
  if (error) throw error;
  return (data || []) as Collection[];
};

// ─────────────────────────────────────────────
// 4. ADDRESSES
// ─────────────────────────────────────────────

export const getAddresses = async (userId: string): Promise<Address[]> => {
  verifyConnection();
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []) as Address[];
};

export const saveAddress = async (address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> => {
  verifyConnection();
  const { data, error } = await supabase.from('addresses').insert({
    user_id: address.userId,
    address_type: address.addressType,
    street: address.street,
    city: address.city,
    state: address.state,
    country: address.country || 'India',
    postal_code: address.postalCode,
    is_default: address.isDefault,
  }).select().single();
  if (error) throw error;
  return data as Address;
};

// ─────────────────────────────────────────────
// 5. ORDERS
// ─────────────────────────────────────────────

export const getOrders = async (userId: string): Promise<Order[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('orders')
    .select(`*, items:order_items(*, variant:product_variants(*, product:products(*))), payment:payments(*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Order[];
};

export const getAllOrders = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, email, full_name, phone),
      items:order_items(*, variant:product_variants(*, product:products(name))),
      payment:payments(provider, status)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, items: any[]): Promise<Order> => {
  verifyConnection();
  const payload: any = {
    total_amount: order.totalAmount,
    discount_amount: order.discountAmount,
    status: order.status,
  };
  if (order.userId) payload.user_id = order.userId;
  if (order.shippingAddressId) payload.shipping_address_id = order.shippingAddressId;
  if (order.couponId) payload.coupon_id = order.couponId;

  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) throw error;

  if (items && items.length > 0) {
    const itemsPayload = items.map((item: any) => ({
      order_id: data.id,
      variant_id: item.variantId || null,
      qty: item.qty || 1,
      unit_price: item.variant?.product?.basePrice || item.price || 0,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsError) throw itemsError;
  }
  return data as Order;
};

// ─────────────────────────────────────────────
// 6. CUSTOMERS (Admin)
// ─────────────────────────────────────────────

export const getAllCustomers = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ─────────────────────────────────────────────
// 7. WISHLIST
// ─────────────────────────────────────────────

export const getWishlist = async (userId: string): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, product:products(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 8. COUPONS
// ─────────────────────────────────────────────

export const getCoupons = async (): Promise<Coupon[]> => {
  verifyConnection();
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Coupon[];
};

export const createCoupon = async (coupon: Omit<Coupon, 'id' | 'createdAt' | 'currentUses'>): Promise<Coupon> => {
  verifyConnection();
  const { data, error } = await supabase.from('coupons').insert({
    code: coupon.code.toUpperCase(),
    discount_percentage: coupon.discountPercentage,
    max_uses: coupon.maxUses,
    active_from: coupon.activeFrom,
    active_to: coupon.activeTo,
  }).select().single();
  if (error) throw error;
  return data as Coupon;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
};

export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .lte('active_from', new Date().toISOString())
    .gte('active_to', new Date().toISOString())
    .single();
  if (error) return null;
  const coupon = data as Coupon;
  if (coupon.currentUses >= coupon.maxUses) return null;
  return coupon;
};

// ─────────────────────────────────────────────
// 9. REVIEWS
// ─────────────────────────────────────────────

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(full_name)')
    .eq('product_id', productId)
    .eq('status', 'approved')   // Only show approved reviews on product page
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Review[];
};

export const getAdminReviews = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(full_name, email), product:products(name)')
    .order('created_at', { ascending: false }); // Admin sees ALL reviews (pending + approved + rejected)
  if (error) throw error;
  return data || [];
};

export const createProductReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('reviews').insert({
    user_id: review.userId,
    product_id: review.productId,
    rating: review.rating,
    comment: review.comment || '',
    status: 'pending',  // Always start as pending — admin must approve
  });
  if (error) throw error;
};

export const approveReview = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('reviews').update({ status: 'approved' }).eq('id', id);
  if (error) throw error;
};

export const rejectReview = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('reviews').update({ status: 'rejected' }).eq('id', id);
  if (error) throw error;
};

export const deleteReview = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 10. SUPPORT TICKETS
// ─────────────────────────────────────────────

export const createSupportTicket = async (ticket: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('support_tickets').insert(ticket);
  if (error) throw error;
};

export const getAdminSupportTickets = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateTicketStatus = async (id: string, status: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 11. NEWSLETTER
// ─────────────────────────────────────────────

export const subscribeNewsletter = async (email: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('newsletter').upsert({ email, status: 'subscribed' }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) throw error;
};

export const getNewsletterSubscribers = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('newsletter')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ─────────────────────────────────────────────
// 12. SITE SETTINGS
// ─────────────────────────────────────────────

export const getSiteSettings = async (): Promise<Record<string, string>> => {
  verifyConnection();
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings: Record<string, string> = {};
  (data || []).forEach((row: any) => { settings[row.key] = row.value; });
  return settings;
};

export const saveSiteSetting = async (key: string, value: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 13. HERO BANNERS
// ─────────────────────────────────────────────

export const getHeroBanners = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const saveHeroBanner = async (banner: { imageUrl: string; heading: string; subtitle?: string; ctaText?: string; ctaLink?: string }): Promise<any> => {
  verifyConnection();
  const { data, error } = await supabase.from('hero_banners').insert({
    image_url: banner.imageUrl,
    heading: banner.heading,
    subtitle: banner.subtitle || '',
    cta_text: banner.ctaText || 'Shop Now',
    cta_link: banner.ctaLink || '/shop',
  }).select().single();
  if (error) throw error;
  return data;
};

export const seedDefaultHeroBanners = async (): Promise<any[]> => {
  verifyConnection();
  const defaults = [
    { image_url: '/assets/trench_coat.jpg', heading: 'BE YOU.', subtitle: 'BE BOLD. BE FREERT.', cta_text: 'Shop Now', cta_link: '/shop' },
    { image_url: '/assets/slip_dress.jpg', heading: 'New Season Collection', subtitle: 'Autumn / Winter Edit 2026', cta_text: 'Explore Collection', cta_link: '/shop/new-arrivals' },
    { image_url: '/assets/kimono_shirt.jpg', heading: 'Luxury Everyday Wear', subtitle: 'Comfort Tailored in Small Batches', cta_text: 'Discover More', cta_link: '/shop' },
    { image_url: '/assets/silk_trouser.jpg', heading: 'Timeless Streetwear', subtitle: 'Structure for Identity and Expression', cta_text: 'Shop Bottoms', cta_link: '/shop/men/cargo-pants' },
    { image_url: '/assets/knit_hoodie.jpg', heading: 'Minimal Luxury', subtitle: 'Organic Weaves and Soft Textures', cta_text: 'Shop Knitwear', cta_link: '/shop/men/hoodies' },
    { image_url: '/assets/cap_1784646670746.png', heading: 'Modern Identity', subtitle: 'Finishing Details for the Modern Wardrobe', cta_text: 'Shop Accessories', cta_link: '/shop/accessories' },
    { image_url: '/assets/sneakers_1784646656235.png', heading: 'Premium Essentials', subtitle: 'Sandalwood Santal & Intense Scents', cta_text: 'Shop Perfumes', cta_link: '/shop/perfumes' }
  ];
  const { data, error } = await supabase.from('hero_banners').insert(defaults).select();
  if (error) throw error;
  return data || [];
};

export const updateHeroBanner = async (id: string, updates: Partial<{ imageUrl: string; heading: string; subtitle: string; ctaText: string; ctaLink: string }>): Promise<any> => {
  verifyConnection();
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.heading !== undefined) payload.heading = updates.heading;
  if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
  if (updates.ctaText !== undefined) payload.cta_text = updates.ctaText;
  if (updates.ctaLink !== undefined) payload.cta_link = updates.ctaLink;
  const { data, error } = await supabase.from('hero_banners').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteHeroBanner = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('hero_banners').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 14. HOMEPAGE SECTIONS
// ─────────────────────────────────────────────

export const getHomepageSections = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('"order"', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const saveHomepageSections = async (sections: any[]): Promise<void> => {
  verifyConnection();
  for (const section of sections) {
    const payload = {
      id: section.id,
      title: section.title,
      subtitle: section.subtitle || '',
      banner_image: section.bannerImage || '', 
      cta_text: section.ctaText || '',
      cta_link: section.ctaLink || '',
      visible: section.visible ?? true,
      order: section.order || 0,
      featured_product_ids: section.featuredProductIds || [],
      show_title: section.showTitle ?? true,
      show_subtitle: section.showSubtitle ?? true,
      show_button: section.showButton ?? true,
      image_click_redirect: section.imageClickRedirect ?? true,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('homepage_sections').upsert(payload, { onConflict: 'id' });
  }
};

// ─────────────────────────────────────────────
// 15. EDITORIAL JOURNAL
// ─────────────────────────────────────────────

export const getEditorialJournal = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('editorial_journal')
    .select('*')
    .order('"order"', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const saveEditorialJournalItem = async (item: { id?: string; imageUrl: string; linkUrl: string; order?: number }): Promise<any> => {
  verifyConnection();
  const payload = {
    image_url: item.imageUrl,
    link_url: item.linkUrl,
    "order": item.order || 0,
    updated_at: new Date().toISOString()
  };

  if (item.id) {
    const { data, error } = await supabase
      .from('editorial_journal')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('editorial_journal')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteEditorialJournalItem = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase
    .from('editorial_journal')
    .delete()
    .eq('id', id);
  if (error) throw error;
};


// ─────────────────────────────────────────────
// 15. ACTIVITY LOGS
// ─────────────────────────────────────────────

export const logActivity = async (action: string, details?: string, userId?: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId || null,
      action,
      details: details || '',
    });
  } catch (e) {
    // Non-critical — never throw from logging
  }
};

// ─────────────────────────────────────────────
// 16. ADMIN DASHBOARD AGGREGATES
// ─────────────────────────────────────────────

export const getDashboardStats = async (): Promise<{
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
}> => {
  verifyConnection();
  const [ordersRes, customersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('total_amount, status'),
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'customer'),
    supabase.from('products').select('id, stock_qty, status'),
  ]);

  const orders = ordersRes.data || [];
  const totalRevenue = orders
    .filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'processing' || o.status === 'pending').length;

  const products = productsRes.data || [];
  const lowStockCount = products.filter((p: any) => (p.stock_qty || 0) > 0 && (p.stock_qty || 0) <= 5).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: customersRes.count || 0,
    totalProducts: products.length,
    lowStockCount,
    pendingOrders,
  };
};

// ─────────────────────────────────────────────
// 19. RESTOCK ALERTS / NOTIFY REQUESTS
// ─────────────────────────────────────────────

export const createRestockAlert = async (productId: string, userId: string | null, email: string): Promise<any> => {
  verifyConnection();
  const { data, error } = await supabase.from('restock_alerts').insert({
    product_id: productId,
    user_id: userId,
    email: email
  }).select().single();
  if (error) throw error;
  return data;
};

export const getRestockAlerts = async (): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('restock_alerts')
    .select('*, product:products(name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const deleteRestockAlert = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('restock_alerts').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// 20. PRODUCT DETAILS ACCORDION SECTIONS
// ─────────────────────────────────────────────

export const getProductDetailsSections = async (productId: string): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('product_details_sections')
    .select('*')
    .eq('product_id', productId)
    .eq('enabled', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const getAdminProductDetailsSections = async (productId: string): Promise<any[]> => {
  verifyConnection();
  const { data, error } = await supabase
    .from('product_details_sections')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const saveProductDetailsSection = async (section: { 
  id?: string; 
  productId: string; 
  title: string; 
  content: string; 
  displayOrder: number; 
  enabled: boolean; 
}): Promise<any> => {
  verifyConnection();
  const payload = {
    product_id: section.productId,
    title: section.title,
    content: section.content,
    display_order: section.displayOrder,
    enabled: section.enabled
  };
  
  if (section.id) {
    const { data, error } = await supabase
      .from('product_details_sections')
      .update(payload)
      .eq('id', section.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('product_details_sections')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const deleteProductDetailsSection = async (id: string): Promise<void> => {
  verifyConnection();
  const { error } = await supabase.from('product_details_sections').delete().eq('id', id);
  if (error) throw error;
};
