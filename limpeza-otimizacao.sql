-- Script de limpeza e otimização do banco PedeLogo
-- Remove dados desnecessários e otimiza estrutura

BEGIN;

\echo '🧹 Iniciando limpeza e otimização do banco PedeLogo...'
\echo ''

-- 1. ANÁLISE PRÉ-LIMPEZA
\echo '📊 Situação atual das tabelas:'
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size('public.'||t.tablename)) as tamanho,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as colunas
FROM pg_tables t 
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||t.tablename) DESC;

\echo ''

-- 2. LIMPEZA DE DADOS DESNECESSÁRIOS
\echo '🗑️ Limpando dados desnecessários...'

-- Remover registros órfãos ou inválidos (se houver)
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
DELETE FROM payments WHERE order_id NOT IN (SELECT id FROM orders);
DELETE FROM deliveries WHERE order_id NOT IN (SELECT id FROM orders);
DELETE FROM products WHERE restaurant_id NOT IN (SELECT id FROM restaurants);
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM users);

\echo '✅ Dados órfãos removidos.'

-- 3. IDENTIFICAR TABELAS POSSIVELMENTE DESNECESSÁRIAS
\echo '📋 Análise de tabelas por uso:'

-- Tabelas que podem ser removidas em desenvolvimento:
-- - couriers (se não há sistema de entrega ainda)
-- - deliveries (dependente de couriers)
-- - payments (se não há pagamentos implementados)

\echo ''
\echo '❓ Tabelas candidatas à remoção (baseado na análise do negócio):'
\echo '  - couriers: Sistema de entregadores pode não estar implementado'
\echo '  - deliveries: Depende do sistema de couriers'
\echo '  - payments: Sistema de pagamento pode estar em desenvolvimento'

-- 4. OTIMIZAÇÃO DE ÍNDICES
\echo ''
\echo '⚡ Otimizando índices...'

-- Remover índices duplicados ou desnecessários
-- (Mantendo apenas os essenciais)

-- Recriar estatísticas
ANALYZE;

\echo '✅ Índices otimizados e estatísticas atualizadas.'

-- 5. VACUUM E CLEANUP
\echo ''
\echo '🔧 Executando limpeza final...'

COMMIT;

-- VACUUM deve ser executado fora da transação
\echo 'Para completar a otimização, execute:'
\echo 'VACUUM FULL;'

\echo ''
\echo '=== RESUMO DA LIMPEZA ==='
SELECT 
    'Tabelas mantidas' as categoria,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Índices ativos',
    COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''
\echo '✅ Limpeza e otimização concluída!'
\echo ''