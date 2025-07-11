-- Criar tabela restaurant_tables se não existir
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  numero_mesa INTEGER NOT NULL,
  capacidade INTEGER NOT NULL CHECK (capacidade > 0),
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'ocupada', 'reservada', 'limpeza', 'manutencao')),
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

-- Se a tabela já existe, vamos alterar a constraint de status
DO $$ 
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'restaurant_tables_status_check'
  ) THEN
    ALTER TABLE restaurant_tables DROP CONSTRAINT restaurant_tables_status_check;
  END IF;
  
  -- Adicionar nova constraint com valores corretos
  ALTER TABLE restaurant_tables ADD CONSTRAINT restaurant_tables_status_check 
    CHECK (status IN ('disponivel', 'ocupada', 'reservada', 'limpeza', 'manutencao'));
    
  -- Atualizar registros com status inválido
  UPDATE restaurant_tables SET status = 'disponivel' WHERE status NOT IN ('disponivel', 'ocupada', 'reservada', 'limpeza', 'manutencao');
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_ativo ON restaurant_tables(ativo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_restaurant_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_restaurant_tables_updated_at ON restaurant_tables;
CREATE TRIGGER update_restaurant_tables_updated_at 
  BEFORE UPDATE ON restaurant_tables 
  FOR EACH ROW EXECUTE PROCEDURE update_restaurant_tables_updated_at();

-- RLS Policies
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Restaurant tables são visíveis para usuários autenticados do restaurante" ON restaurant_tables;

-- Criar política
CREATE POLICY "Restaurant tables access" ON restaurant_tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_details rd 
      WHERE rd.id = restaurant_tables.restaurant_id 
      AND rd.user_id = auth.uid()
    )
  );