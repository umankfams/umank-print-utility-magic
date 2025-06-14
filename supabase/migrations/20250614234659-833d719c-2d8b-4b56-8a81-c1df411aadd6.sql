
-- Add new columns to the customers table
ALTER TABLE public.customers 
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT, 
ADD COLUMN company TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Update the existing contact column to be more generic if needed
-- (keeping it as is since you still want it in the schema)
