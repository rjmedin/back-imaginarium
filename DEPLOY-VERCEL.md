#  Guía Completa de Deploy en Vercel

##  **Requisitos Previos**

### 1. **MongoDB Atlas (Base de Datos en la Nube)**
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (gratis disponible)
3. Configurar acceso de red: `0.0.0.0/0` (permitir todas las IPs)
4. Crear usuario de base de datos
5. Obtener connection string: `mongodb+srv://usuario:password@cluster.mongodb.net/imaginarium_db`

### 2. **Cuenta de Vercel**
1. Crear cuenta en [Vercel](https://vercel.com)
2. Conectar tu repositorio de GitHub/GitLab
3. Instalar Vercel CLI: `npm i -g vercel`

##  **Configuración Paso a Paso**

### **Paso 1: Preparar Variables de Entorno**

En el dashboard de Vercel, ve a tu proyecto  Settings  Environment Variables:

```env
# Variables OBLIGATORIAS
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/imaginarium_db
JWT_SECRET=tu_clave_secreta_super_segura_aqui_64_caracteres_minimo
NODE_ENV=production

# Variables OPCIONALES pero recomendadas
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_SWAGGER=true

# Variables para n8n
N8N_URL=https://tu-instancia-n8n.com
N8N_WEBHOOK_URL=https://imaginarium-hack-3d.vercel.app/api/v1/webhooks

# CORS para tu frontend
FRONTEND_URL=https://tu-frontend.vercel.app
CORS_ORIGINS=https://tu-frontend.vercel.app,https://app.n8n.cloud
```

### **Paso 2: Deploy Automático**

#### **Opción A: Deploy via GitHub (Recomendado)**
1. Sube tu código a GitHub:
```bash
git add .
git commit -m "feat: Configuración para Vercel con integración n8n"
git push origin main
```

2. En Vercel  New Project  Import tu repositorio
3. Vercel detectará automáticamente la configuración
4. ¡Deploy automático! 

#### **Opción B: Deploy via CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Seguir las instrucciones en pantalla
# Configurar variables de entorno cuando te lo pida
```

### **Paso 3: Configurar Dominio Personalizado (Opcional)**
1. En Vercel  Settings  Domains
2. Agregar tu dominio personalizado
3. Configurar DNS según las instrucciones

##  **Verificar el Deploy**

### **Endpoints para Probar:**

1. **Health Check**
   ```bash
   curl https://imaginarium-hack-3d.vercel.app/health
   ```

2. **API Info**
   ```bash
   curl https://imaginarium-hack-3d.vercel.app/api
   ```

3. **Swagger Documentation**
   ```
   https://imaginarium-hack-3d.vercel.app/api-docs
   ```

4. **Registrar Usuario**
   ```bash
   curl -X POST https://imaginarium-hack-3d.vercel.app/api/v1/users/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@ejemplo.com","password":"123456"}'
   ```

5. **n8n Endpoint Test**
   ```bash
   curl -X POST https://imaginarium-hack-3d.vercel.app/api/v1/webhooks/test \
     -H "Authorization: Bearer TU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

##  **Seguridad en Producción**

### **Variables de Entorno Críticas:**

1. **JWT_SECRET**: Debe ser un string aleatorio de 64+ caracteres
   ```bash
   # Generar clave segura
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **MONGODB_URI**: Usar MongoDB Atlas con credenciales seguras

3. **CORS_ORIGINS**: Especificar dominios específicos, no usar '*'

### **Configuración de CORS para Producción:**
```env
CORS_ORIGINS=https://tu-frontend.vercel.app,https://app.n8n.cloud,https://tu-dominio-n8n.com
```

##  **Integración con n8n en Producción**

### **1. Configurar Credenciales en n8n:**
- Tipo: `HTTP Header Auth`
- Name: `Authorization` 
- Value: `Bearer TU_JWT_TOKEN_DE_PRODUCCION`

### **2. URLs de Producción para n8n:**
```
Base URL: https://imaginarium-hack-3d.vercel.app
Health: https://imaginarium-hack-3d.vercel.app/health
Crear Conversación: POST https://imaginarium-hack-3d.vercel.app/api/v1/n8n/conversations/create
Enviar Mensaje: POST https://imaginarium-hack-3d.vercel.app/api/v1/n8n/messages/send
Webhook Test: POST https://imaginarium-hack-3d.vercel.app/api/v1/webhooks/test
```

##  **Monitoreo y Logs**

### **Ver Logs en Vercel:**
1. Dashboard  Tu Proyecto  Functions
2. Click en cualquier función para ver logs
3. Logs en tiempo real durante las peticiones

### **Configurar Alertas:**
1. Vercel  Settings  Integrations
2. Configurar notificaciones (Slack, Discord, etc.)

##  **Solución de Problemas Comunes**

### **Error: "Unable to connect to MongoDB"**
-  Verificar MONGODB_URI en variables de entorno
-  Verificar que el cluster esté activo en Atlas
-  Verificar configuración de red (0.0.0.0/0)

### **Error: "JWT Secret not provided"**
-  Verificar JWT_SECRET en variables de entorno
-  Asegurar que tiene 32+ caracteres

### **Error de CORS**
-  Verificar CORS_ORIGINS incluye tu dominio
-  Verificar que incluya https:// en las URLs

### **Timeout en Vercel**
-  Las funciones tienen límite de 10s (hobby) / 30s (pro)
-  Optimizar consultas de base de datos
-  Usar conexión persistente a MongoDB

##  **URLs Finales de tu API**

Después del deploy exitoso tendrás:

```
 API Base: https://tu-proyecto.vercel.app
 Swagger UI: https://tu-proyecto.vercel.app/api-docs
 Health Check: https://tu-proyecto.vercel.app/health
 n8n Endpoints: https://tu-proyecto.vercel.app/api/v1/n8n/*
 Webhooks: https://tu-proyecto.vercel.app/api/v1/webhooks/*
 Users API: https://tu-proyecto.vercel.app/api/v1/users/*
 Conversations: https://tu-proyecto.vercel.app/api/v1/conversations/*
```

##  **Actualizaciones Futuras**

Para actualizar tu API:
1. Hacer cambios en tu código
2. `git push`  Deploy automático en Vercel
3. Vercel detecta cambios y redeploya automáticamente

---

##  **Checklist Final**

- [ ] MongoDB Atlas configurado y funcionando
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso (sin errores)
- [ ] Health check responde correctamente
- [ ] Swagger UI accesible
- [ ] Endpoints de n8n funcionando
- [ ] CORS configurado para tus dominios
- [ ] JWT Secret seguro configurado

**¡Tu API está lista para producción! **

---

 **¿Problemas?** Revisa los logs en Vercel Dashboard o consulta la documentación.
