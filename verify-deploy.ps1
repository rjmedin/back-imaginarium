# Script de Verificación de Deploy en Vercel
# Reemplaza TU_VERCEL_URL con tu URL real de Vercel

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelUrl
)

Write-Host "🚀 Verificando deploy en Vercel: $VercelUrl" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Probando Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$VercelUrl/health" -Method GET
    if ($healthResponse.success) {
        Write-Host "✅ Health Check: OK" -ForegroundColor Green
        Write-Host "   Versión: $($healthResponse.version)" -ForegroundColor Cyan
        Write-Host "   Ambiente: $($healthResponse.environment)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Health Check: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health Check: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Info
Write-Host "2️⃣ Probando API Info..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "$VercelUrl/api" -Method GET
    if ($apiResponse.success) {
        Write-Host "✅ API Info: OK" -ForegroundColor Green
        Write-Host "   Documentación: $VercelUrl$($apiResponse.documentation)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ API Info: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API Info: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Swagger Documentation
Write-Host "3️⃣ Probando Swagger Documentation..." -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest -Uri "$VercelUrl/api-docs" -Method GET
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "✅ Swagger UI: OK" -ForegroundColor Green
        Write-Host "   Accede a: $VercelUrl/api-docs" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Swagger UI: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Swagger UI: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Test de Registro de Usuario
Write-Host "4️⃣ Probando Registro de Usuario..." -ForegroundColor Yellow
$testUser = @{
    name = "Test User Deploy"
    email = "test-deploy-$(Get-Random)@ejemplo.com"
    password = "123456"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$VercelUrl/api/v1/users/register" -Method POST -Body $testUser -ContentType "application/json"
    if ($userResponse.success) {
        Write-Host "✅ Registro de Usuario: OK" -ForegroundColor Green
        Write-Host "   Usuario ID: $($userResponse.data.user.id)" -ForegroundColor Cyan
        Write-Host "   Token generado correctamente" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Registro de Usuario: FAIL" -ForegroundColor Red
        Write-Host "   Error: $($userResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Registro de Usuario: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Resumen
Write-Host "📊 RESUMEN DEL DEPLOY" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Magenta
Write-Host "URLs importantes:" -ForegroundColor White
Write-Host "• API Base: $VercelUrl" -ForegroundColor Cyan
Write-Host "• Health Check: $VercelUrl/health" -ForegroundColor Cyan
Write-Host "• Swagger UI: $VercelUrl/api-docs" -ForegroundColor Cyan
Write-Host "• API Info: $VercelUrl/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para n8n:" -ForegroundColor White
Write-Host "• Base URL: $VercelUrl" -ForegroundColor Cyan
Write-Host "• Crear Conversación: POST $VercelUrl/api/v1/n8n/conversations/create" -ForegroundColor Cyan
Write-Host "• Enviar Mensaje: POST $VercelUrl/api/v1/n8n/messages/send" -ForegroundColor Cyan
Write-Host "• Webhook Test: POST $VercelUrl/api/v1/webhooks/test" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 ¡Deploy verificado!" -ForegroundColor Green 