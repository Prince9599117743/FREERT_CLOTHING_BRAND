-- 1. Function to decrease stock when an item is ordered
CREATE OR REPLACE FUNCTION public.handle_stock_on_order_item_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE public.product_variants
        SET stock_qty = COALESCE(stock_qty, 0) - NEW.qty,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on order item insert
DROP TRIGGER IF EXISTS on_order_item_insert ON public.order_items;
CREATE TRIGGER on_order_item_insert
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_stock_on_order_item_insert();


-- 2. Function to restore stock when an order is cancelled or refunded
CREATE OR REPLACE FUNCTION public.handle_stock_on_order_cancel()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Run stock restore only if status shifts to 'cancelled' or 'refunded'
    IF (NEW.status = 'cancelled' OR NEW.status = 'refunded') AND 
       (OLD.status != 'cancelled' AND OLD.status != 'refunded') THEN
        
        FOR item IN 
            SELECT variant_id, qty 
            FROM public.order_items 
            WHERE order_id = NEW.id
        LOOP
            IF item.variant_id IS NOT NULL THEN
                UPDATE public.product_variants
                SET stock_qty = COALESCE(stock_qty, 0) + item.qty,
                    updated_at = NOW()
                WHERE id = item.variant_id;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on order update
DROP TRIGGER IF EXISTS on_order_status_update_stock ON public.orders;
CREATE TRIGGER on_order_status_update_stock
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_stock_on_order_cancel();
