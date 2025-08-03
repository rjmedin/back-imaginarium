# Script para verificar archivos TypeScript con problemas binarios
Write-Host "🔍 Verificando archivos TypeScript..." -ForegroundColor Yellow

$tsFiles = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $tsFiles) {
    Write-Host "Verificando: $($file.FullName)" -ForegroundColor Cyan
    
    try {
        # Intentar leer el archivo como texto
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        
        # Verificar si contiene caracteres nulos o binarios
        if ($content -match "[\x00-\x08\x0E-\x1F\x7F-\xFF]") {
            Write-Host "❌ PROBLEMA DETECTADO: $($file.FullName)" -ForegroundColor Red
            Write-Host "   Contiene caracteres binarios" -ForegroundColor Red
        } else {
            Write-Host "✅ OK: $($file.FullName)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ ERROR AL LEER: $($file.FullName)" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🧪 Probando compilación TypeScript..." -ForegroundColor Yellow
try {
    $output = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compila sin errores" -ForegroundColor Green
    } else {
        Write-Host "❌ Error en compilación TypeScript:" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error ejecutando tsc: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Verificación completa" -ForegroundColor Green 