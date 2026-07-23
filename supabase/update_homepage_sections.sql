-- Homepage sections me dynamic options control columns add karein
ALTER TABLE public.homepage_sections
ADD COLUMN IF NOT EXISTS show_title BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_subtitle BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_button BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS image_click_redirect BOOLEAN DEFAULT TRUE;
