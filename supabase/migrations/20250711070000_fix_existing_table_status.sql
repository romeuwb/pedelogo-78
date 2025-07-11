-- Corrigir status existentes das mesas antes de aplicar a constraint
UPDATE public.restaurant_tables 
SET status = 'disponivel' 
WHERE status NOT IN ('disponivel', 'ocupada', 'reservada', 'aguardando_pagamento');

-- Aplicar a constraint corrigida
ALTER TABLE public.restaurant_tables DROP CONSTRAINT IF EXISTS restaurant_tables_status_check;
ALTER TABLE public.restaurant_tables ADD CONSTRAINT restaurant_tables_status_check 
  CHECK (status IN ('disponivel', 'ocupada', 'reservada', 'aguardando_pagamento'));