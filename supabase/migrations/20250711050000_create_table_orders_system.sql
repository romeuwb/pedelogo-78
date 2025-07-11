-- Create table_orders table for mesa orders
CREATE TABLE public.table_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado', 'processando', 'pago')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Create table_order_items table
CREATE TABLE public.table_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_order_id UUID REFERENCES public.table_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  nome_item TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update restaurant_tables status constraint to include new statuses
ALTER TABLE public.restaurant_tables DROP CONSTRAINT IF EXISTS restaurant_tables_status_check;
ALTER TABLE public.restaurant_tables ADD CONSTRAINT restaurant_tables_status_check 
  CHECK (status IN ('livre', 'ocupada', 'reservada', 'aguardando_pagamento'));

-- Enable Row Level Security
ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for table_orders
CREATE POLICY "restaurants_manage_table_orders" ON public.table_orders
  FOR ALL USING (
    restaurant_id IN (
      SELECT user_id FROM restaurant_details 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for table_order_items
CREATE POLICY "restaurants_manage_table_order_items" ON public.table_order_items
  FOR ALL USING (
    table_order_id IN (
      SELECT id FROM table_orders 
      WHERE restaurant_id IN (
        SELECT user_id FROM restaurant_details 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes
CREATE INDEX idx_table_orders_table_id ON public.table_orders(table_id);
CREATE INDEX idx_table_orders_restaurant_id ON public.table_orders(restaurant_id);
CREATE INDEX idx_table_orders_status ON public.table_orders(status);
CREATE INDEX idx_table_order_items_table_order_id ON public.table_order_items(table_order_id);

-- Function to update table status based on orders
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
    SET status = 'livre' 
    WHERE id = NEW.table_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update table status
CREATE TRIGGER trigger_update_table_status
  AFTER INSERT OR UPDATE OF status ON table_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_table_status();

-- Function to update order total
CREATE OR REPLACE FUNCTION update_table_order_total() RETURNS TRIGGER AS $$
BEGIN
  UPDATE table_orders 
  SET total = (
    SELECT COALESCE(SUM(subtotal), 0) 
    FROM table_order_items 
    WHERE table_order_id = COALESCE(NEW.table_order_id, OLD.table_order_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.table_order_id, OLD.table_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order total when items change
CREATE TRIGGER trigger_update_table_order_total
  AFTER INSERT OR UPDATE OR DELETE ON table_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_table_order_total();