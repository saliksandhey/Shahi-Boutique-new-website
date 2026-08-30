CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  shipping_fee_inr NUMERIC NOT NULL DEFAULT 0,
  estimated_days TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to shipping_zones"
ON public.shipping_zones FOR SELECT
TO public
USING (is_active = true);

-- Only admin can modify (assuming you use service role or specific admin policies)
CREATE POLICY "Allow admin all access to shipping_zones"
ON public.shipping_zones FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
