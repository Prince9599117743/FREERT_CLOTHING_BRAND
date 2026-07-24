-- Add media columns and primary slider fields to hero_banners
ALTER TABLE public.hero_banners 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) DEFAULT 'image',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS focal_point VARCHAR(50) DEFAULT 'center',
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Trigger function to ensure only one hero slide is marked as primary
CREATE OR REPLACE FUNCTION public.handle_primary_hero_banner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.hero_banners 
    SET is_primary = false 
    WHERE id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute before insert or update of is_primary column
DROP TRIGGER IF EXISTS on_primary_hero_banner_change ON public.hero_banners;
CREATE TRIGGER on_primary_hero_banner_change
  BEFORE INSERT OR UPDATE OF is_primary ON public.hero_banners
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION public.handle_primary_hero_banner();
