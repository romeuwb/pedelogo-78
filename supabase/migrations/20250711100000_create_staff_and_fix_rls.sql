-- Primeiro, criar a tabela de funcionários
CREATE TABLE IF NOT EXISTS public.restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(user_id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'funcionario',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Habilitar RLS na tabela de funcionários
ALTER TABLE public.restaurant_staff ENABLE ROW LEVEL SECURITY;

-- Política para gerenciar funcionários (apenas donos podem gerenciar)
CREATE POLICY "restaurant_owners_manage_staff" ON public.restaurant_staff
  FOR ALL USING (
    restaurant_id = auth.uid()
  );

-- AGORA criar as políticas que usam a tabela restaurant_staff
DROP POLICY IF EXISTS "restaurants_manage_table_orders" ON public.table_orders;
CREATE POLICY "restaurants_manage_table_orders" ON public.table_orders
  FOR ALL USING (
    restaurant_id IN (
      -- Permitir se o usuário é o dono do restaurante
      SELECT user_id FROM restaurant_details 
      WHERE user_id = auth.uid()
      
      UNION
      
      -- OU se o usuário é funcionário do restaurante
      SELECT restaurant_id FROM restaurant_staff 
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

-- Política similar para table_order_items
DROP POLICY IF EXISTS "restaurants_manage_table_order_items" ON public.table_order_items;
CREATE POLICY "restaurants_manage_table_order_items" ON public.table_order_items
  FOR ALL USING (
    table_order_id IN (
      SELECT id FROM table_orders 
      WHERE restaurant_id IN (
        -- Permitir se o usuário é o dono do restaurante
        SELECT user_id FROM restaurant_details 
        WHERE user_id = auth.uid()
        
        UNION
        
        -- OU se o usuário é funcionário do restaurante
        SELECT restaurant_id FROM restaurant_staff 
        WHERE user_id = auth.uid() AND ativo = true
      )
    )
  );

-- Garantir que as tabelas tenham RLS habilitado
ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;