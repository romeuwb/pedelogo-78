-- Migration to create default customer for walk-in orders
-- Run this in your Supabase SQL editor

-- Insert default customer profile if it doesn't exist
INSERT INTO public.profiles (id, nome, telefone, tipo, created_at, updated_at)
VALUES (
  'ed6c24f2-ede3-436d-bad1-68341fb7fbc5',
  'Cliente Balcão',
  '',
  'cliente',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Also ensure this user exists in auth.users (if needed)
-- Note: This is handled by Supabase Auth, but we're adding the profile