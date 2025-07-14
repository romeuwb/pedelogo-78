-- Simple checks to understand the issue
-- Run each query separately if needed

-- 1. What table does the foreign key reference?
SELECT 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.key_column_usage AS kcu
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = kcu.constraint_name
WHERE kcu.constraint_name = 'orders_cliente_id_fkey';

-- 2. Show all profiles
SELECT id, user_id, nome FROM profiles;

-- 3. Check orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'cliente_id';