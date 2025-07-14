-- Migration to fix RLS policies for restaurants to create orders (including walk-in orders)
-- Run this in your Supabase SQL editor

-- Add policy for restaurants to create orders (including walk-in orders with cliente_id = null)
CREATE POLICY "restaurants_create_orders" ON public.orders
  FOR INSERT WITH CHECK (
    restaurante_id = auth.uid()
  );

-- Also add policy for restaurants to manage order items (if table exists)
-- This will be used for walk-in order items
DO $$ 
BEGIN
  -- Check if order_items table exists, if so create policy
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
    -- Drop existing policy if exists
    DROP POLICY IF EXISTS "restaurants_manage_order_items" ON public.order_items;
    
    -- Create new policy
    EXECUTE 'CREATE POLICY "restaurants_manage_order_items" ON public.order_items
      FOR ALL USING (
        order_id IN (
          SELECT id FROM orders 
          WHERE restaurante_id = auth.uid()
        )
      )';
  END IF;
END $$;