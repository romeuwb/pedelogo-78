-- Dropar TODAS as políticas que dependem da função is_current_user_admin() primeiro
-- para poder dropar a função sem erro

-- Políticas em service_regions
DROP POLICY IF EXISTS "Admin users can manage service regions" ON public.service_regions;

-- Políticas em banners
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.banners;

-- Políticas em coupon_usage
DROP POLICY IF EXISTS "Admins can manage all coupon usage" ON public.coupon_usage;

-- Políticas em coupons
DROP POLICY IF EXISTS "Admins can manage all coupons" ON public.coupons;

-- Políticas em reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;

-- Políticas em support_tickets
DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;

-- Políticas em system_configurations
DROP POLICY IF EXISTS "Admins can manage all system configurations" ON public.system_configurations;

-- Políticas em ticket_responses
DROP POLICY IF EXISTS "Admins can manage all ticket responses" ON public.ticket_responses;

-- Políticas em restaurant_details
DROP POLICY IF EXISTS "Admins can update restaurant details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer restaurante" ON public.restaurant_details;
DROP POLICY IF EXISTS "Admins podem ver todos os restaurantes" ON public.restaurant_details;

-- Políticas em audit_logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

-- Políticas em profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Políticas em admin_products
DROP POLICY IF EXISTS "Admins podem fazer tudo em produtos" ON public.admin_products;

-- Políticas em restaurant_admin_products
DROP POLICY IF EXISTS "Admins podem fazer tudo em produtos de restaurantes" ON public.restaurant_admin_products;

-- Políticas em pos_order_items
DROP POLICY IF EXISTS "Restaurant owners can manage their pos order items" ON public.pos_order_items;

-- Políticas em pos_orders
DROP POLICY IF EXISTS "Restaurant owners can manage their pos orders" ON public.pos_orders;

-- Políticas em table_sessions
DROP POLICY IF EXISTS "Restaurant owners can manage their table sessions" ON public.table_sessions;

-- Políticas em restaurant_status_log
DROP POLICY IF EXISTS "Admins can view all restaurant status logs" ON public.restaurant_status_log;

-- Agora dropar todas as funções problemáticas
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Desabilitar RLS na tabela admin_users para quebrar qualquer recursão
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas de admin_users
DROP POLICY IF EXISTS "Allow all authenticated users to read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only super admins can modify admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin_users select for authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_update_admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_view_admin_users" ON public.admin_users;

-- Políticas simples para restaurant_details sem verificação de admin
DROP POLICY IF EXISTS "Public can view approved restaurants only" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners can manage their own details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Allow public read access to restaurant_details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Public read access to restaurant_details" ON public.restaurant_details;
DROP POLICY IF EXISTS "Restaurant owners manage their details" ON public.restaurant_details;

CREATE POLICY "Public can read restaurant_details"
ON public.restaurant_details
FOR SELECT
USING (true);

CREATE POLICY "Restaurant owners can manage details"
ON public.restaurant_details
FOR ALL
USING (user_id = auth.uid());