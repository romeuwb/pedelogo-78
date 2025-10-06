# Script para executar análises no banco PedeLogo
# Execute como: .\executar-analise.ps1

param(
    [string]$Senha = "postgres"
)

$env:PGPASSWORD = $Senha
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

Write-Host "🔍 Executando análise do banco PedeLogo..." -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Executar queries de análise
& $psqlPath -U postgres -d pedelogo -f "analise-queries.sql"

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✅ Análise concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Para conectar manualmente ao banco:" -ForegroundColor Yellow
Write-Host "psql -U postgres -d pedelogo" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para conectar ao Supabase remoto, use as credenciais do .env.local" -ForegroundColor Yellow
