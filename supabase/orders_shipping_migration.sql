-- Add Shipping Contact and Location columns directly to public.orders for robust order history and guest checkout support.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20);
