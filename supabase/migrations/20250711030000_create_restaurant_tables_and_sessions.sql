-- Criar tabela de mesas do restaurante
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  numero_mesa INTEGER NOT NULL,
  capacidade INTEGER NOT NULL CHECK (capacidade > 0),
  status TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre', 'ocupada', 'reservada', 'limpeza', 'manutencao')),
  posicao_x DECIMAL DEFAULT 0,
  posicao_y DECIMAL DEFAULT 0,
  qr_code TEXT UNIQUE,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  localizacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(restaurant_id, numero_mesa)
);

-- Criar tabela de sessões de mesa (para controle POS)
CREATE TABLE IF NOT EXISTS table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  opened_by UUID REFERENCES auth.users(id),
  closed_by UUID REFERENCES auth.users(id),
  total_value DECIMAL DEFAULT 0,
  service_fee DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'fechada', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de pedidos POS
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  service_fee DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
  payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial', 'cancelado')),
  payment_method TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de itens dos pedidos POS
CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_order_id UUID NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES restaurant_products(id),
  nome_item TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL NOT NULL CHECK (preco_unitario >= 0),
  subtotal DECIMAL GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS table_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  pos_order_id UUID REFERENCES pos_orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'voucher')),
  status TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'aprovado', 'rejeitado', 'cancelado')),
  transaction_id TEXT,
  processed_by UUID REFERENCES auth.users(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_table_sessions_table_id ON table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_status ON table_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_session_id ON pos_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_status ON pos_orders(status);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_order_id ON pos_order_items(pos_order_id);
CREATE INDEX IF NOT EXISTS idx_table_payments_session_id ON table_payments(session_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_table_sessions_updated_at BEFORE UPDATE ON table_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pos_orders_updated_at BEFORE UPDATE ON pos_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_table_payments_updated_at BEFORE UPDATE ON table_payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_payments ENABLE ROW LEVEL SECURITY;

-- Policies para restaurant_tables
CREATE POLICY "Restaurant tables são visíveis para usuários autenticados do restaurante" ON restaurant_tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_details rd 
      WHERE rd.id = restaurant_tables.restaurant_id 
      AND rd.user_id = auth.uid()
    )
  );

-- Policies para table_sessions
CREATE POLICY "Sessions são visíveis para usuários autenticados do restaurante" ON table_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_details rd 
      WHERE rd.id = table_sessions.restaurant_id 
      AND rd.user_id = auth.uid()
    )
  );

-- Policies para pos_orders
CREATE POLICY "POS orders são visíveis para usuários autenticados do restaurante" ON pos_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_details rd 
      WHERE rd.id = pos_orders.restaurant_id 
      AND rd.user_id = auth.uid()
    )
  );

-- Policies para pos_order_items
CREATE POLICY "POS order items são visíveis através dos pedidos" ON pos_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pos_orders po
      JOIN restaurant_details rd ON rd.id = po.restaurant_id
      WHERE po.id = pos_order_items.pos_order_id 
      AND rd.user_id = auth.uid()
    )
  );

-- Policies para table_payments
CREATE POLICY "Payments são visíveis para usuários autenticados do restaurante" ON table_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_details rd 
      WHERE rd.id = table_payments.restaurant_id 
      AND rd.user_id = auth.uid()
    )
  );