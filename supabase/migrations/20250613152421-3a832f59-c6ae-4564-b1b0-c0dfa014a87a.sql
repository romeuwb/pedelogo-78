
-- Criar tabela para regiões de atendimento
CREATE TYPE region_type AS ENUM ('country', 'state', 'city', 'custom');

CREATE TABLE IF NOT EXISTS service_regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type region_type NOT NULL DEFAULT 'city',
  country TEXT,
  state TEXT,
  city TEXT,
  parent_region_id UUID REFERENCES service_regions(id) ON DELETE CASCADE,
  coordinates JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_service_regions_type ON service_regions(type);
CREATE INDEX idx_service_regions_active ON service_regions(active);
CREATE INDEX idx_service_regions_parent ON service_regions(parent_region_id);

-- Trigger para updated_at
CREATE TRIGGER update_service_regions_updated_at
  BEFORE UPDATE ON service_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE service_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage service regions" ON service_regions
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Everyone can view active service regions" ON service_regions
  FOR SELECT USING (active = true);
