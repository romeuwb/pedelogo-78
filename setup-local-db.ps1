# Script para configurar banco local PostgreSQL para análise do PedeLogo
# Execute como: .\setup-local-db.ps1

$env:PGPASSWORD = "postgres"  # Assumindo senha padrão - altere se necessário
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

Write-Host "🔧 Configurando banco de dados local para análise do PedeLogo..." -ForegroundColor Green

# 1. Criar database pedelogo
Write-Host "📊 Criando database 'pedelogo'..."
& $psqlPath -U postgres -d postgres -c "DROP DATABASE IF EXISTS pedelogo;"
& $psqlPath -U postgres -d postgres -c "CREATE DATABASE pedelogo;"

# 2. Aplicar schema adaptado
Write-Host "🏗️ Aplicando schema adaptado para local..."
& $psqlPath -U postgres -d pedelogo -f "schema-local.sql"

# 3. Verificar tabelas criadas
Write-Host "✅ Verificando tabelas criadas..."
& $psqlPath -U postgres -d pedelogo -c "\dt"

Write-Host "🎉 Setup concluído! Banco 'pedelogo' pronto para análise." -ForegroundColor Green
Write-Host "Para conectar: psql -U postgres -d pedelogo" -ForegroundColor Yellow