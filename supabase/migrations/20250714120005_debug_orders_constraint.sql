-- Debug the orders constraint issue
-- Run this in your Supabase SQL editor

-- 1. Check the exact foreign key constraint details
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
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='orders'
AND kcu.column_name = 'cliente_id';

-- 2. Check if the client exists in profiles table
SELECT 'Profile by ID:' as check_type, id, user_id, nome, tipo
FROM profiles 
WHERE id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5';

SELECT 'Profile by user_id:' as check_type, id, user_id, nome, tipo
FROM profiles 
WHERE user_id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5';

-- 3. Check auth.users
SELECT 'Auth user:' as check_type, id, email, created_at
FROM auth.users 
WHERE id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5';

-- 4. Try to understand what the constraint is looking for
-- Let's check if the constraint might be referencing a different column or table