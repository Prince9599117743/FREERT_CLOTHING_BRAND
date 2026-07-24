-- Add media type and video configuration columns to homepage_sections
ALTER TABLE public.homepage_sections 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) DEFAULT 'image',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS focal_point VARCHAR(50) DEFAULT 'center';
