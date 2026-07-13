-- Update the products table to support enquiry mode
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_enquiry_only BOOLEAN DEFAULT false;

-- Create the product_enquiries table
CREATE TABLE IF NOT EXISTS product_enquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for product_enquiries
ALTER TABLE product_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (so anyone can submit an enquiry from the storefront)
CREATE POLICY "Public can insert product enquiries" 
ON product_enquiries FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admins to view/manage enquiries
CREATE POLICY "Admins can manage product enquiries" 
ON product_enquiries FOR ALL 
USING (auth.role() = 'authenticated');
