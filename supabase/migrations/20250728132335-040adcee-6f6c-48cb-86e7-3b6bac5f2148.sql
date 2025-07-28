-- Lista todas as políticas problemáticas que podem causar recursão
-- Verificando especificamente policies que referenciam admin_users dentro de outras tabelas

-- Primeiro, vamos dropar todas as políticas que podem estar causando recursão
DROP POLICY IF EXISTS "Only super admins can modify admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin_users select for authenticated users" ON public.admin_users;

-- Também verificar e dropar políticas que usam is_current_user_admin() em outras tabelas
DROP POLICY IF EXISTS "Super admins can manage all restaurant details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners can manage their table orders" ON public.table_orders;
DROP POLICY IF EXISTS "Restaurant owners can manage their table order items" ON public.table_order_items;
DROP POLICY IF EXISTS "Restaurant owners can manage their tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Restaurant owners can manage their pos order items" ON public.pos_order_items;

-- Recrear políticas mais simples sem recursão para admin_users
CREATE POLICY "Enable read access for all authenticated users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Para restaurant_details - política mais simples sem verificação de admin
CREATE POLICY "Everyone can view approved restaurants"
ON public.restaurant_details
FOR SELECT
USING (status_aprovacao = 'aprovado');

CREATE POLICY "Restaurant owners can manage their details"
ON public.restaurant_details
FOR ALL
USING (user_id = auth.uid());

-- Para as outras tabelas, usar políticas simples sem verificação de admin
CREATE POLICY "Restaurant owners can manage their table orders"
ON public.table_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = table_orders.restaurant_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can manage their table order items"
ON public.table_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM table_orders to1
    JOIN restaurant_details rd ON to1.restaurant_id = rd.id
    WHERE to1.id = table_order_items.table_order_id 
    AND rd.user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can manage their tables"
ON public.restaurant_tables
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_tables.restaurant_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can manage their pos order items"
ON public.pos_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pos_orders po
    JOIN restaurant_details rd ON po.restaurant_id = rd.id
    WHERE po.id = pos_order_items.pos_order_id 
    AND rd.user_id = auth.uid()
  )
);