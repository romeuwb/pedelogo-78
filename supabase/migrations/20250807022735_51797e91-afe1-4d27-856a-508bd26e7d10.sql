-- Inserir configurações de pagamento no sistema
INSERT INTO system_configurations (chave, valor, descricao, categoria) VALUES 
('payment_enabled', '"true"', 'Habilitar processamento de pagamentos', 'payment'),
('stripe_publishable_key', '""', 'Chave pública do Stripe', 'payment'),
('stripe_secret_key', '""', 'Chave secreta do Stripe', 'payment'),
('mercadopago_access_token', '""', 'Token de acesso do Mercado Pago', 'payment'),
('pix_enabled', '"true"', 'Habilitar pagamentos PIX', 'payment'),
('card_enabled', '"true"', 'Habilitar pagamentos por cartão', 'payment'),
('money_enabled', '"true"', 'Habilitar pagamento em dinheiro', 'payment')
ON CONFLICT (chave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  updated_at = now();