
-- Add category_id column to products table
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.product_categories(id);

-- Add index for better query performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
