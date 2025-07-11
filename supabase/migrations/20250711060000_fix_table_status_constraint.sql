-- Fix restaurant_tables status constraint to use 'disponivel' instead of 'livre'
ALTER TABLE public.restaurant_tables DROP CONSTRAINT IF EXISTS restaurant_tables_status_check;
ALTER TABLE public.restaurant_tables ADD CONSTRAINT restaurant_tables_status_check 
  CHECK (status IN ('disponivel', 'ocupada', 'reservada', 'aguardando_pagamento'));

-- Update existing tables with 'livre' status to 'disponivel'
UPDATE public.restaurant_tables SET status = 'disponivel' WHERE status = 'livre';

-- Update the trigger function to use 'disponivel'
CREATE OR REPLACE FUNCTION update_table_status() RETURNS TRIGGER AS $$
BEGIN
  -- Update table status based on order status
  IF NEW.status = 'aberto' THEN
    UPDATE restaurant_tables 
    SET status = 'ocupada' 
    WHERE id = NEW.table_id;
  ELSIF NEW.status = 'fechado' THEN
    UPDATE restaurant_tables 
    SET status = 'aguardando_pagamento' 
    WHERE id = NEW.table_id;
  ELSIF NEW.status = 'pago' THEN
    UPDATE restaurant_tables 
    SET status = 'disponivel' 
    WHERE id = NEW.table_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;