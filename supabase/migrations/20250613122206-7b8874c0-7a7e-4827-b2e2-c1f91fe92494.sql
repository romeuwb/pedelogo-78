
-- Criar tabelas para o sistema de impressoras com WebSocket
CREATE TABLE public.restaurant_printers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurant_details(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('thermal', 'laser', 'inkjet')),
  connection_type text NOT NULL CHECK (connection_type IN ('usb', 'network', 'bluetooth')),
  ip_address text,
  port integer,
  width integer NOT NULL DEFAULT 80,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  api_endpoint text,
  api_key text,
  config_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, name)
);

-- Criar tabela para conexões WebSocket ativas
CREATE TABLE public.printer_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurant_details(id) ON DELETE CASCADE,
  connection_id text NOT NULL,
  api_endpoint text NOT NULL,
  status text NOT NULL DEFAULT 'connecting' CHECK (status IN ('connecting', 'connected', 'disconnected', 'error')),
  last_heartbeat timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id)
);

-- Criar tabela para trabalhos de impressão
CREATE TABLE public.print_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurant_details(id) ON DELETE CASCADE,
  printer_id uuid REFERENCES public.restaurant_printers(id) ON DELETE SET NULL,
  job_type text NOT NULL CHECK (job_type IN ('order', 'receipt', 'kitchen', 'bar', 'test')),
  content text NOT NULL,
  copies integer NOT NULL DEFAULT 1,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  order_id uuid,
  error_message text,
  retries integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.restaurant_printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para restaurant_printers
CREATE POLICY "Restaurant owners can manage their printers" 
  ON public.restaurant_printers 
  FOR ALL 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurant_details WHERE user_id = auth.uid()
  ));

-- Políticas RLS para printer_connections
CREATE POLICY "Restaurant owners can view their connections" 
  ON public.printer_connections 
  FOR ALL 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurant_details WHERE user_id = auth.uid()
  ));

-- Políticas RLS para print_jobs
CREATE POLICY "Restaurant owners can manage their print jobs" 
  ON public.print_jobs 
  FOR ALL 
  USING (restaurant_id IN (
    SELECT id FROM public.restaurant_details WHERE user_id = auth.uid()
  ));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_restaurant_printers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_printers_updated_at
  BEFORE UPDATE ON public.restaurant_printers
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_printers_updated_at();

CREATE TRIGGER update_printer_connections_updated_at
  BEFORE UPDATE ON public.printer_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_print_jobs_updated_at
  BEFORE UPDATE ON public.print_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para garantir apenas uma impressora padrão por restaurante
CREATE OR REPLACE FUNCTION ensure_single_default_printer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.restaurant_printers 
    SET is_default = false 
    WHERE restaurant_id = NEW.restaurant_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_printer_trigger
  BEFORE INSERT OR UPDATE ON public.restaurant_printers
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_printer();

-- Índices para performance
CREATE INDEX idx_restaurant_printers_restaurant_id ON public.restaurant_printers(restaurant_id);
CREATE INDEX idx_printer_connections_restaurant_id ON public.printer_connections(restaurant_id);
CREATE INDEX idx_print_jobs_restaurant_id ON public.print_jobs(restaurant_id);
CREATE INDEX idx_print_jobs_status ON public.print_jobs(status);
CREATE INDEX idx_print_jobs_created_at ON public.print_jobs(created_at);
