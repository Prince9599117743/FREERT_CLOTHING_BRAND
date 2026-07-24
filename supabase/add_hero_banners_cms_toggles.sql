-- Add CMS toggle columns to hero_banners table
ALTER TABLE public.hero_banners 
ADD COLUMN IF NOT EXISTS show_title BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_subtitle BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_button BOOLEAN DEFAULT true;
