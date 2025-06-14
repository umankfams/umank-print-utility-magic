
-- Create dedicated product_categories table
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrate existing product categories from categories table
INSERT INTO public.product_categories (key, label, icon, color, is_default, created_at, updated_at)
SELECT key, label, icon, color, is_default, created_at, updated_at 
FROM public.categories 
WHERE type = 'product';

-- If no product categories exist in categories table, insert default ones
INSERT INTO public.product_categories (key, label, icon, color, is_default) 
SELECT * FROM (VALUES
  ('kartu-nama', 'Kartu Nama', 'CreditCard', '#3B82F6', true),
  ('brosur', 'Brosur', 'File', '#10B981', true),
  ('flyer', 'Flyer', 'FileText', '#F59E0B', true),
  ('poster', 'Poster', 'Image', '#EF4444', true),
  ('banner', 'Banner', 'Image', '#8B5CF6', true),
  ('stiker', 'Stiker', 'Tag', '#EC4899', true),
  ('undangan', 'Undangan', 'Calendar', '#06B6D4', true),
  ('kalender', 'Kalender', 'Calendar', '#84CC16', true),
  ('amplop', 'Amplop', 'Folder', '#F97316', true),
  ('nota', 'Nota', 'Clipboard', '#64748B', true),
  ('kop-surat', 'Kop Surat', 'FileText', '#0EA5E9', true),
  ('yasin', 'Yasin', 'Book', '#22C55E', true),
  ('lainnya', 'Lainnya', 'Folder', '#6B7280', true)
) AS defaults(key, label, icon, color, is_default)
WHERE NOT EXISTS (SELECT 1 FROM public.product_categories);

-- Create updated_at trigger
CREATE TRIGGER product_categories_updated_at 
  BEFORE UPDATE ON public.product_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Enable all operations for product_categories" 
  ON public.product_categories 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
