-- Migração temporária para testar se o problema é RLS
-- IMPORTANTE: Esta é apenas para teste - RLS será reabilitado na próxima migração

-- Desabilitar temporariamente RLS para teste
ALTER TABLE public.table_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items DISABLE ROW LEVEL SECURITY;

-- Remover políticas temporariamente
DROP POLICY IF EXISTS "restaurants_manage_table_orders" ON public.table_orders;
DROP POLICY IF EXISTS "restaurants_manage_table_order_items" ON public.table_order_items;