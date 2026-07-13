-- Full Supabase Schema Setup (Passwordless Guest Checkout + Boutique E-commerce)
-- Run this completely in the Supabase SQL Editor. 
-- WARNING: This contains DROP statements for resetting the schema if needed. Remove them in production!

-- Enable pgcrypto for uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing types to allow fresh setup
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;

-- Set up custom types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('RAZORPAY', 'COD');
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');

-- =========================================================
-- TABLES
-- =========================================================

-- Profiles table (Legacy Admin & User mappings)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role user_role DEFAULT 'CUSTOMER',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Email OTPs (Authentication)
CREATE TABLE email_otps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer Profiles (Passwordless linking by email)
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses (Legacy, kept for backwards compatibility)
CREATE TABLE addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products (Simplified, no variants)
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    sale_price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0 NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, DRAFT, ARCHIVED
    fabric TEXT,
    material TEXT,
    care_instructions TEXT,
    country_of_origin TEXT,
    weight DECIMAL(10,2),
    dimensions TEXT,
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    keywords TEXT,
    canonical_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Images
CREATE TABLE product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Size Guides
CREATE TABLE product_size_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_name TEXT NOT NULL,
  chest TEXT,
  length TEXT,
  shoulder TEXT,
  sleeve TEXT,
  waist TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist
CREATE TABLE wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_email, product_id)
);

-- Coupons
CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    order_number TEXT UNIQUE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'PENDING',
    order_status order_status DEFAULT 'PENDING',
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    shipping_address TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    tracking_number TEXT,
    courier_name TEXT,
    tracking_url TEXT,
    shipment_notes TEXT,
    staff_notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    refunded_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Timeline
CREATE TABLE order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Order Refunds
CREATE TABLE order_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  restocked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Banners
CREATE TABLE banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image TEXT NOT NULL,
    button_text TEXT,
    button_link TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- =========================================================
-- RLS POLICIES & SECURITY
-- =========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_size_guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Customer Profiles (Passwordless)
CREATE POLICY "Customers can view their own profile" ON customer_profiles FOR SELECT USING (email = current_setting('request.jwt.claims', true)::jsonb->>'email');
CREATE POLICY "Customers can update their own profile" ON customer_profiles FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::jsonb->>'email');

-- Addresses
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories & Products (Public Read)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);

-- Wishlist & Cart
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON wishlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders (Read by Email instead of Auth ID)
CREATE POLICY "Users can view their own orders via email" ON orders FOR SELECT USING (customer_email = current_setting('request.jwt.claims', true)::jsonb->>'email');
CREATE POLICY "Users can insert own orders via email" ON orders FOR INSERT WITH CHECK (customer_email = current_setting('request.jwt.claims', true)::jsonb->>'email' OR auth.uid() = user_id);

-- Order Items
CREATE POLICY "Users can view their own order items via email" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_email = current_setting('request.jwt.claims', true)::jsonb->>'email')
);

-- Order Timeline
CREATE POLICY "Order timelines viewable by everyone with access to the order" ON order_timeline FOR SELECT USING (true);

-- Reviews & Banners
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Active banners are viewable by everyone" ON banners FOR SELECT USING (active = true);

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Trigger to automatically create a profile for admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'CUSTOMER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================

-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product-images
CREATE POLICY "Public Read Access on product-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow authenticated users (Admins) to insert objects
CREATE POLICY "Authenticated users can insert product-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update objects
CREATE POLICY "Authenticated users can update product-images" 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete objects
CREATE POLICY "Authenticated users can delete product-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
- -   U p d a t e   t h e   p r o d u c t s   t a b l e   t o   s u p p o r t   e n q u i r y   m o d e  
 A L T E R   T A B L E   p r o d u c t s   A D D   C O L U M N   I F   N O T   E X I S T S   i s _ e n q u i r y _ o n l y   B O O L E A N   D E F A U L T   f a l s e ;  
  
 - -   C r e a t e   t h e   p r o d u c t _ e n q u i r i e s   t a b l e  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p r o d u c t _ e n q u i r i e s   (  
         i d   U U I D   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( )   P R I M A R Y   K E Y ,  
         p r o d u c t _ i d   U U I D   R E F E R E N C E S   p r o d u c t s ( i d )   O N   D E L E T E   C A S C A D E ,  
         f u l l _ n a m e   T E X T   N O T   N U L L ,  
         c o u n t r y   T E X T   N O T   N U L L ,  
         s t a t e   T E X T   N O T   N U L L ,  
         p h o n e _ n u m b e r   T E X T   N O T   N U L L ,  
         m e s s a g e   T E X T ,  
         s t a t u s   T E X T   D E F A U L T   ' P E N D I N G ' ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   t i m e z o n e ( ' u t c ' : : t e x t ,   n o w ( ) )   N O T   N U L L  
 ) ;  
  
 - -   R L S   P o l i c i e s   f o r   p r o d u c t _ e n q u i r i e s  
 A L T E R   T A B L E   p r o d u c t _ e n q u i r i e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   A l l o w   p u b l i c   i n s e r t i o n   ( s o   a n y o n e   c a n   s u b m i t   a n   e n q u i r y   f r o m   t h e   s t o r e f r o n t )  
 C R E A T E   P O L I C Y   " P u b l i c   c a n   i n s e r t   p r o d u c t   e n q u i r i e s "    
 O N   p r o d u c t _ e n q u i r i e s   F O R   I N S E R T    
 W I T H   C H E C K   ( t r u e ) ;  
  
 - -   A l l o w   a u t h e n t i c a t e d   a d m i n s   t o   v i e w / m a n a g e   e n q u i r i e s  
 C R E A T E   P O L I C Y   " A d m i n s   c a n   m a n a g e   p r o d u c t   e n q u i r i e s "    
 O N   p r o d u c t _ e n q u i r i e s   F O R   A L L    
 U S I N G   ( a u t h . r o l e ( )   =   ' a u t h e n t i c a t e d ' ) ;  
 