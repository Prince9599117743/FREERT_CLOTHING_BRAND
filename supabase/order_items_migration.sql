-- Add direct product reference and ordered variants details directly to public.order_items for robust order history snapshots.
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS size VARCHAR(50);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color VARCHAR(100);
