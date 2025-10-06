-- Script para remover tabelas desnecessárias do PedeLogo
-- Remove tabelas que não são usadas no desenvolvimento atual

BEGIN;

\echo '🗑️ Removendo tabelas e estruturas desnecessárias do PedeLogo...'
\echo ''

-- 1. BACKUP DA ESTRUTURA ATUAL
\echo '💾 Listando estrutura atual (para referência):'
\dt

\echo ''

-- 2. IDENTIFICAR TABELAS PARA REMOÇÃO
\echo '📋 Tabelas identificadas para remoção:'
\echo '  ❌ couriers - Sistema de entregadores não implementado'
\echo '  ❌ deliveries - Depende de couriers'
\echo '  ❌ payments - Sistema de pagamento em desenvolvimento'
\echo ''

-- 3. REMOVER TABELAS DESNECESSÁRIAS (em ordem de dependência)
\echo '🗑️ Removendo tabelas desnecessárias...'

-- Primeiro: tabelas que dependem de outras
DROP TABLE IF EXISTS deliveries CASCADE;
\echo '  ✅ Tabela deliveries removida'

DROP TABLE IF EXISTS payments CASCADE;
\echo '  ✅ Tabela payments removida'

-- Segundo: tabelas independentes não utilizadas
DROP TABLE IF EXISTS couriers CASCADE;
\echo '  ✅ Tabela couriers removida'

-- 4. REMOVER ÍNDICES ÓRFÃOS (se houver)
\echo ''
\echo '🔧 Removendo índices órfãos...'
DROP INDEX IF EXISTS idx_deliveries_courier;
\echo '  ✅ Índice idx_deliveries_courier removido'

-- 5. LIMPAR TIPOS ENUMERADOS NÃO UTILIZADOS
\echo ''
\echo '🏷️ Removendo tipos enumerados não utilizados...'
DROP TYPE IF EXISTS delivery_status CASCADE;
\echo '  ✅ Tipo delivery_status removido'

DROP TYPE IF EXISTS payment_status CASCADE;
\echo '  ✅ Tipo payment_status removido'

-- 6. OTIMIZAR TABELAS RESTANTES
\echo ''
\echo '⚡ Otimizando tabelas restantes...'

-- Recriar estatísticas
ANALYZE;

COMMIT;

-- 7. EXECUTAR VACUUM FULL
\echo ''
\echo '🔧 Executando limpeza final...'

VACUUM FULL;

-- 8. ESTRUTURA FINAL
\echo ''
\echo '✅ ESTRUTURA FINAL OTIMIZADA:'
\dt

\echo ''
\echo '📊 Resumo da otimização:'
SELECT 
    COUNT(*) as tabelas_restantes,
    pg_size_pretty(SUM(pg_total_relation_size('public.'||tablename))) as tamanho_total
FROM pg_tables 
WHERE schemaname = 'public';

\echo ''
\echo '🎯 TABELAS MANTIDAS (essenciais para o funcionamento):'
\echo '  ✅ users - Usuários do sistema'
\echo '  ✅ profiles - Perfis e roles dos usuários'
\echo '  ✅ restaurants - Restaurantes parceiros'
\echo '  ✅ categories - Categorias de produtos'
\echo '  ✅ products - Produtos dos restaurantes'
\echo '  ✅ addresses - Endereços de entrega'
\echo '  ✅ orders - Pedidos dos clientes'
\echo '  ✅ order_items - Itens dos pedidos'

\echo ''
\echo '🎉 Limpeza concluída! Banco otimizado e pronto para uso.'
\echo ''