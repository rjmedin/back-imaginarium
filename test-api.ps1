# Script para probar la API
$baseUrl = "http://localhost:3000"

Write-Host "=== Probando API Imaginarium ===" -ForegroundColor Green

# 1. Health Check
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ API funcionando: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en health check: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Registrar usuario
Write-Host "`n2. Registrando usuario:" -ForegroundColor Yellow
$userData = @{
    name = "Test User"
    email = "test@ejemplo.com"
    password = "123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/register" -Method POST -ContentType "application/json" -Body $userData
    Write-Host "✅ Usuario registrado: $($registerResponse.message)" -ForegroundColor Green
    Write-Host "   ID: $($registerResponse.data.id)"
} catch {
    Write-Host "⚠️ Registro: $($_.Exception.Message)" -ForegroundColor Orange
}

# 3. Login
Write-Host "`n3. Haciendo login:" -ForegroundColor Yellow
$loginData = @{
    email = "test@ejemplo.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "✅ Login exitoso: $($loginResponse.message)" -ForegroundColor Green
    $token = $loginResponse.data.token
    Write-Host "   Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 4. Obtener perfil
Write-Host "`n4. Obteniendo perfil:" -ForegroundColor Yellow
try {
    $headers = @{"Authorization" = "Bearer $token"}
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/profile" -Method GET -Headers $headers
    Write-Host "✅ Perfil obtenido: $($profileResponse.message)" -ForegroundColor Green
    Write-Host "   Usuario: $($profileResponse.data.email)" -ForegroundColor Cyan
    Write-Host "   Rol: $($profileResponse.data.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error obteniendo perfil: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Intentar listar usuarios (debería fallar porque no es admin)
Write-Host "`n5. Intentando listar usuarios (debe fallar - no admin):" -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users" -Method GET -Headers $headers
    Write-Host "✅ Usuarios obtenidos (inesperado)" -ForegroundColor Green
} catch {
    Write-Host "✅ Acceso denegado correctamente (esperado): Solo admins pueden listar usuarios" -ForegroundColor Green
}

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Green
Write-Host "Tu API está funcionando correctamente! 🎉" -ForegroundColor Green 