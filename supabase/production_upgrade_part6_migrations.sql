-- 1. Add description and focal point options to public.hero_banners table
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS desktop_focal_point VARCHAR(50) DEFAULT 'center';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS mobile_focal_point VARCHAR(50) DEFAULT 'center';
