
-- Finance categories table
CREATE TABLE public.finance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for now)
CREATE POLICY "Anyone can view finance categories" ON public.finance_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert finance categories" ON public.finance_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update finance categories" ON public.finance_categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete finance categories" ON public.finance_categories FOR DELETE USING (true);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Seed default finance categories
INSERT INTO public.finance_categories (key, label, type, icon, color) VALUES
  ('salary', 'Gaji', 'income', '💵', '#10b981'),
  ('freelance', 'Freelance', 'income', '💻', '#3b82f6'),
  ('investment', 'Investasi', 'income', '📈', '#8b5cf6'),
  ('other_income', 'Lainnya', 'income', '💰', '#6366f1'),
  ('food', 'Makanan', 'expense', '🍔', '#ef4444'),
  ('transport', 'Transportasi', 'expense', '🚗', '#f97316'),
  ('shopping', 'Belanja', 'expense', '🛒', '#eab308'),
  ('bills', 'Tagihan', 'expense', '📄', '#14b8a6'),
  ('entertainment', 'Hiburan', 'expense', '🎬', '#ec4899'),
  ('health', 'Kesehatan', 'expense', '🏥', '#06b6d4'),
  ('education', 'Pendidikan', 'expense', '📚', '#8b5cf6'),
  ('other_expense', 'Lainnya', 'expense', '📦', '#6b7280');
