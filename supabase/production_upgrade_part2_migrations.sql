-- ──────────────────────────────────────────────────────────────────────
-- FREERT PRODUCTION UPGRADE - PART 2 MIGRATIONS
-- RUN THESE MIGRATIONS IN YOUR SUPABASE SQL EDITOR
-- ──────────────────────────────────────────────────────────────────────

-- 1. Add status and track_quantity columns to products table if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published',
ADD COLUMN IF NOT EXISTS track_quantity BOOLEAN DEFAULT TRUE;

-- 2. Add rating and reviews_count columns to products if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;

-- 3. Clean up any existing duplicate variants before adding the unique constraint
DELETE FROM public.product_variants a 
USING public.product_variants b 
WHERE a.id < b.id 
  AND a.product_id = b.product_id 
  AND a.color = b.color 
  AND a.size = b.size;

-- 4. Add unique constraint to product_variants to prevent duplicates and enable onConflict upserts
ALTER TABLE public.product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_color_size_key;

ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_product_id_color_size_key UNIQUE (product_id, color, size);


-- 5. Create Product Colors configuration table
CREATE TABLE IF NOT EXISTS public.product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(50) DEFAULT '#FFFFFF', -- hex code
    color_image TEXT, -- swatch image url
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color_name)
);

-- Enable RLS on product_colors
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

-- Allow public read on product_colors
DROP POLICY IF EXISTS "Allow public read product_colors" ON public.product_colors;
CREATE POLICY "Allow public read product_colors" ON public.product_colors FOR SELECT USING (true);

-- Allow admins to manage product_colors
DROP POLICY IF EXISTS "Allow admin manage product_colors" ON public.product_colors;
CREATE POLICY "Allow admin manage product_colors" ON public.product_colors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin'))
);

-- 6. Modify product_variants to reference public.product_colors
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color_id UUID REFERENCES public.product_colors(id) ON DELETE CASCADE;


-- 7. Set default status of reviews to approved (visible instantly)
ALTER TABLE public.reviews ALTER COLUMN status SET DEFAULT 'approved';

-- 8. Trigger function to compute average rating and reviews count for a product (excluding rejected ones)
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    p_id UUID;
    avg_r NUMERIC(3,2);
    cnt INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        p_id := OLD.product_id;
    ELSE
        p_id := NEW.product_id;
    END IF;

    -- Calculate average rating and reviews count excluding rejected entries
    SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2), COUNT(*)
    INTO avg_r, cnt
    FROM public.reviews
    WHERE product_id = p_id AND status <> 'rejected';

    -- Update products stats
    UPDATE public.products
    SET rating = avg_r,
        reviews_count = cnt
    WHERE id = p_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to reviews table
DROP TRIGGER IF EXISTS on_review_changes ON public.reviews;
CREATE TRIGGER on_review_changes
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating_stats();


-- 9. Redesigned handle_new_user Trigger to safely insert user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the new logged-in user profile
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_app_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, users.phone, '');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Safeguard to prevent Auth signup/OAuth login failures
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
