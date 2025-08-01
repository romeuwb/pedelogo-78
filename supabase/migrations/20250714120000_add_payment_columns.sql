-- Migration to add payment columns to orders and table_orders tables
-- Run this in your Supabase SQL editor

-- Add payment columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add payment columns to table_orders table
ALTER TABLE public.table_orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE public.table_orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
ALTER TABLE public.table_orders ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ;
ALTER TABLE public.table_orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.table_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add check constraints for payment methods (with proper error handling)
DO $$ 
BEGIN
  -- Orders table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_orders_metodo_pagamento') THEN
    ALTER TABLE public.orders ADD CONSTRAINT check_orders_metodo_pagamento 
      CHECK (metodo_pagamento IS NULL OR metodo_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'voucher'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_orders_payment_method') THEN
    ALTER TABLE public.orders ADD CONSTRAINT check_orders_payment_method 
      CHECK (payment_method IS NULL OR payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'voucher'));
  END IF;

  -- Table orders constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_table_orders_metodo_pagamento') THEN
    ALTER TABLE public.table_orders ADD CONSTRAINT check_table_orders_metodo_pagamento 
      CHECK (metodo_pagamento IS NULL OR metodo_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'voucher'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_table_orders_payment_method') THEN
    ALTER TABLE public.table_orders ADD CONSTRAINT check_table_orders_payment_method 
      CHECK (payment_method IS NULL OR payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'voucher'));
  END IF;
END $$;

-- Update existing orders to have subtotal equal to total if null
UPDATE public.orders SET subtotal = total WHERE subtotal IS NULL;
UPDATE public.table_orders SET subtotal = total WHERE subtotal IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_metodo_pagamento ON public.orders(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_orders_pago_em ON public.orders(pago_em);
CREATE INDEX IF NOT EXISTS idx_table_orders_metodo_pagamento ON public.table_orders(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_table_orders_pago_em ON public.table_orders(pago_em);