-- Deep investigation of orders table and constraints
-- Run this in your Supabase SQL editor

-- 1. Check ALL foreign key constraints on orders table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='orders';

-- 2. Check the structure of orders table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 3. Check ALL profiles records to see what exists
SELECT id, user_id, nome, tipo, created_at
FROM profiles 
LIMIT 10;

-- 4. Check if there's a specific constraint named orders_cliente_id_fkey
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints 
WHERE constraint_name = 'orders_cliente_id_fkey';