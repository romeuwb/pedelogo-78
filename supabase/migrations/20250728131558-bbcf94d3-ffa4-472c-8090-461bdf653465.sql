-- Fix remaining security issues identified by the linter

-- 1. Enable RLS on remaining tables that are missing it
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.restaurant_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for orders table
CREATE POLICY "Users can view orders related to them"
ON public.orders
FOR SELECT
USING (
  cliente_id = auth.uid() OR 
  restaurante_id = auth.uid() OR 
  entregador_id = auth.uid() OR
  is_current_user_admin()
);

CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Restaurant owners can update their orders"
ON public.orders
FOR UPDATE
USING (
  restaurante_id = auth.uid() OR 
  is_current_user_admin()
);

-- 3. Create secure RLS policies for products table
CREATE POLICY "Everyone can view approved products"
ON public.products
FOR SELECT
USING (ativo = true);

CREATE POLICY "Restaurant owners can manage their products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = products.restaurant_id 
    AND user_id = auth.uid()
  )
);

-- 4. Create secure RLS policies for restaurant_details table
CREATE POLICY "Everyone can view approved restaurants"
ON public.restaurant_details
FOR SELECT
USING (status_aprovacao = 'aprovado');

CREATE POLICY "Restaurant owners can manage their details"
ON public.restaurant_details
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all restaurant details"
ON public.restaurant_details
FOR ALL
USING (is_current_user_admin());

-- 5. Create secure RLS policies for table_orders
CREATE POLICY "Restaurant owners can manage their table orders"
ON public.table_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = table_orders.restaurant_id 
    AND user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 6. Create secure RLS policies for table_order_items
CREATE POLICY "Restaurant owners can manage their table order items"
ON public.table_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM table_orders to1
    JOIN restaurant_details rd ON to1.restaurant_id = rd.id
    WHERE to1.id = table_order_items.table_order_id 
    AND rd.user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 7. Create secure RLS policies for restaurant_tables
CREATE POLICY "Restaurant owners can manage their tables"
ON public.restaurant_tables
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_tables.restaurant_id 
    AND user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 8. Create secure RLS policies for pos_order_items
CREATE POLICY "Restaurant owners can manage their pos order items"
ON public.pos_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pos_orders po
    JOIN restaurant_details rd ON po.restaurant_id = rd.id
    WHERE po.id = pos_order_items.pos_order_id 
    AND rd.user_id = auth.uid()
  ) OR is_current_user_admin()
);

-- 9. Fix remaining functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_printers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_delivery_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.delivery_details 
  SET rating_medio = (
    SELECT AVG(nota) 
    FROM public.delivery_ratings 
    WHERE delivery_detail_id = NEW.delivery_detail_id
  )
  WHERE id = NEW.delivery_detail_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_operating_hours_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_table_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE table_orders 
  SET total = (
    SELECT COALESCE(SUM(subtotal), 0) 
    FROM table_order_items 
    WHERE table_order_id = COALESCE(NEW.table_order_id, OLD.table_order_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.table_order_id, OLD.table_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_primary_vehicle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.principal = true THEN
    UPDATE public.delivery_vehicles 
    SET principal = false 
    WHERE delivery_detail_id = NEW.delivery_detail_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_restaurant_api_key(p_restaurant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_api_key TEXT;
BEGIN
  -- Check if user owns the restaurant
  IF NOT EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = p_restaurant_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Generate new API key
  new_api_key := 'rapi_' || replace(gen_random_uuid()::text, '-', '');
  
  -- Revoke existing active keys
  UPDATE restaurant_api_keys 
  SET is_active = false, revoked_at = now()
  WHERE restaurant_id = p_restaurant_id AND is_active = true;
  
  -- Insert new API key
  INSERT INTO restaurant_api_keys (restaurant_id, api_key, created_by)
  VALUES (p_restaurant_id, new_api_key, auth.uid());
  
  -- Update restaurant_printers table
  UPDATE restaurant_printers 
  SET api_key = new_api_key, api_key_generated_at = now()
  WHERE restaurant_id = p_restaurant_id;
  
  RETURN new_api_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_active_bank_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.ativo = true THEN
    UPDATE public.delivery_bank_details 
    SET ativo = false 
    WHERE delivery_detail_id = NEW.delivery_detail_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_default_payment_method()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.padrao = true THEN
    UPDATE public.client_payment_methods 
    SET padrao = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_default_printer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.restaurant_printers 
    SET is_default = false 
    WHERE restaurant_id = NEW.restaurant_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM admin_invites 
  WHERE expires_at < now() - interval '30 days'
  AND used = false;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_recommendations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.client_recommendations 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_delivery_earnings(delivery_detail_id uuid, start_date date DEFAULT CURRENT_DATE, end_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_ganhos', COALESCE(SUM(valor_total), 0),
    'total_entregas', COUNT(*),
    'valor_base_total', COALESCE(SUM(valor_base), 0),
    'gorjetas_total', COALESCE(SUM(gorjeta), 0),
    'bonus_total', COALESCE(SUM(bonus), 0),
    'desconto_total', COALESCE(SUM(desconto), 0),
    'distancia_total', COALESCE(SUM(distancia_km), 0)
  ) INTO result
  FROM public.delivery_earnings
  WHERE delivery_earnings.delivery_detail_id = calculate_delivery_earnings.delivery_detail_id
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_audit_log(p_admin_id uuid, p_acao text, p_tabela_afetada text DEFAULT NULL::text, p_registro_id uuid DEFAULT NULL::uuid, p_dados_anteriores jsonb DEFAULT NULL::jsonb, p_dados_novos jsonb DEFAULT NULL::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        admin_id,
        acao,
        tabela_afetada,
        registro_id,
        dados_anteriores,
        dados_novos
    ) VALUES (
        p_admin_id,
        p_acao,
        p_tabela_afetada,
        p_registro_id,
        p_dados_anteriores,
        p_dados_novos
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, tipo, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo')::public.user_type, 'cliente'::public.user_type),
    NEW.raw_user_meta_data->>'telefone'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_client_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.test_smtp_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Esta função será expandida para integrar com edge function de teste SMTP
  result := jsonb_build_object(
    'status', 'pending',
    'message', 'Teste de configuração SMTP iniciado'
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_invites_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_restaurant_api_key(p_restaurant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_key TEXT;
BEGIN
  -- Check if user owns the restaurant
  IF NOT EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = p_restaurant_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get current active API key
  SELECT api_key INTO current_key
  FROM restaurant_api_keys
  WHERE restaurant_id = p_restaurant_id AND is_active = true
  ORDER BY generated_at DESC
  LIMIT 1;
  
  -- If no key exists, generate one
  IF current_key IS NULL THEN
    current_key := generate_restaurant_api_key(p_restaurant_id);
  END IF;
  
  RETURN current_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_table_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  mesa_record RECORD;
  pedido_ativo RECORD;
BEGIN
  -- Para cada mesa, verificar o status atual baseado nos pedidos
  FOR mesa_record IN 
    SELECT id, numero_mesa FROM restaurant_tables 
    WHERE ativo = true
  LOOP
    -- Buscar pedido mais recente para esta mesa
    SELECT status INTO pedido_ativo
    FROM table_orders 
    WHERE table_id = mesa_record.id 
    AND status IN ('aberto', 'fechado', 'processando')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Atualizar status da mesa baseado no pedido
    IF pedido_ativo.status IS NULL THEN
      -- Nenhum pedido ativo -> mesa disponível
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = mesa_record.id;
      
    ELSIF pedido_ativo.status = 'aberto' THEN
      -- Pedido aberto -> mesa ocupada
      UPDATE restaurant_tables 
      SET status = 'ocupada' 
      WHERE id = mesa_record.id;
      
    ELSIF pedido_ativo.status = 'fechado' THEN
      -- Pedido fechado -> aguardando pagamento
      UPDATE restaurant_tables 
      SET status = 'aguardando_pagamento' 
      WHERE id = mesa_record.id;
      
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Sincronização de status das mesas concluída';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_restaurant_tables_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_table_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger executado para mesa %, status do pedido: %', COALESCE(NEW.table_id, OLD.table_id), COALESCE(NEW.status, OLD.status);
  
  -- Se o pedido está sendo criado com status 'aberto'
  IF TG_OP = 'INSERT' AND NEW.status = 'aberto' THEN
    UPDATE restaurant_tables 
    SET status = 'ocupada' 
    WHERE id = NEW.table_id;
    RAISE NOTICE 'Mesa % marcada como ocupada', NEW.table_id;
    
  -- Se o status do pedido está sendo alterado
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    
    -- Pedido fechado -> mesa aguardando pagamento
    IF NEW.status = 'fechado' THEN
      UPDATE restaurant_tables 
      SET status = 'aguardando_pagamento' 
      WHERE id = NEW.table_id;
      RAISE NOTICE 'Mesa % aguardando pagamento', NEW.table_id;
      
    -- Pedido pago -> mesa disponível
    ELSIF NEW.status = 'pago' THEN
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = NEW.table_id;
      RAISE NOTICE 'Mesa % liberada', NEW.table_id;
      
    END IF;
    
  -- Se o pedido está sendo deletado, verificar se deve liberar a mesa
  ELSIF TG_OP = 'DELETE' THEN
    -- Verificar se não há outros pedidos ativos para esta mesa
    IF NOT EXISTS (
      SELECT 1 FROM table_orders 
      WHERE table_id = OLD.table_id 
      AND status IN ('aberto', 'fechado', 'processando')
      AND id != OLD.id
    ) THEN
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = OLD.table_id;
      RAISE NOTICE 'Mesa % liberada após exclusão do pedido', OLD.table_id;
    END IF;
    
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;