
-- Corrigir a sintaxe do ALTER TABLE
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS horario_funcionamento jsonb DEFAULT '{}';
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS status_online boolean DEFAULT true;
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS area_entrega jsonb DEFAULT '{}';
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS dados_bancarios jsonb DEFAULT '{}';
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS configuracoes_notificacao jsonb DEFAULT '{}';

-- Tabela para horários especiais/feriados
CREATE TABLE IF NOT EXISTS restaurant_special_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  data date NOT NULL,
  horario_abertura time,
  horario_fechamento time,
  fechado boolean DEFAULT false,
  motivo text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para histórico de mudanças de status do restaurante
CREATE TABLE IF NOT EXISTS restaurant_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  status_anterior boolean,
  status_novo boolean,
  usuario_responsavel uuid REFERENCES profiles(user_id),
  motivo text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para respostas às avaliações
CREATE TABLE IF NOT EXISTS review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  resposta text NOT NULL,
  respondido_por uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para comunicação com clientes
CREATE TABLE IF NOT EXISTS customer_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL,
  tipo_mensagem text NOT NULL,
  mensagem text NOT NULL,
  enviada_por uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela para promoções criadas pelo restaurante
CREATE TABLE IF NOT EXISTS restaurant_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  tipo_promocao text NOT NULL,
  valor_desconto numeric,
  produtos_aplicaveis uuid[] DEFAULT '{}',
  valor_minimo_pedido numeric DEFAULT 0,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone NOT NULL,
  dias_semana integer[] DEFAULT '{1,2,3,4,5,6,7}',
  horario_inicio time,
  horario_fim time,
  limite_uso integer,
  usos_realizados integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para histórico de repasses financeiros
CREATE TABLE IF NOT EXISTS restaurant_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  valor_bruto numeric NOT NULL,
  valor_comissao numeric NOT NULL,
  valor_liquido numeric NOT NULL,
  status text DEFAULT 'pendente',
  data_processamento timestamp with time zone,
  comprovante_url text,
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para itens de cardápio indisponíveis temporariamente
CREATE TABLE IF NOT EXISTS restaurant_product_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES restaurant_products(id) ON DELETE CASCADE,
  disponivel boolean DEFAULT true,
  motivo_indisponibilidade text,
  data_indisponibilidade timestamp with time zone,
  previsao_retorno timestamp with time zone,
  usuario_responsavel uuid REFERENCES profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(restaurant_id, product_id)
);

-- Tabela para templates de mensagens predefinidas
CREATE TABLE IF NOT EXISTS restaurant_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurant_details(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
