-- Database Schema Upgrades for Hero Slides and Homepage Sections

-- 1. Make image_url nullable in public.hero_banners to allow video-only banners
ALTER TABLE public.hero_banners ALTER COLUMN image_url DROP NOT NULL;

-- 2. Add missing columns to public.hero_banners table safely
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) DEFAULT 'image';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS poster_url TEXT DEFAULT '';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS focal_point VARCHAR(50) DEFAULT 'center';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS image_click_redirect BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS video_click_redirect BOOLEAN DEFAULT false;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS show_description BOOLEAN DEFAULT true;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS desktop_focal_point VARCHAR(50) DEFAULT 'center';
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS mobile_focal_point VARCHAR(50) DEFAULT 'center';

-- 3. Add missing columns to public.homepage_sections table safely
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS show_title BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS show_subtitle BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS show_button BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS image_click_redirect BOOLEAN DEFAULT true;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) DEFAULT 'image';
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS poster_url TEXT DEFAULT '';
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS focal_point VARCHAR(50) DEFAULT 'center';
