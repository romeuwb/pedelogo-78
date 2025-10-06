-- Análise de dados existentes em cada tabela
\echo '=== ANÁLISE DE DADOS POR TABELA ==='
\echo ''

\echo '📊 Contagem de registros por tabela:'
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
UNION ALL
SELECT 'couriers', COUNT(*) FROM couriers
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
ORDER BY registros DESC;

\echo ''
\echo '🔍 Verificando índices utilizados:'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read as leituras_indice,
    idx_tup_fetch as busca_indice
FROM pg_stat_user_indexes
WHERE idx_tup_read > 0
ORDER BY idx_tup_read DESC;

\echo ''
\echo '📈 Tamanho das tabelas:'
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_dados
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''
\echo '=== FIM DA ANÁLISE ==='