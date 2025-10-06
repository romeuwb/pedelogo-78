-- Script para executar no PAINEL DO SUPABASE (SQL Editor)
-- Remove tabelas desnecessárias no banco remoto

BEGIN;

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 'ANTES da limpeza - Tabelas existentes:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. REMOVER TABELAS DESNECESSÁRIAS (ordem de dependência)
-- Primeiro: tabelas dependentes
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Segundo: tabelas independentes
DROP TABLE IF EXISTS couriers CASCADE;

-- 3. REMOVER TIPOS ENUMERADOS NÃO UTILIZADOS
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- 4. VERIFICAR ESTRUTURA APÓS LIMPEZA
SELECT 'DEPOIS da limpeza - Tabelas restantes:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 5. OTIMIZAR
ANALYZE;

COMMIT;

-- 6. RESULTADO ESPERADO (8 tabelas essenciais):
-- ✅ addresses
-- ✅ categories  
-- ✅ order_items
-- ✅ orders
-- ✅ products
-- ✅ profiles
-- ✅ restaurants
-- ✅ users