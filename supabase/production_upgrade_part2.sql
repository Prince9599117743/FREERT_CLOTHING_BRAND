-- ──────────────────────────────────────────────────────────────────────
-- FREERT PRODUCTION UPGRADE - PART 2
-- RUN THESE MIGRATIONS IN YOUR SUPABASE SQL EDITOR
-- ──────────────────────────────────────────────────────────────────────

-- 1. Create Product Colors configuration table
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

-- 2. Modify product_variants to reference public.product_colors
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color_id UUID REFERENCES public.product_colors(id) ON DELETE CASCADE;

-- 3. Redesign handle_new_user trigger to merge guest account profiles on login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Check if a user profile with the same email already exists in the profile table
  IF NEW.email IS NOT NULL AND NEW.email <> '' THEN
    SELECT id INTO existing_user_id FROM public.users WHERE email = NEW.email LIMIT 1;
    
    -- If profile exists under a different ID, merge their orders, addresses, cart, wishlist, and reviews
    IF existing_user_id IS NOT NULL AND existing_user_id <> NEW.id THEN
      
      -- Update Orders
      UPDATE public.orders SET user_id = NEW.id WHERE user_id = existing_user_id;
      
      -- Update Addresses
      UPDATE public.addresses SET user_id = NEW.id WHERE user_id = existing_user_id;
      
      -- Update Wishlist (ignore duplicate key constraint errors)
      BEGIN
        UPDATE public.wishlist SET user_id = NEW.id WHERE user_id = existing_user_id;
      EXCEPTION WHEN OTHERS THEN
        DELETE FROM public.wishlist WHERE user_id = existing_user_id;
      END;
      
      -- Update Cart (ignore duplicate key constraint errors)
      BEGIN
        UPDATE public.cart SET user_id = NEW.id WHERE user_id = existing_user_id;
      EXCEPTION WHEN OTHERS THEN
        DELETE FROM public.cart WHERE user_id = existing_user_id;
      END;
      
      -- Update Reviews (ignore duplicate key constraint errors)
      BEGIN
        UPDATE public.reviews SET user_id = NEW.id WHERE user_id = existing_user_id;
      EXCEPTION WHEN OTHERS THEN
        DELETE FROM public.reviews WHERE user_id = existing_user_id;
      END;

      -- Delete the duplicate legacy profile row
      DELETE FROM public.users WHERE id = existing_user_id;
    END IF;
  END IF;

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
  RETURN NEW; -- Safeguard to prevent signup/login process locks
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Product ratings trigger to compute average ratings immediately (excluding rejected reviews)
ALTER TABLE public.reviews ALTER COLUMN status SET DEFAULT 'approved';

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
