
-- Add missing columns to product_categories to match the existing component expectations
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Folder';
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
