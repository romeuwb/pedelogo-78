-- Migração para atualizar e corrigir triggers de status de mesa
-- Atualizar função de atualização de status de mesa

-- Primeiro, remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_update_table_status ON table_orders;
DROP FUNCTION IF EXISTS update_table_status();

-- Criar função melhorada para atualizar status da mesa
CREATE OR REPLACE FUNCTION update_table_status() RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger executado para mesa %, status do pedido: %', COALESCE(NEW.table_id, OLD.table_id), COALESCE(NEW.status, OLD.status);
  
  -- Se o pedido está sendo criado com status 'aberto'
  IF TG_OP = 'INSERT' AND NEW.status = 'aberto' THEN
    UPDATE restaurant_tables 
    SET status = 'ocupada' 
    WHERE id = NEW.table_id;
    RAISE NOTICE 'Mesa % marcada como ocupada', NEW.table_id;
    
  -- Se o status do pedido está sendo alterado
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    
    -- Pedido fechado -> mesa aguardando pagamento
    IF NEW.status = 'fechado' THEN
      UPDATE restaurant_tables 
      SET status = 'aguardando_pagamento' 
      WHERE id = NEW.table_id;
      RAISE NOTICE 'Mesa % aguardando pagamento', NEW.table_id;
      
    -- Pedido pago -> mesa disponível
    ELSIF NEW.status = 'pago' THEN
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = NEW.table_id;
      RAISE NOTICE 'Mesa % liberada', NEW.table_id;
      
    END IF;
    
  -- Se o pedido está sendo deletado, verificar se deve liberar a mesa
  ELSIF TG_OP = 'DELETE' THEN
    -- Verificar se não há outros pedidos ativos para esta mesa
    IF NOT EXISTS (
      SELECT 1 FROM table_orders 
      WHERE table_id = OLD.table_id 
      AND status IN ('aberto', 'fechado', 'processando')
      AND id != OLD.id
    ) THEN
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = OLD.table_id;
      RAISE NOTICE 'Mesa % liberada após exclusão do pedido', OLD.table_id;
    END IF;
    
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que executa após INSERT, UPDATE ou DELETE
CREATE TRIGGER trigger_update_table_status
  AFTER INSERT OR UPDATE OF status OR DELETE ON table_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_table_status();

-- Função para sincronizar status atual das mesas
CREATE OR REPLACE FUNCTION sync_table_status() RETURNS void AS $$
DECLARE
  mesa_record RECORD;
  pedido_ativo RECORD;
BEGIN
  -- Para cada mesa, verificar o status atual baseado nos pedidos
  FOR mesa_record IN 
    SELECT id, numero_mesa FROM restaurant_tables 
    WHERE ativo = true
  LOOP
    -- Buscar pedido mais recente para esta mesa
    SELECT status INTO pedido_ativo
    FROM table_orders 
    WHERE table_id = mesa_record.id 
    AND status IN ('aberto', 'fechado', 'processando')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Atualizar status da mesa baseado no pedido
    IF pedido_ativo.status IS NULL THEN
      -- Nenhum pedido ativo -> mesa disponível
      UPDATE restaurant_tables 
      SET status = 'disponivel' 
      WHERE id = mesa_record.id;
      
    ELSIF pedido_ativo.status = 'aberto' THEN
      -- Pedido aberto -> mesa ocupada
      UPDATE restaurant_tables 
      SET status = 'ocupada' 
      WHERE id = mesa_record.id;
      
    ELSIF pedido_ativo.status = 'fechado' THEN
      -- Pedido fechado -> aguardando pagamento
      UPDATE restaurant_tables 
      SET status = 'aguardando_pagamento' 
      WHERE id = mesa_record.id;
      
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Sincronização de status das mesas concluída';
END;
$$ LANGUAGE plpgsql;

-- Executar sincronização inicial
SELECT sync_table_status();