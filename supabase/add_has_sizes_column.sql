-- Add has_sizes boolean column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_sizes BOOLEAN DEFAULT TRUE;
