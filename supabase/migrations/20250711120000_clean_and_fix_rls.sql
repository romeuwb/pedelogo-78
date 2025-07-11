-- Limpar políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "restaurants_manage_table_orders" ON public.table_orders;
DROP POLICY IF EXISTS "restaurants_manage_table_order_items" ON public.table_order_items;
DROP POLICY IF EXISTS "restaurant_owners_manage_staff" ON public.restaurant_staff;

-- Remover tabela restaurant_staff se existir (para limpeza)
DROP TABLE IF EXISTS public.restaurant_staff;

-- Criar apenas as políticas necessárias para o sistema de pedidos (versão simples)
CREATE POLICY "restaurants_manage_table_orders" ON public.table_orders
  FOR ALL USING (
    restaurant_id = auth.uid()
  );

CREATE POLICY "restaurants_manage_table_order_items" ON public.table_order_items
  FOR ALL USING (
    table_order_id IN (
      SELECT id FROM table_orders 
      WHERE restaurant_id = auth.uid()
    )
  );

-- Garantir RLS habilitado
ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;