CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code TEXT NOT NULL UNIQUE,
    country_name TEXT NOT NULL,
    shipping_fee_inr NUMERIC NOT NULL DEFAULT 0,
    estimated_days TEXT NOT NULL DEFAULT '7-10 days',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on shipping_zones"
    ON public.shipping_zones
    FOR SELECT
    USING (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access on shipping_zones"
    ON public.shipping_zones
    FOR ALL
    USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM profiles WHERE role = 'ADMIN')
    );

-- Insert some default zones
INSERT INTO public.shipping_zones (country_code, country_name, shipping_fee_inr, estimated_days)
VALUES 
    ('US', 'United States', 3000, '7-10 days'),
    ('GB', 'United Kingdom', 2500, '6-8 days'),
    ('CA', 'Canada', 3200, '8-12 days'),
    ('AE', 'United Arab Emirates', 1500, '4-6 days')
ON CONFLICT (country_code) DO NOTHING;
