-- Fix security issues only for existing tables

-- 1. Enable RLS on existing tables that are missing it (verified to exist)
ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for table_orders
CREATE POLICY "Restaurant owners can manage their table orders"
ON public.table_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = table_orders.restaurant_id 
    AND user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 3. Create secure RLS policies for table_order_items
CREATE POLICY "Restaurant owners can manage their table order items"
ON public.table_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM table_orders to1
    JOIN restaurant_details rd ON to1.restaurant_id = rd.id
    WHERE to1.id = table_order_items.table_order_id 
    AND rd.user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 4. Create secure RLS policies for restaurant_tables
CREATE POLICY "Restaurant owners can manage their tables"
ON public.restaurant_tables
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_tables.restaurant_id 
    AND user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 5. Create secure RLS policies for pos_order_items
CREATE POLICY "Restaurant owners can manage their pos order items"
ON public.pos_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pos_orders po
    JOIN restaurant_details rd ON po.restaurant_id = rd.id
    WHERE po.id = pos_order_items.pos_order_id 
    AND rd.user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- Fix remaining database functions with search_path (only the most critical ones)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, tipo, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo')::public.user_type, 'cliente'::public.user_type),
    NEW.raw_user_meta_data->>'telefone'
  );
  RETURN NEW;
END;
$$;