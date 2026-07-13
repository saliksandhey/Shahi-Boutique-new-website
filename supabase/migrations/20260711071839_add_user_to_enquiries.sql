-- Add user_id column to product_enquiries
ALTER TABLE product_enquiries
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS if not already enabled
ALTER TABLE product_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (if still needed) or authenticated inserts
CREATE POLICY "Anyone can insert enquiries" 
ON product_enquiries FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to view their own enquiries
CREATE POLICY "Users can view own enquiries" 
ON product_enquiries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
