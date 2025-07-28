-- Usar CASCADE para forçar a remoção das funções e todas as dependências

-- Primeiro desabilitar RLS na tabela admin_users
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Usar CASCADE para dropar as funções e todas as políticas que dependem delas
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Criar políticas ultra-simples para restaurant_details
DROP POLICY IF EXISTS "Public can view approved restaurants only" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners can manage their own details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Allow public read access to restaurant_details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Public read access to restaurant_details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners manage their details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Public can read restaurant_details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners can manage details" ON public.restaurant_details;

CREATE POLICY "Allow public to read restaurants"
ON public.restaurant_details
FOR SELECT
USING (true);

CREATE POLICY "Owners can manage their restaurants"
ON public.restaurant_details
FOR ALL
USING (user_id = auth.uid());