-- Criar configurações de pagamento no sistema
INSERT INTO system_configurations (chave, valor, tipo, descricao, categoria) VALUES 
('payment_enabled', 'true', 'boolean', 'Habilitar processamento de pagamentos', 'payment'),
('stripe_publishable_key', '', 'text', 'Chave pública do Stripe', 'payment'),
('stripe_secret_key', '', 'text', 'Chave secreta do Stripe', 'payment'),
('mercadopago_access_token', '', 'text', 'Token de acesso do Mercado Pago', 'payment'),
('pix_enabled', 'true', 'boolean', 'Habilitar pagamentos PIX', 'payment'),
('card_enabled', 'true', 'boolean', 'Habilitar pagamentos por cartão', 'payment'),
('money_enabled', 'true', 'boolean', 'Habilitar pagamento em dinheiro', 'payment')
ON CONFLICT (chave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  updated_at = now();