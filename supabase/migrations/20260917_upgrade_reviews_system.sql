-- Migration: Upgrade Reviews Table for Real Customer Review System
-- Supports both Product Reviews & Store Testimonials, Photo uploads, Ratings, Verified Buyer status, Admin Replies, and Homepage Featuring.

ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS customer_name VARCHAR,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR,
ADD COLUMN IF NOT EXISTS customer_country VARCHAR DEFAULT 'IN',
ADD COLUMN IF NOT EXISTS customer_city VARCHAR,
ADD COLUMN IF NOT EXISTS title VARCHAR,
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_verified_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured_home BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_type VARCHAR DEFAULT 'PRODUCT',
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Drop unique constraint if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_id_product_id_key'
    ) THEN
        ALTER TABLE public.reviews DROP CONSTRAINT reviews_user_id_product_id_key;
    END IF;
END $$;

-- Allow guest reviews and store reviews
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reviews ALTER COLUMN product_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (approved = true OR auth.uid() = user_id);

-- Insert policy for everyone (moderated by default)
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews" ON public.reviews
FOR INSERT WITH CHECK (true);
