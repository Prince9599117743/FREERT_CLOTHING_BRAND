-- 1. Add cancellation columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_request_status VARCHAR(50) DEFAULT 'none'; -- 'none', 'pending', 'approved', 'rejected'
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_admin_notes TEXT;

-- 2. Add delivery tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP WITH TIME ZONE;

-- 3. Add order, toggle, and status columns to hero_banners table
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS image_click_redirect BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS video_click_redirect BOOLEAN DEFAULT false;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;
