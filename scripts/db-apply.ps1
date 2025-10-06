param(
  [string]$ConnectionString
)

if (-not $ConnectionString) {
  if ($Env:SUPABASE_DB_URL) {
    $ConnectionString = $Env:SUPABASE_DB_URL
  } else {
    Write-Error "Defina -ConnectionString ou a variável de ambiente SUPABASE_DB_URL"
    exit 1
  }
}

$dir = Join-Path $PSScriptRoot "..\supabase\migrations"
$files = Get-ChildItem -Path $dir -Filter *.sql | Sort-Object Name

foreach ($f in $files) {
  Write-Host "Aplicando migration: $($f.Name)"
  psql "$ConnectionString" -f $f.FullName
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao aplicar $($f.Name)"
    exit 1
  }
}

Write-Host "Migrations aplicadas com sucesso."
