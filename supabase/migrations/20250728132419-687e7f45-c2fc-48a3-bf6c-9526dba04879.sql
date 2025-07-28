-- Abordagem mais drástica: remover TODAS as políticas problemáticas e recriar simplificadas

-- 1. Dropar TODAS as políticas de admin_users (causa da recursão)
DROP POLICY IF EXISTS "Only super admins can modify admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin_users select for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_update_admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_view_admin_users" ON public.admin_users;

-- 2. Dropar as funções que causam recursão
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 3. Criar políticas ultra-simples para admin_users (sem recursão)
CREATE POLICY "Allow all authenticated users to read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- 4. Temporariamente permitir acesso total a restaurant_details para debugar
DROP POLICY IF EXISTS "Public can view approved restaurants" ON public.restaurant_details;

CREATE POLICY "Allow public read access to restaurant_details"
ON public.restaurant_details
FOR SELECT
TO public
USING (true);