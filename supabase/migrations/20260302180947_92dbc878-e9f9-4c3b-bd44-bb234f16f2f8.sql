
-- Ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stock NUMERIC NOT NULL DEFAULT 0,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  branch_id TEXT,
  quantity NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage ingredients" ON public.ingredients FOR ALL USING (true) WITH CHECK (true);

-- Product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage product_categories" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  stock NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC NOT NULL DEFAULT 1,
  category_id UUID REFERENCES public.product_categories(id),
  branch_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Product ingredients junction table
CREATE TABLE public.product_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id),
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage product_ingredients" ON public.product_ingredients FOR ALL USING (true) WITH CHECK (true);

-- Task templates table
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  ingredient_id UUID REFERENCES public.ingredients(id),
  product_id UUID REFERENCES public.products(id),
  is_subtask BOOLEAN NOT NULL DEFAULT false,
  parent_template_id UUID REFERENCES public.task_templates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage task_templates" ON public.task_templates FOR ALL USING (true) WITH CHECK (true);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  price NUMERIC NOT NULL DEFAULT 0,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT,
  parent_task_id UUID REFERENCES public.tasks(id),
  order_id UUID REFERENCES public.orders(id),
  ingredient_id UUID REFERENCES public.ingredients(id),
  product_id UUID REFERENCES public.products(id),
  task_type TEXT DEFAULT 'manual',
  deadline TIMESTAMP WITH TIME ZONE,
  assignee_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- Print jobs table
CREATE TABLE public.print_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pages INTEGER NOT NULL DEFAULT 1,
  copies INTEGER NOT NULL DEFAULT 1,
  color BOOLEAN NOT NULL DEFAULT false,
  double_sided BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage print_jobs" ON public.print_jobs FOR ALL USING (true) WITH CHECK (true);
