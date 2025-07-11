-- Migração robusta para resolver RLS completamente
-- Primeira parte: Remover todas as políticas existentes

-- Verificar e remover políticas de table_orders
DO $$
BEGIN
    DROP POLICY IF EXISTS "restaurants_manage_table_orders" ON public.table_orders;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.table_orders;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.table_orders;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.table_orders;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.table_orders;
END $$;

-- Verificar e remover políticas de table_order_items
DO $$
BEGIN
    DROP POLICY IF EXISTS "restaurants_manage_table_order_items" ON public.table_order_items;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.table_order_items;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.table_order_items;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.table_order_items;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.table_order_items;
END $$;

-- Segunda parte: Desabilitar RLS completamente
ALTER TABLE public.table_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items DISABLE ROW LEVEL SECURITY;

-- Terceira parte: Remover tabela restaurant_staff se existir
DROP TABLE IF EXISTS public.restaurant_staff CASCADE;

-- Quarta parte: Verificar se as tabelas existem e estão corretas
DO $$
BEGIN
    -- Verificar se table_orders existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'table_orders') THEN
        RAISE NOTICE 'Tabela table_orders não existe!';
    ELSE
        RAISE NOTICE 'Tabela table_orders existe e RLS foi desabilitado';
    END IF;
    
    -- Verificar se table_order_items existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'table_order_items') THEN
        RAISE NOTICE 'Tabela table_order_items não existe!';
    ELSE
        RAISE NOTICE 'Tabela table_order_items existe e RLS foi desabilitado';
    END IF;
END $$;