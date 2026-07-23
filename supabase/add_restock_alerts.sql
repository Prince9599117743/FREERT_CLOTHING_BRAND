-- 1. Restock Alerts Table create karein
CREATE TABLE IF NOT EXISTS public.restock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. RLS secure rules set karein
ALTER TABLE public.restock_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert restock_alerts" ON public.restock_alerts;
CREATE POLICY "Allow public insert restock_alerts" ON public.restock_alerts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin manage restock_alerts" ON public.restock_alerts;
CREATE POLICY "Allow admin manage restock_alerts" ON public.restock_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin'))
);
