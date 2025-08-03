# 📚 API Endpoints - Sistema de Conversaciones con IA

## 🔧 Base URL
```
http://localhost:3000
```

## 📋 Índice de Endpoints

- [Utilidades](#utilidades)
- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Conversaciones](#conversaciones)
- [Mensajes](#mensajes)

---

## 🛠️ Utilidades

### Health Check
**GET** `/health`

Verifica que la API esté funcionando correctamente.

**Respuesta:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔐 Autenticación

### Registrar Usuario
**POST** `/api/v1/users/register`

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456",
  "role": "user" // Opcional: "user" o "admin"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "juan@ejemplo.com",
    "name": "Juan Pérez",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Iniciar Sesión
**POST** `/api/v1/users/login`

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "juan@ejemplo.com",
      "name": "Juan Pérez",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👥 Usuarios

### Obtener Perfil
**GET** `/api/v1/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "juan@ejemplo.com",
    "role": "user"
  }
}
```

### Listar Usuarios (Solo Admin)
**GET** `/api/v1/users?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "users": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## 💬 Conversaciones

### Crear Conversación
**POST** `/api/v1/conversations`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Conversación sobre JavaScript",
  "description": "Preguntas y respuestas sobre desarrollo web" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Conversación creada exitosamente",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Conversación sobre JavaScript",
    "description": "Preguntas y respuestas sobre desarrollo web",
    "isActive": true,
    "messageCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Listar Conversaciones del Usuario
**GET** `/api/v1/conversations?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Conversaciones obtenidas exitosamente",
  "data": {
    "conversations": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Conversación sobre JavaScript",
        "description": "Preguntas y respuestas sobre desarrollo web",
        "isActive": true,
        "messageCount": 5,
        "lastMessageAt": "2024-01-15T11:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 📩 Mensajes

### Agregar Mensaje
**POST** `/api/v1/conversations/messages`

**Headers:**
```
Authorization: Bearer {token}
```

**Body para Mensaje de Usuario:**
```json
{
  "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "content": "¿Puedes explicarme qué es JavaScript?",
  "messageType": "user",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Body para Respuesta de IA:**
```json
{
  "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "content": "JavaScript es un lenguaje de programación versátil...",
  "messageType": "ai",
  "metadata": {
    "aiModel": "gpt-4",
    "processingTime": 1500,
    "tokens": 85,
    "temperature": 0.7,
    "maxTokens": 150
  }
}
```

**Body para Mensaje de Sistema:**
```json
{
  "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "content": "Conversación iniciada. El asistente está listo.",
  "messageType": "system",
  "metadata": {
    "systemEvent": "conversation_started",
    "version": "1.0"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensaje creado exitosamente",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "content": "¿Puedes explicarme qué es JavaScript?",
    "messageType": "user",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "metadata": {
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Obtener Mensajes de una Conversación
**GET** `/api/v1/conversations/{conversationId}/messages?page=1&limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensajes obtenidos exitosamente",
  "data": {
    "messages": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "content": "¿Puedes explicarme qué es JavaScript?",
        "messageType": "user",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "conversationId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "content": "JavaScript es un lenguaje de programación...",
        "messageType": "ai",
        "timestamp": "2024-01-15T10:31:00.000Z",
        "metadata": {
          "aiModel": "gpt-4",
          "tokens": 85,
          "processingTime": 1500
        }
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

## 📊 Tipos de Mensaje

### MessageType (Enum)
- `user`: Mensaje enviado por el usuario
- `ai`: Respuesta generada por la IA
- `system`: Mensaje del sistema (notificaciones, estados, etc.)

### Metadata Común

**Para mensajes de usuario:**
```json
{
  "userAgent": "string",
  "timestamp": "ISO Date",
  "sessionId": "string",
  "clientVersion": "string"
}
```

**Para mensajes de IA:**
```json
{
  "aiModel": "gpt-4",
  "processingTime": 1500,
  "tokens": 85,
  "temperature": 0.7,
  "maxTokens": 150,
  "finishReason": "stop"
}
```

**Para mensajes de sistema:**
```json
{
  "systemEvent": "conversation_started",
  "version": "1.0",
  "timestamp": "ISO Date"
}
```

---

## ⚠️ Códigos de Error

### 400 - Bad Request
- Datos de entrada inválidos
- Faltan campos requeridos
- Formato de datos incorrecto

### 401 - Unauthorized
- Token de acceso faltante o inválido
- Credenciales incorrectas

### 403 - Forbidden
- Permisos insuficientes
- Usuario no tiene acceso al recurso

### 404 - Not Found
- Recurso no encontrado
- Conversación no existe
- Usuario no existe

### 409 - Conflict
- Email ya registrado
- Recurso ya existe

### 500 - Internal Server Error
- Error interno del servidor
- Error de base de datos

---

## 🚀 Flujo Típico de Uso

1. **Registrar usuario**: `POST /api/v1/users/register`
2. **Iniciar sesión**: `POST /api/v1/users/login`
3. **Crear conversación**: `POST /api/v1/conversations`
4. **Agregar mensaje de usuario**: `POST /api/v1/conversations/messages`
5. **Agregar respuesta de IA**: `POST /api/v1/conversations/messages`
6. **Obtener historial**: `GET /api/v1/conversations/{id}/messages`
7. **Listar conversaciones**: `GET /api/v1/conversations`

---

## 🔧 Rate Limiting

- **Ventana**: 15 minutos
- **Límite**: 100 peticiones por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite máximo
  - `X-RateLimit-Remaining`: Peticiones restantes
  - `X-RateLimit-Reset`: Timestamp de reset

---

## 📝 Notas Importantes

- Todos los endpoints (excepto health, register y login) requieren autenticación
- Los tokens JWT expiran en 24 horas por defecto
- Las conversaciones son privadas para cada usuario
- Los mensajes se ordenan cronológicamente (timestamp ascendente)
- La paginación utiliza 1-indexing (página 1 es la primera)
- Los metadatos son opcionales y flexibles
- Las fechas se devuelven en formato ISO 8601 