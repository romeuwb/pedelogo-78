-- Check the foreign key constraint for orders table
-- Run this in your Supabase SQL editor to see the constraint details

-- Check existing constraints on orders table
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

-- Also check if the client exists in the correct table
SELECT 'Found in profiles:' as status, count(*) as count 
FROM profiles 
WHERE id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5';

SELECT 'Found in auth.users:' as status, count(*) as count 
FROM auth.users 
WHERE id = 'ed6c24f2-ede3-436d-bad1-68341fb7fbc5';