-- Fix infinite recursion in admin_users policies

-- 1. Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- 2. Create a simple, non-recursive admin check function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  );
$$;

-- 3. Create simpler admin_users policies without recursion
CREATE POLICY "Allow admin_users select for authenticated users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admins can modify admin_users"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() 
    AND au.role = 'super_admin'::admin_role 
    AND au.ativo = true
  )
);

-- 4. Recreate profile policy without admin recursion
CREATE POLICY "Users can update own profile (no role changes)"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  tipo = (SELECT tipo FROM profiles WHERE user_id = auth.uid())
);

-- 5. Ensure restaurant_details policies are not recursive
DROP POLICY IF EXISTS "Admins can manage all restaurant details" ON public.restaurant_details;

-- Recreate with simpler admin check
CREATE POLICY "Super admins can manage all restaurant details"
ON public.restaurant_details
FOR ALL
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() 
    AND au.role = 'super_admin'::admin_role 
    AND au.ativo = true
  )
);