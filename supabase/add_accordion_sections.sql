-- 1. Product details expandable accordion sections table create karein
CREATE TABLE IF NOT EXISTS public.product_details_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    display_order INT DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. RLS secure rules set karein
ALTER TABLE public.product_details_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read product_details_sections" ON public.product_details_sections;
CREATE POLICY "Allow public read product_details_sections" ON public.product_details_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage product_details_sections" ON public.product_details_sections;
CREATE POLICY "Allow admin manage product_details_sections" ON public.product_details_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin'))
);
