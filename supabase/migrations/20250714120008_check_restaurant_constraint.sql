-- Check restaurant constraint issue
-- Run this in your Supabase SQL editor

-- 1. Check what table the restaurant foreign key references
SELECT 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.key_column_usage AS kcu
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = kcu.constraint_name
WHERE kcu.constraint_name = 'orders_restaurante_id_fkey';

-- 2. Check if the restaurant exists in profiles table (assuming it references profiles)
SELECT 'Restaurant in profiles:' as check_type, id, user_id, nome, tipo
FROM profiles 
WHERE user_id = '67674b8d-50d8-4704-b113-e51854eb9cba' -- current logged user
OR id = 'e5ccb1d2-d979-4235-8e36-fed570dfe68b'; -- restaurant ID being used

-- 3. Check what restaurant ID is being passed (from the log it should be e5ccb1d2-d979-4235-8e36-fed570dfe68b)
SELECT 'All restaurants:' as check_type, id, user_id, nome, tipo 
FROM profiles 
WHERE tipo = 'restaurante';