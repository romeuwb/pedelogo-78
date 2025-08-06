-- Criar tabelas de solicitações de retirada para restaurantes e entregadores
CREATE TABLE public.restaurant_withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  valor_solicitado NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'processado')),
  observacoes TEXT,
  dados_bancarios JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processado_por UUID,
  data_processamento TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurant_details(id),
  FOREIGN KEY (processado_por) REFERENCES admin_users(user_id)
);

CREATE TABLE public.delivery_withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_detail_id UUID NOT NULL,
  valor_solicitado NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'processado')),
  observacoes TEXT,
  dados_bancarios JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processado_por UUID,
  data_processamento TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (delivery_detail_id) REFERENCES delivery_details(id),
  FOREIGN KEY (processado_por) REFERENCES admin_users(user_id)
);

-- Adicionar colunas faltantes na tabela restaurant_payouts
ALTER TABLE public.restaurant_payouts 
ADD COLUMN IF NOT EXISTS comissao_plataforma NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS taxa_pagamento NUMERIC(10,2) DEFAULT 0;

-- RLS Policies para restaurant_withdrawal_requests
ALTER TABLE public.restaurant_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants can manage their withdrawal requests" 
ON public.restaurant_withdrawal_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM restaurant_details 
    WHERE id = restaurant_withdrawal_requests.restaurant_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all withdrawal requests" 
ON public.restaurant_withdrawal_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- RLS Policies para delivery_withdrawal_requests
ALTER TABLE public.delivery_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery users can manage their withdrawal requests" 
ON public.delivery_withdrawal_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM delivery_details 
    WHERE id = delivery_withdrawal_requests.delivery_detail_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all delivery withdrawal requests" 
ON public.delivery_withdrawal_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_restaurant_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.restaurant_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.delivery_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();