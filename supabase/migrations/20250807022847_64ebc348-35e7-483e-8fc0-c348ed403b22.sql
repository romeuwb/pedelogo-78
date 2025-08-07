-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE restaurant_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas para as tabelas que precisam
CREATE POLICY "Admins can manage system configurations" 
ON system_configurations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Admins can manage payment models" 
ON payment_models 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Admins can view all financial transactions" 
ON financial_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND ativo = true
));