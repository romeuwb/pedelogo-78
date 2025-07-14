-- Fix RLS policy to work with profiles.id instead of auth.uid()
-- Run this in your Supabase SQL editor

-- Drop the existing policy
DROP POLICY IF EXISTS "restaurants_create_orders" ON public.orders;

-- Create new policy that allows restaurants to create orders 
-- where restaurante_id matches their profiles.id (not auth.uid())
CREATE POLICY "restaurants_create_orders_by_profile" ON public.orders
  FOR INSERT WITH CHECK (
    restaurante_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND tipo = 'restaurante'
    )
  );

-- Also update the order_items policy if it exists
DO $$ 
BEGIN
  -- Drop existing policy if exists
  DROP POLICY IF EXISTS "restaurants_manage_order_items" ON public.order_items;
  
  -- Check if order_items table exists, if so create policy
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
    -- Create new policy using profiles.id logic
    EXECUTE 'CREATE POLICY "restaurants_manage_order_items_by_profile" ON public.order_items
      FOR ALL USING (
        order_id IN (
          SELECT o.id FROM orders o
          JOIN profiles p ON o.restaurante_id = p.id
          WHERE p.user_id = auth.uid() 
          AND p.tipo = ''restaurante''
        )
      )';
  END IF;
END $$;