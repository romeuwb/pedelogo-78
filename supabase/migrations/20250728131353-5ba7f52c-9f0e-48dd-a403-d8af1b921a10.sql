-- Critical Security Fixes Migration
-- Phase 1: Enable RLS and fix critical vulnerabilities

-- 1. Enable RLS on tables that are missing it
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_product_availability ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for customer_communications
CREATE POLICY "Restaurant owners can manage their communications"
ON public.customer_communications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = customer_communications.restaurant_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their communications"
ON public.customer_communications
FOR SELECT
USING (cliente_id = auth.uid());

-- 3. Create secure RLS policies for restaurant_message_templates
CREATE POLICY "Restaurant owners can manage their message templates"
ON public.restaurant_message_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_message_templates.restaurant_id 
    AND user_id = auth.uid()
  )
);

-- 4. Create secure RLS policies for restaurant_status_log
CREATE POLICY "Admins can view all restaurant status logs"
ON public.restaurant_status_log
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Restaurant owners can view their status logs"
ON public.restaurant_status_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_status_log.restaurant_id 
    AND user_id = auth.uid()
  )
);

-- 5. Create secure RLS policies for restaurant_product_availability
CREATE POLICY "Restaurant owners can manage their product availability"
ON public.restaurant_product_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_product_availability.restaurant_id 
    AND user_id = auth.uid()
  )
);

-- 6. Fix Profile Role Escalation Vulnerability
-- Remove the overly permissive policy that allows users to update their own profiles including roles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new restricted policy that doesn't allow role changes
CREATE POLICY "Users can update own profile (except role)"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  tipo = (SELECT tipo FROM profiles WHERE user_id = auth.uid()) -- Prevent role changes
);

-- Create admin-only policy for role changes
CREATE POLICY "Admins can update user roles"
ON public.profiles
FOR UPDATE
USING (is_current_user_admin());

-- 7. Secure Admin User Management
-- Remove the dangerous policy that allows anyone to insert admin users
DROP POLICY IF EXISTS "Allow insert admin_users during invite acceptance" ON public.admin_users;

-- Remove overly broad public view policy
DROP POLICY IF EXISTS "Authenticated users can view admin_users" ON public.admin_users;

-- Create secure admin-only policies
CREATE POLICY "Super admins can manage admin users"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::admin_role 
    AND ativo = true
  )
);

-- 8. Fix Database Function Security - Add search_path protection
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_details 
    WHERE id = restaurant_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND ativo = true
  );
$$;

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

CREATE OR REPLACE FUNCTION public.is_delivery_owner(delivery_detail_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.delivery_details 
    WHERE id = delivery_detail_id AND user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1 AND role = 'super_admin' AND ativo = true
  );
$$;

-- 9. Create secure admin invite system
CREATE OR REPLACE FUNCTION public.create_admin_user_from_invite(
  invite_token uuid,
  user_email text,
  user_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Validate invite
  SELECT * INTO invite_record
  FROM public.admin_invites
  WHERE token = invite_token
    AND email = user_email
    AND used = false
    AND expires_at > now();
    
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Create admin user
  INSERT INTO public.admin_users (user_id, email, nome, role)
  VALUES (auth.uid(), user_email, user_name, invite_record.role);
  
  -- Mark invite as used
  UPDATE public.admin_invites
  SET used = true, used_at = now()
  WHERE token = invite_token;
  
  RETURN true;
END;
$$;

-- 10. Add audit logging for critical operations
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.tipo != NEW.tipo THEN
    PERFORM public.create_audit_log(
      auth.uid(),
      'role_change',
      'profiles',
      NEW.id,
      jsonb_build_object('old_role', OLD.tipo),
      jsonb_build_object('new_role', NEW.tipo)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS log_profile_role_changes ON public.profiles;
CREATE TRIGGER log_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 11. Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role user_type
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can change roles
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Update the role
  UPDATE public.profiles
  SET tipo = new_role
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;