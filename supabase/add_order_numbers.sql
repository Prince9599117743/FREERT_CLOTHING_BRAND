-- 1. Order Number Sequence create karein starting at 1001
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;

-- 2. Add order_number column to orders table with default value from sequence
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number INT DEFAULT nextval('public.order_number_seq');
