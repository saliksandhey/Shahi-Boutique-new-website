-- Add instagram_url to blogs table
ALTER TABLE IF EXISTS public.blogs 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;
