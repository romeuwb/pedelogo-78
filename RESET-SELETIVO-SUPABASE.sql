-- ==========================================
-- RESET SELETIVO - PRESERVA AUTH, REMOVE RESTO
-- Para Supabase - mantém apenas sistema essencial
-- ==========================================

-- 🔍 VERIFICAR O QUE EXISTE
SELECT 'SCHEMAS EXISTENTES:' as info;
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- Ver tabelas por schema
SELECT 'TABELAS POR SCHEMA:' as info;
SELECT 
    schemaname,
    COUNT(*) as tabelas
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
GROUP BY schemaname
ORDER BY tabelas DESC;

-- ==========================================
-- 🎯 LIMPEZA SELETIVA
-- ==========================================

BEGIN;

-- Remover apenas do schema PUBLIC (preservar auth, storage, etc.)
DO $$ 
DECLARE
    r RECORD;
    schemas_to_clean text[] := ARRAY['public'];
    schema_name text;
BEGIN
    FOREACH schema_name IN ARRAY schemas_to_clean
    LOOP
        RAISE NOTICE 'Limpando schema: %', schema_name;
        
        -- Dropar todas as tabelas do schema
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = schema_name) 
        LOOP
            EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', schema_name, r.tablename);
            RAISE NOTICE 'Tabela removida: %.%', schema_name, r.tablename;
        END LOOP;
        
        -- Dropar tipos customizados do schema
        FOR r IN (
            SELECT t.typname 
            FROM pg_type t 
            JOIN pg_namespace n ON t.typnamespace = n.oid 
            WHERE n.nspname = schema_name
        ) 
        LOOP
            EXECUTE format('DROP TYPE IF EXISTS %I.%I CASCADE', schema_name, r.typname);
            RAISE NOTICE 'Tipo removido: %.%', schema_name, r.typname;
        END LOOP;
        
    END LOOP;
END $$;

COMMIT;

-- ==========================================
-- ✅ VERIFICAR RESULTADO FINAL
-- ==========================================

SELECT 'RESULTADO APÓS LIMPEZA:' as info;
SELECT 
    schemaname,
    COUNT(*) as tabelas
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
GROUP BY schemaname
ORDER BY tabelas DESC;

-- Verificar se public está vazio
SELECT 'SCHEMA PUBLIC (deve estar vazio):' as info;
SELECT COALESCE(COUNT(*)::text, '0') || ' tabelas' as resultado
FROM pg_tables 
WHERE schemaname = 'public';

SELECT '✅ LIMPEZA SELETIVA CONCLUÍDA!' as resultado;

-- ==========================================
-- 📝 PRÓXIMO PASSO: EXECUTAR SCRIPT DE RECRIAÇÃO
-- Após esse script, execute: RECRIAR-TUDO-NOVO.sql
-- ==========================================