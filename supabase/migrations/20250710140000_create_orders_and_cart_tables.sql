-- Create client_cart table for persistent cart storage
CREATE TABLE public.client_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurante_id UUID NOT NULL,
  entregador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  total DECIMAL(10,2) NOT NULL,
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  tempo_estimado INTEGER, -- in minutes
  endereco_entrega JSONB NOT NULL,
  observacoes TEXT,
  metodo_pagamento TEXT,
  data_aceite_entregador TIMESTAMPTZ,
  data_saida_entregador TIMESTAMPTZ,
  data_chegada_restaurante TIMESTAMPTZ,
  data_retirada_pedido TIMESTAMPTZ,
  data_saida_restaurante TIMESTAMPTZ,
  data_chegada_cliente TIMESTAMPTZ,
  data_entrega TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  nome_item TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery_earnings table
CREATE TABLE public.delivery_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  entregador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  gorjeta DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  tempo_entrega_minutos INTEGER,
  distancia_km DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create delivery_ratings table
CREATE TABLE public.delivery_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  entregador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_cart
CREATE POLICY "users_view_own_cart" ON public.client_cart
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_modify_own_cart" ON public.client_cart
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "clients_view_own_orders" ON public.orders
  FOR SELECT USING (cliente_id = auth.uid());

CREATE POLICY "delivery_view_assigned_orders" ON public.orders
  FOR SELECT USING (entregador_id = auth.uid());

CREATE POLICY "restaurants_view_orders" ON public.orders
  FOR SELECT USING (
    restaurante_id IN (
      SELECT user_id FROM restaurant_details 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "clients_create_orders" ON public.orders
  FOR INSERT WITH CHECK (cliente_id = auth.uid());

CREATE POLICY "delivery_update_orders" ON public.orders
  FOR UPDATE USING (entregador_id = auth.uid());

CREATE POLICY "restaurants_update_orders" ON public.orders
  FOR UPDATE USING (
    restaurante_id IN (
      SELECT user_id FROM restaurant_details 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "view_order_items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE cliente_id = auth.uid() 
         OR entregador_id = auth.uid()
         OR restaurante_id IN (
           SELECT user_id FROM restaurant_details 
           WHERE user_id = auth.uid()
         )
    )
  );

CREATE POLICY "create_order_items" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE cliente_id = auth.uid()
    )
  );

-- RLS Policies for delivery_earnings
CREATE POLICY "delivery_view_own_earnings" ON public.delivery_earnings
  FOR SELECT USING (entregador_id = auth.uid());

CREATE POLICY "create_delivery_earnings" ON public.delivery_earnings
  FOR INSERT WITH CHECK (entregador_id = auth.uid());

-- RLS Policies for delivery_ratings
CREATE POLICY "view_ratings" ON public.delivery_ratings
  FOR SELECT USING (
    entregador_id = auth.uid() OR cliente_id = auth.uid()
  );

CREATE POLICY "clients_create_ratings" ON public.delivery_ratings
  FOR INSERT WITH CHECK (cliente_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_orders_cliente_id ON public.orders(cliente_id);
CREATE INDEX idx_orders_restaurante_id ON public.orders(restaurante_id);
CREATE INDEX idx_orders_entregador_id ON public.orders(entregador_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_client_cart_user_id ON public.client_cart(user_id);
CREATE INDEX idx_delivery_earnings_entregador_id ON public.delivery_earnings(entregador_id);