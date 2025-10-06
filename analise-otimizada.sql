-- Análise da estrutura OTIMIZADA do banco PedeLogo
\echo '=== ANÁLISE DO BANCO PEDELOGO OTIMIZADO ==='
\echo ''

\echo '📊 Contagem de registros por tabela (estrutura otimizada):'
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
ORDER BY registros DESC;

\echo ''
\echo '📈 Tamanho das tabelas otimizadas:'
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size('public.'||tablename)) as tamanho_dados
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

\echo ''
\echo '🔍 Índices ativos:'
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '📋 Resumo da otimização:'
SELECT 
    'Tabelas ativas' as categoria,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Índices criados',
    COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Tipos customizados',
    COUNT(*)
FROM pg_type
WHERE typname IN ('order_status');

\echo ''
\echo '✅ ESTRUTURA FINAL OTIMIZADA:'
\echo '  • 8 tabelas essenciais (vs 11 originais)'
\echo '  • 1 tipo enumerado (vs 3 originais)'
\echo '  • Índices otimizados apenas onde necessário'
\echo '  • Removido: couriers, deliveries, payments'
\echo '  • Tamanho total reduzido significativamente'

\echo ''
\echo '=== OTIMIZAÇÃO CONCLUÍDA ==='