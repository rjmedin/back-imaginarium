# Imaginarium API

API REST construida con Node.js, Express, TypeScript y MongoDB siguiendo arquitectura limpia.

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** (Arquitectura Limpia) con las siguientes capas:

```
src/
├── domain/                 # Capa de Dominio
│   ├── entities/          # Entidades de negocio
│   ├── repositories/      # Interfaces de repositorios
│   └── value-objects/     # Objetos de valor
├── application/           # Capa de Aplicación
│   ├── use-cases/        # Casos de uso
│   └── dtos/             # Data Transfer Objects
├── infrastructure/       # Capa de Infraestructura
│   ├── database/         # Configuración de base de datos
│   ├── repositories/     # Implementaciones de repositorios
│   └── container/        # Inyección de dependencias
├── presentation/         # Capa de Presentación
│   ├── controllers/      # Controladores HTTP
│   ├── routes/           # Definición de rutas
│   ├── middleware/       # Middlewares
│   └── validation/       # Esquemas de validación
└── shared/               # Código compartido
    ├── errors/           # Manejo de errores
    ├── utils/            # Utilidades
    └── config/           # Configuración
```

## 🚀 Características

- ✅ Arquitectura limpia y escalable
- ✅ TypeScript con tipado estricto
- ✅ Autenticación JWT
- ✅ Validación de datos con Joi
- ✅ Rate limiting
- ✅ Logging con Winston
- ✅ Middleware de seguridad (Helmet, CORS)
- ✅ Manejo centralizado de errores
- ✅ Conexión MongoDB con Mongoose
- ✅ Inyección de dependencias

## 📋 Requisitos

- Node.js >= 16.x
- npm >= 8.x
- MongoDB >= 5.x (o usar Docker)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd imaginarium-hack-3d
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edita las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/imaginarium_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar base de datos

#### Opción A: Usar Docker (Recomendado)

```bash
# Iniciar MongoDB con Docker Compose
docker-compose up -d mongodb

# Ver logs
docker-compose logs -f mongodb
```

#### Opción B: MongoDB local

Asegúrate de tener MongoDB instalado y ejecutándose en `mongodb://localhost:27017`

### 5. Instalar dependencias de TypeScript

```bash
npm install -g ts-node typescript
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
# Iniciar en modo desarrollo con hot reload
npm run dev
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor en producción
npm start
```

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/v1/users/register` | Registrar usuario | No |
| POST | `/api/v1/users/login` | Iniciar sesión | No |
| GET | `/api/v1/users/profile` | Obtener perfil | Sí |

### Usuarios (Solo Admin)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users` | Listar usuarios | Sí (Admin) |

### Utilidades

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |

## 🔧 Ejemplos de uso

### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "123456"
  }'
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "123456"
  }'
```

### Obtener perfil (requiere token)

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

### Listar usuarios (requiere admin)

```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer TU_JWT_TOKEN_ADMIN"
```

## 🧪 Scripts disponibles

```bash
npm run dev          # Iniciar en desarrollo
npm run build        # Compilar TypeScript
npm start            # Iniciar en producción
npm run lint         # Linter de código
npm run lint:fix     # Corregir errores de linting automáticamente
npm test             # Ejecutar tests (cuando se implementen)
```

## 🐳 Docker

### Servicios disponibles

- **MongoDB**: Puerto 27017
- **Mongo Express**: Puerto 8081 (Interfaz web para MongoDB)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Elimina los datos)
docker-compose down -v
```

## 🔒 Seguridad

- Autenticación JWT
- Hashing de contraseñas con bcrypt
- Rate limiting por IP
- Validación de entrada con Joi
- Headers de seguridad con Helmet
- CORS configurado

## 📝 Estructura de respuestas

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // datos de respuesta
  }
}
```

### Respuesta de error

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔧 Próximas funcionalidades

- [ ] Tests unitarios y de integración
- [ ] Documentación Swagger/OpenAPI
- [ ] Logs estructurados
- [ ] Métricas y monitoreo
- [ ] Cache con Redis
- [ ] Subida de archivos
- [ ] Notificaciones por email
- [ ] Roles y permisos avanzados

## 📞 Soporte

Si tienes problemas o preguntas, por favor abre un issue en el repositorio.
