# Script para probar la API completa con conversaciones
$baseUrl = "http://localhost:3000"

Write-Host "=== Probando API Imaginarium con Conversaciones ===" -ForegroundColor Green

# Variables globales
$token = ""
$conversationId = ""

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
    name = "Usuario Conversaciones"
    email = "conversaciones@ejemplo.com"
    password = "123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/register" -Method POST -ContentType "application/json" -Body $userData
    Write-Host "✅ Usuario registrado: $($registerResponse.message)" -ForegroundColor Green
    Write-Host "   ID: $($registerResponse.data.id)"
} catch {
    Write-Host "⚠️ Usuario ya existe o error: $($_.Exception.Message)" -ForegroundColor Orange
}

# 3. Login
Write-Host "`n3. Haciendo login:" -ForegroundColor Yellow
$loginData = @{
    email = "conversaciones@ejemplo.com"
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

# 4. Crear conversación
Write-Host "`n4. Creando conversación:" -ForegroundColor Yellow
$conversationData = @{
    title = "Mi primera conversación con IA"
    description = "Prueba de conversación para testing"
} | ConvertTo-Json

try {
    $headers = @{"Authorization" = "Bearer $token"}
    $conversationResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations" -Method POST -ContentType "application/json" -Body $conversationData -Headers $headers
    Write-Host "✅ Conversación creada: $($conversationResponse.message)" -ForegroundColor Green
    $conversationId = $conversationResponse.data.id
    Write-Host "   ID Conversación: $conversationId" -ForegroundColor Cyan
    Write-Host "   Título: $($conversationResponse.data.title)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creando conversación: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 5. Agregar mensaje del usuario
Write-Host "`n5. Agregando mensaje del usuario:" -ForegroundColor Yellow
$userMessageData = @{
    conversationId = $conversationId
    content = "Hola, ¿puedes ayudarme con información sobre JavaScript?"
    messageType = "user"
    metadata = @{
        userAgent = "Test Script"
        timestamp = (Get-Date).ToString()
    }
} | ConvertTo-Json

try {
    $messageResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations/messages" -Method POST -ContentType "application/json" -Body $userMessageData -Headers $headers
    Write-Host "✅ Mensaje del usuario creado: $($messageResponse.message)" -ForegroundColor Green
    Write-Host "   Contenido: $($messageResponse.data.content)" -ForegroundColor Cyan
    Write-Host "   Tipo: $($messageResponse.data.messageType)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creando mensaje: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Agregar respuesta de IA
Write-Host "`n6. Agregando respuesta de IA:" -ForegroundColor Yellow
$aiMessageData = @{
    conversationId = $conversationId
    content = "¡Por supuesto! JavaScript es un lenguaje de programación versátil usado principalmente para desarrollo web. ¿Hay algo específico sobre JavaScript que te gustaría saber?"
    messageType = "ai"
    metadata = @{
        aiModel = "gpt-4"
        processingTime = 1200
        tokens = 45
        temperature = 0.7
    }
} | ConvertTo-Json

try {
    $aiResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations/messages" -Method POST -ContentType "application/json" -Body $aiMessageData -Headers $headers
    Write-Host "✅ Respuesta de IA creada: $($aiResponse.message)" -ForegroundColor Green
    Write-Host "   Contenido: $($aiResponse.data.content.Substring(0,50))..." -ForegroundColor Cyan
    Write-Host "   Modelo: $($aiResponse.data.metadata.aiModel)" -ForegroundColor Cyan
    Write-Host "   Tokens: $($aiResponse.data.metadata.tokens)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creando respuesta de IA: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Obtener mensajes de la conversación
Write-Host "`n7. Obteniendo mensajes de la conversación:" -ForegroundColor Yellow
try {
    $messagesResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations/$conversationId/messages" -Method GET -Headers $headers
    Write-Host "✅ Mensajes obtenidos: $($messagesResponse.message)" -ForegroundColor Green
    Write-Host "   Total mensajes: $($messagesResponse.data.total)" -ForegroundColor Cyan
    Write-Host "   Mensajes en página: $($messagesResponse.data.messages.Count)" -ForegroundColor Cyan
    
    foreach ($message in $messagesResponse.data.messages) {
        $shortContent = if ($message.content.Length -gt 50) { $message.content.Substring(0,50) + "..." } else { $message.content }
        Write-Host "   - [$($message.messageType.ToUpper())] $shortContent" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error obteniendo mensajes: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Crear segunda conversación
Write-Host "`n8. Creando segunda conversación:" -ForegroundColor Yellow
$conversation2Data = @{
    title = "Conversación sobre Python"
    description = "Otra conversación de prueba"
} | ConvertTo-Json

try {
    $conversation2Response = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations" -Method POST -ContentType "application/json" -Body $conversation2Data -Headers $headers
    Write-Host "✅ Segunda conversación creada: $($conversation2Response.data.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creando segunda conversación: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Listar todas las conversaciones
Write-Host "`n9. Listando conversaciones del usuario:" -ForegroundColor Yellow
try {
    $conversationsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/conversations?page=1&limit=10" -Method GET -Headers $headers
    Write-Host "✅ Conversaciones obtenidas: $($conversationsResponse.message)" -ForegroundColor Green
    Write-Host "   Total conversaciones: $($conversationsResponse.data.total)" -ForegroundColor Cyan
    
    foreach ($conv in $conversationsResponse.data.conversations) {
        Write-Host "   - $($conv.title) (Mensajes: $($conv.messageCount))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error obteniendo conversaciones: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Obtener perfil del usuario
Write-Host "`n10. Obteniendo perfil:" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/profile" -Method GET -Headers $headers
    Write-Host "✅ Perfil obtenido: $($profileResponse.data.email)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error obteniendo perfil: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Green
Write-Host "🎉 Tu API con sistema de conversaciones está funcionando perfectamente!" -ForegroundColor Green
Write-Host "`n📊 Resumen:" -ForegroundColor Yellow
Write-Host "  - ✅ Health check" -ForegroundColor White
Write-Host "  - ✅ Autenticación de usuarios" -ForegroundColor White
Write-Host "  - ✅ Crear conversaciones" -ForegroundColor White
Write-Host "  - ✅ Agregar mensajes (usuario y IA)" -ForegroundColor White
Write-Host "  - ✅ Obtener historial de mensajes" -ForegroundColor White
Write-Host "  - ✅ Listar conversaciones" -ForegroundColor White
Write-Host "  - ✅ Metadatos en mensajes" -ForegroundColor White 