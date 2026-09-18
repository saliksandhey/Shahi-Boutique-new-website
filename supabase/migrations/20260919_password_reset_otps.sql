-- =========================================================================
-- SHAHI BOUTIQUE — DEDICATED PASSWORD RESET OTP SCHEMA
-- Migration: 20260919_password_reset_otps.sql
-- =========================================================================

-- 1. Create table for storing 10-minute expiring password reset OTP codes
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON public.password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at ON public.password_reset_otps(expires_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate policy for service role / admin access
DROP POLICY IF EXISTS "Full access to password_reset_otps" ON public.password_reset_otps;
CREATE POLICY "Full access to password_reset_otps" ON public.password_reset_otps FOR ALL USING (true);
