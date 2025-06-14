
-- Add new columns to the ingredients table
ALTER TABLE public.ingredients 
ADD COLUMN quantity NUMERIC DEFAULT 0,
ADD COLUMN notes TEXT;
