-- 1. Trigger function definition
CREATE OR REPLACE FUNCTION public.create_default_product_variant()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.product_variants (product_id, size, color, sku, stock_qty, additional_price)
    VALUES (
        NEW.id,
        'One Size',
        'Default',
        'SKU-' || NEW.slug || '-' || substring(md5(random()::text) from 1 for 6),
        COALESCE(NEW.stock_qty, 10),
        0.00
    )
    ON CONFLICT (sku) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to products table
DROP TRIGGER IF EXISTS on_product_created ON public.products;
CREATE TRIGGER on_product_created
AFTER INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.create_default_product_variant();
