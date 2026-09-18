-- =========================================================================
-- SHAHI BOUTIQUE — DEDICATED INTERNATIONAL ORDERS SCHEMA
-- Migration: 20260919_dedicated_international_orders.sql
-- =========================================================================

-- 1. Create dedicated `international_orders` table
CREATE TABLE IF NOT EXISTS public.international_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_address TEXT NOT NULL,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  payment_status TEXT NOT NULL DEFAULT 'PENDING_QUOTE',
  courier_name TEXT DEFAULT 'DHL Express Worldwide',
  tracking_number TEXT,
  tracking_url TEXT,
  payment_link TEXT,
  staff_notes TEXT,
  custom_notes TEXT,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  raw_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create dedicated `international_order_items` table
CREATE TABLE IF NOT EXISTS public.international_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  international_order_id UUID NOT NULL REFERENCES public.international_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create dedicated `international_order_timeline` table
CREATE TABLE IF NOT EXISTS public.international_order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  international_order_id UUID NOT NULL REFERENCES public.international_orders(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_int_orders_order_number ON public.international_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_int_orders_customer_email ON public.international_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_int_orders_country ON public.international_orders(country);
CREATE INDEX IF NOT EXISTS idx_int_orders_order_status ON public.international_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_int_orders_user_id ON public.international_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_int_order_items_order_id ON public.international_order_items(international_order_id);
CREATE INDEX IF NOT EXISTS idx_int_timeline_order_id ON public.international_order_timeline(international_order_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.international_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_order_timeline ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow insert international_orders" ON public.international_orders;
DROP POLICY IF EXISTS "Allow insert international_order_items" ON public.international_order_items;
DROP POLICY IF EXISTS "Allow insert international_order_timeline" ON public.international_order_timeline;
DROP POLICY IF EXISTS "Allow select international_orders" ON public.international_orders;
DROP POLICY IF EXISTS "Allow select international_order_items" ON public.international_order_items;
DROP POLICY IF EXISTS "Allow select international_order_timeline" ON public.international_order_timeline;
DROP POLICY IF EXISTS "Allow update international_orders" ON public.international_orders;
DROP POLICY IF EXISTS "Allow delete international_orders" ON public.international_orders;
DROP POLICY IF EXISTS "Allow delete international_order_items" ON public.international_order_items;
DROP POLICY IF EXISTS "Allow delete international_order_timeline" ON public.international_order_timeline;

-- 7. RLS Policies
CREATE POLICY "Allow insert international_orders" ON public.international_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert international_order_items" ON public.international_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert international_order_timeline" ON public.international_order_timeline FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select international_orders" ON public.international_orders FOR SELECT USING (true);
CREATE POLICY "Allow select international_order_items" ON public.international_order_items FOR SELECT USING (true);
CREATE POLICY "Allow select international_order_timeline" ON public.international_order_timeline FOR SELECT USING (true);

CREATE POLICY "Allow update international_orders" ON public.international_orders FOR UPDATE USING (true);
CREATE POLICY "Allow delete international_orders" ON public.international_orders FOR DELETE USING (true);
CREATE POLICY "Allow delete international_order_items" ON public.international_order_items FOR DELETE USING (true);
CREATE POLICY "Allow delete international_order_timeline" ON public.international_order_timeline FOR DELETE USING (true);
