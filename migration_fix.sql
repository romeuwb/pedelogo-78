-- Migration to fix restaurant_details table and add sample data
-- Run this in your Supabase SQL editor

-- Create table restaurant_details if not exists
CREATE TABLE IF NOT EXISTS public.restaurant_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_fantasia TEXT,
  razao_social TEXT,
  cnpj TEXT,
  categoria TEXT NOT NULL,
  descricao TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  logo_url TEXT,
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  tempo_entrega_min INTEGER DEFAULT 30,
  aceita_delivery BOOLEAN DEFAULT true,
  aceita_retirada BOOLEAN DEFAULT false,
  status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  capacidade_mesas INTEGER,
  tipo_estabelecimento TEXT,
  responsavel_nome TEXT,
  responsavel_cpf TEXT,
  horario_funcionamento JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurant_details ENABLE ROW LEVEL SECURITY;

-- Policy for public to view approved restaurants
CREATE POLICY "Public can view approved restaurants" 
  ON public.restaurant_details 
  FOR SELECT 
  USING (status_aprovacao = 'aprovado');

-- Policy for restaurant owners to manage their data
CREATE POLICY "Restaurant owners can manage their details" 
  ON public.restaurant_details 
  FOR ALL 
  USING (user_id = auth.uid());

-- Insert sample restaurants if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.restaurant_details LIMIT 1) THEN
    INSERT INTO public.restaurant_details (
      nome_fantasia,
      categoria,
      descricao,
      endereco,
      cidade,
      estado,
      taxa_entrega,
      tempo_entrega_min,
      aceita_delivery,
      aceita_retirada,
      status_aprovacao
    ) VALUES 
    (
      'Pizzaria Bella Napoli',
      'pizza',
      'As melhores pizzas artesanais da cidade com massa fresca e ingredientes selecionados',
      'Rua das Flores, 123',
      'São Paulo',
      'SP',
      5.99,
      35,
      true,
      true,
      'aprovado'
    ),
    (
      'Burger House',
      'fast-food',
      'Hambúrgueres gourmet com carne angus e ingredientes frescos',
      'Av. Paulista, 456',
      'São Paulo',
      'SP',
      4.50,
      25,
      true,
      false,
      'aprovado'
    ),
    (
      'Sushi Zen',
      'japanese',
      'Culinária japonesa tradicional com peixes frescos e pratos especiais',
      'Rua Liberdade, 789',
      'São Paulo',
      'SP',
      7.00,
      40,
      true,
      true,
      'aprovado'
    ),
    (
      'Café Central',
      'coffee',
      'Cafés especiais, bolos caseiros e ambiente aconchegante',
      'Rua Augusta, 321',
      'São Paulo',
      'SP',
      3.50,
      20,
      true,
      true,
      'aprovado'
    ),
    (
      'Tacos Mexicanos',
      'mexican',
      'Pratos mexicanos autênticos com sabores únicos e temperos especiais',
      'Rua Consolação, 654',
      'São Paulo',
      'SP',
      6.00,
      30,
      true,
      false,
      'aprovado'
    );
  END IF;
END $$;