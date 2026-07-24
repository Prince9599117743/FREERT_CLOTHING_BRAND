-- ──────────────────────────────────────────────────────────────────────
-- FREERT PRODUCTION UPGRADE - PART 3 MIGRATIONS
-- RUN THESE MIGRATIONS IN YOUR SUPABASE SQL EDITOR
-- ──────────────────────────────────────────────────────────────────────

-- 1. Create table for manually curated "Complete the Look" product mappings
CREATE TABLE IF NOT EXISTS public.product_look_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    look_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, look_product_id)
);

-- Enable RLS on product_look_products
ALTER TABLE public.product_look_products ENABLE ROW LEVEL SECURITY;

-- Allow public read on look-products
DROP POLICY IF EXISTS "Allow public read product_look_products" ON public.product_look_products;
CREATE POLICY "Allow public read product_look_products" ON public.product_look_products FOR SELECT USING (true);

-- Allow admins to manage look-products
DROP POLICY IF EXISTS "Allow admin manage product_look_products" ON public.product_look_products;
CREATE POLICY "Allow admin manage product_look_products" ON public.product_look_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin'))
);


-- 2. Create table for Combo Offers
CREATE TABLE IF NOT EXISTS public.combo_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    product_a_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_b_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    combo_price NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_a_id, product_b_id)
);

-- Enable RLS on combo_offers
ALTER TABLE public.combo_offers ENABLE ROW LEVEL SECURITY;

-- Allow public read on combo_offers
DROP POLICY IF EXISTS "Allow public read combo_offers" ON public.combo_offers;
CREATE POLICY "Allow public read combo_offers" ON public.combo_offers FOR SELECT USING (true);

-- Allow admins to manage combo_offers
DROP POLICY IF EXISTS "Allow admin manage combo_offers" ON public.combo_offers;
CREATE POLICY "Allow admin manage combo_offers" ON public.combo_offers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin'))
);


-- 3. Add custom price_override column to cart table to enable combo discount tracking
ALTER TABLE public.cart ADD COLUMN IF NOT EXISTS price_override NUMERIC;
