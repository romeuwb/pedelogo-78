-- Queries de análise para o banco PedeLogo
-- Execute: psql -U postgres -d pedelogo -f analise-queries.sql

\echo '=== ANÁLISE DO BANCO PEDELOGO ==='
\echo ''

-- 1. Estrutura das tabelas
\echo '📊 1. ESTRUTURA DAS TABELAS:'
\dt

\echo ''
\echo '👥 2. USUÁRIOS E PERFIS:'
SELECT 
    p.role,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM profiles), 2) as percentual
FROM profiles p 
GROUP BY p.role 
ORDER BY quantidade DESC;

\echo ''
\echo '🏪 3. RESTAURANTES:'
SELECT 
    COUNT(*) as total_restaurantes,
    AVG(rating) as rating_medio,
    COUNT(CASE WHEN is_active THEN 1 END) as ativos,
    COUNT(CASE WHEN NOT is_active THEN 1 END) as inativos
FROM restaurants;

\echo ''
\echo '🍕 4. PRODUTOS POR RESTAURANTE:'
SELECT 
    r.name as restaurante,
    COUNT(p.id) as total_produtos,
    COUNT(CASE WHEN p.is_active THEN 1 END) as produtos_ativos,
    AVG(p.price) as preco_medio
FROM restaurants r
LEFT JOIN products p ON r.id = p.restaurant_id
GROUP BY r.id, r.name
ORDER BY total_produtos DESC
LIMIT 10;

\echo ''
\echo '📦 5. STATUS DOS PEDIDOS:'
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentual,
    AVG(total) as valor_medio
FROM orders 
GROUP BY status 
ORDER BY quantidade DESC;

\echo ''
\echo '💰 6. RESUMO FINANCEIRO:'
SELECT 
    COUNT(*) as total_pedidos,
    SUM(total) as receita_total,
    AVG(total) as ticket_medio,
    SUM(delivery_fee) as total_taxas_entrega
FROM orders;

\echo ''
\echo '🚚 7. STATUS DAS ENTREGAS:'
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM deliveries), 2) as percentual
FROM deliveries 
GROUP BY status 
ORDER BY quantidade DESC;

\echo ''
\echo '💳 8. STATUS DOS PAGAMENTOS:'
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(amount) as valor_total
FROM payments 
GROUP BY status 
ORDER BY quantidade DESC;

\echo ''
\echo '📍 9. DISTRIBUIÇÃO DE ENDEREÇOS:'
SELECT 
    city,
    COUNT(*) as quantidade
FROM addresses 
WHERE city IS NOT NULL
GROUP BY city 
ORDER BY quantidade DESC
LIMIT 10;

\echo ''
\echo '🔥 10. TOP PRODUTOS MAIS PEDIDOS:'
SELECT 
    p.name as produto,
    r.name as restaurante,
    SUM(oi.quantity) as total_vendido,
    COUNT(DISTINCT oi.order_id) as pedidos_distintos
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN restaurants r ON p.restaurant_id = r.id
GROUP BY p.id, p.name, r.name
ORDER BY total_vendido DESC
LIMIT 10;

\echo ''
\echo '=== FIM DA ANÁLISE ==='