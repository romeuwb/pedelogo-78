-- Fix the default customer profile by setting user_id
-- Run this in your Supabase SQL editor

-- Update the existing profile to have the correct user_id
UPDATE public.profiles 
SET user_id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5'
WHERE id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5'
AND user_id IS NULL;