-- Corrigir políticas RLS críticas da migração anterior

-- Habilitar RLS nas tabelas que têm políticas mas não têm RLS habilitado
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas básicas de segurança para tabelas sem políticas
CREATE POLICY "Admins can manage coupons" ON public.coupons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Users can view active coupons" ON public.coupons
FOR SELECT USING (ativo = true AND data_inicio <= now() AND data_fim >= now());

CREATE POLICY "Users can view their coupon usage" ON public.coupon_usage
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert coupon usage" ON public.coupon_usage
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage email templates" ON public.email_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins can view financial transactions" ON public.financial_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Corrigir função de cálculo de ganhos de entregador se ainda não existir
CREATE OR REPLACE FUNCTION calculate_delivery_earnings(
  delivery_detail_id UUID,
  start_date TEXT,
  end_date TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_ganhos', COALESCE(SUM(valor_total), 0),
    'total_entregas', COUNT(*),
    'valor_medio', COALESCE(AVG(valor_total), 0),
    'total_gorjetas', COALESCE(SUM(gorjeta), 0),
    'total_bonus', COALESCE(SUM(bonus), 0)
  ) INTO result
  FROM delivery_earnings
  WHERE delivery_earnings.delivery_detail_id = calculate_delivery_earnings.delivery_detail_id
    AND DATE(created_at) BETWEEN start_date::DATE AND end_date::DATE;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar função para notificar entregadores sobre novos pedidos
CREATE OR REPLACE FUNCTION notify_available_deliveries()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar entregadores online quando um pedido fica pronto
  IF NEW.status = 'pronto' AND OLD.status != 'pronto' THEN
    PERFORM pg_notify('new_delivery_available', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para notificações
DROP TRIGGER IF EXISTS trigger_notify_deliveries ON orders;
CREATE TRIGGER trigger_notify_deliveries
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_available_deliveries();