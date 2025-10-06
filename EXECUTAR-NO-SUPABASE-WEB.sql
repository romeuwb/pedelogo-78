-- ==========================================
-- EXECUTAR NO PAINEL WEB DO SUPABASE
-- SQL Editor > New Query > Colar este código
-- ==========================================

-- 🔍 PRIMEIRO: Verificar estrutura atual
SELECT 'ESTRUTURA ATUAL - Tabelas existentes:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 📊 Contar tabelas atuais
SELECT 
    'Total de tabelas antes da limpeza:' as info,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

-- ==========================================
-- 🧹 LIMPEZA - REMOVER TABELAS DESNECESSÁRIAS
-- ==========================================

BEGIN;

-- 🗑️ Remover tabelas em ordem de dependência
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;

-- 🏷️ Remover tipos enumerados não utilizados
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

COMMIT;

-- ==========================================
-- ✅ VERIFICAR RESULTADO
-- ==========================================

SELECT 'RESULTADO FINAL - Tabelas restantes:' as info;
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size('public.' || table_name)) as tamanho
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 📊 Contar tabelas após limpeza
SELECT 
    'Total de tabelas após limpeza:' as info,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

-- ==========================================
-- 🎯 RESULTADO ESPERADO (8 tabelas):
-- ✅ addresses
-- ✅ categories
-- ✅ order_items  
-- ✅ orders
-- ✅ products
-- ✅ profiles
-- ✅ restaurants
-- ✅ users
-- ==========================================

-- 🔧 Otimizar banco após limpeza
ANALYZE;

SELECT '🎉 LIMPEZA CONCLUÍDA! Banco Supabase otimizado.' as resultado;