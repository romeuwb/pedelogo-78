-- ==========================================
-- RESET TOTAL - REMOVE TODAS AS TABELAS
-- Script ultra-agressivo para Supabase
-- ==========================================

-- 🔍 PRIMEIRO: Ver todas as tabelas existentes
SELECT 'TOTAL DE TABELAS ANTES DO RESET:' as info;
SELECT 
    schemaname,
    COUNT(*) as tabelas
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
GROUP BY schemaname
ORDER BY tabelas DESC;

-- Listar todas as tabelas do schema public
SELECT 'TABELAS NO SCHEMA PUBLIC:' as info;
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ==========================================
-- 🗑️ REMOVER TUDO DO SCHEMA PUBLIC
-- ==========================================

-- Desabilitar verificações de foreign key
SET session_replication_role = replica;

-- Script dinâmico para dropar TODAS as tabelas do public
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Dropar todas as tabelas do schema public
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Tabela removida: %', r.tablename;
    END LOOP;
    
    -- Dropar todos os tipos customizados
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        RAISE NOTICE 'Tipo removido: %', r.typname;
    END LOOP;
    
    -- Dropar todas as funções customizadas
    FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '() CASCADE';
        RAISE NOTICE 'Função removida: %', r.proname;
    END LOOP;
    
END $$;

-- Reabilitar verificações
SET session_replication_role = DEFAULT;

-- ==========================================
-- ✅ VERIFICAR RESULTADO
-- ==========================================

SELECT 'TABELAS RESTANTES APÓS RESET:' as info;
SELECT 
    schemaname,
    COUNT(*) as tabelas
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
GROUP BY schemaname;

-- Se ainda houver tabelas no public, listar
SELECT 'TABELAS NO PUBLIC (deve estar vazio):' as info;
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

SELECT '🎯 RESET TOTAL EXECUTADO!' as resultado;