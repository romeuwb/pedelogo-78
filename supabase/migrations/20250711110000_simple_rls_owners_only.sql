-- Versão simples: apenas donos do restaurante
DROP POLICY IF EXISTS "restaurants_manage_table_orders" ON public.table_orders;
CREATE POLICY "restaurants_manage_table_orders" ON public.table_orders
  FOR ALL USING (
    restaurant_id = auth.uid()
  );

DROP POLICY IF EXISTS "restaurants_manage_table_order_items" ON public.table_order_items;
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