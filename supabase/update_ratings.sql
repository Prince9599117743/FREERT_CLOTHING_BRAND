-- 1. Products table me rating aur reviews_count columns add karein
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;

-- 2. Trigger function to compute average rating and reviews count for a product
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    p_id UUID;
    avg_r NUMERIC(3,2);
    cnt INT;
BEGIN
    -- Determine which product_id needs updating
    IF TG_OP = 'DELETE' THEN
        p_id := OLD.product_id;
    ELSE
        p_id := NEW.product_id;
    END IF;

    -- Calculate stats from approved reviews only
    SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2), COUNT(*)
    INTO avg_r, cnt
    FROM public.reviews
    WHERE product_id = p_id AND status = 'approved';

    -- Update products table
    UPDATE public.products
    SET rating = avg_r,
        reviews_count = cnt
    WHERE id = p_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to reviews table
DROP TRIGGER IF EXISTS on_review_changes ON public.reviews;
CREATE TRIGGER on_review_changes
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating_stats();
