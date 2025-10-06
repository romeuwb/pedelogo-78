-- ==========================================
-- RESET COMPLETO DO BANCO SUPABASE
-- REMOVE TUDO EXCETO A TABELA PROFILES
-- ==========================================

-- 🔍 VERIFICAR ESTRUTURA ATUAL
SELECT 'ANTES DO RESET - Tabelas existentes:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ==========================================
-- 🗑️ RESET TOTAL - REMOVER TODAS AS TABELAS
-- ==========================================

BEGIN;

-- ⚠️ DESABILITAR VERIFICAÇÕES DE FOREIGN KEY TEMPORARIAMENTE
SET session_replication_role = replica;

-- 🗑️ REMOVER TODAS AS TABELAS EXCETO PROFILES
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS couriers CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 🏷️ REMOVER TODOS OS TIPOS ENUMERADOS
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- 📋 MANTER APENAS A TABELA PROFILES
-- (não fazemos nada com ela, apenas mantemos)

-- ⚡ REABILITAR VERIFICAÇÕES DE FOREIGN KEY
SET session_replication_role = DEFAULT;

COMMIT;

-- ==========================================
-- ✅ VERIFICAR RESULTADO DO RESET
-- ==========================================

SELECT 'APÓS RESET - Tabelas restantes:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 📊 Contagem final
SELECT 
    'Tabelas restantes após RESET:' as info,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

-- ==========================================
-- 📝 PRÓXIMOS PASSOS:
-- 1. Tabela PROFILES foi mantida ✅
-- 2. Todas as outras tabelas foram removidas ✅
-- 3. Todos os tipos enumerados foram removidos ✅
-- 4. Agora você pode recriar tudo do zero!
-- ==========================================

SELECT '🎯 RESET COMPLETO EXECUTADO! Apenas PROFILES foi mantida.' as resultado;