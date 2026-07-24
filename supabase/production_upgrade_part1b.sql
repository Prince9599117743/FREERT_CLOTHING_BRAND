-- ──────────────────────────────────────────────────────────────────────
-- FREERT PRODUCTION UPGRADE - PART 1B
-- RUN THESE MIGRATIONS IN YOUR SUPABASE SQL EDITOR
-- ──────────────────────────────────────────────────────────────────────

-- 1. Correct Order Relationship target (point to public.users profiles)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Drop NOT NULL on email in public.users to safeguard other OAuth triggers
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- 3. Expand Order Status ENUM options
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'packed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'refunded';

-- 4. Add Source tracker to Newsletter subscriptions
ALTER TABLE public.newsletter ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'homepage';

-- 5. Add Variant relation to Restock alerts
ALTER TABLE public.restock_alerts ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- 6. Add Coupon Engine validation metadata columns
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. Add Subcategory parent column to Categories schema
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_category VARCHAR(100);
