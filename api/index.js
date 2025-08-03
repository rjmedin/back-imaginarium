// Imaginarium API - Fase 1: Agregando Module Aliases gradualmente
console.log("🚀 Imaginarium API - Fase 1: Module Aliases");

// PASO 1: Configurar module aliases (manteniendo compatibilidad)
let moduleAliasConfigured = false;
try {
  console.log("🔧 Configurando module aliases...");
  const moduleAlias = require("module-alias");
  moduleAlias.addAliases({
    "@domain": __dirname + "/../dist/domain",
    "@application": __dirname + "/../dist/application", 
    "@infrastructure": __dirname + "/../dist/infrastructure",
    "@presentation": __dirname + "/../dist/presentation",
    "@shared": __dirname + "/../dist/shared"
  });
  moduleAliasConfigured = true;
  console.log("✅ Module aliases configurados exitosamente");
} catch (error) {
  console.error("❌ Error configurando module aliases:", error.message);
}

// PASO 2: Intentar cargar módulos compilados gradualmente
let compiledModules = {
  config: null,
  logger: null,
  database: null,
  app: null
};

// Intentar cargar config compilado
if (moduleAliasConfigured) {
  try {
    console.log("📦 Intentando cargar config compilado...");
    const configModule = require("../dist/shared/config/config");
    compiledModules.config = configModule;
    console.log("✅ Config compilado cargado exitosamente");
  } catch (error) {
    console.error("⚠️ No se pudo cargar config compilado:", error.message);
    console.log("📝 Usando configuración manual como fallback");
  }
}

// Función helper para enviar JSON como text/plain (mantener funcionando)
function sendJSON(res, data, statusCode = 200) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(statusCode).send(jsonString);
    return true;
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`{"error":"JSON stringify failed","message":"${error.message}"}`);
    return false;
  }
}

// Función para obtener configuración (compilada o fallback)
function getConfig() {
  if (compiledModules.config) {
    console.log("📋 Usando config compilado");
    return compiledModules.config.config;
  } else {
    console.log("📋 Usando config manual fallback");
    return {
      port: parseInt(process.env.PORT || '3000'),
      nodeEnv: process.env.NODE_ENV || 'development',
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db',
      jwtSecret: process.env.JWT_SECRET || 'imaginarium_secret_key_2024',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    };
  }
}

module.exports = async (req, res) => {
  console.log("📥 Request:", req.method, req.url);
  
  try {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS request");
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Creando Express app...");
    const express = require("express");
    const app = express();
    
    // Obtener configuración (compilada o fallback)
    const config = getConfig();
    
    // Middleware básico
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // HEALTH CHECK (mejorado con config)
    app.get('/health', (req, res) => {
      console.log("💚 Health check");
      
      const healthData = {
        success: true,
        message: "API funcionando correctamente. Todo va bien.",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: config.nodeEnv,
        features: {
          swagger: process.env.ENABLE_SWAGGER === 'true',
          n8n: true,
          webhooks: true,
          moduleAliases: moduleAliasConfigured,
          compiledConfig: compiledModules.config !== null
        }
      };
      
      sendJSON(res, healthData);
      console.log("✅ Health check enviado");
    });
    
    // DEBUG ENDPOINT (mejorado con info de módulos)
    app.get('/debug', (req, res) => {
      console.log("🔍 Debug endpoint");
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        method: "json_as_text_plain",
        phase: "Fase 1 - Module Aliases",
        moduleStatus: {
          aliases: moduleAliasConfigured,
          config: compiledModules.config !== null,
          logger: compiledModules.logger !== null,
          database: compiledModules.database !== null,
          app: compiledModules.app !== null
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          ENABLE_SWAGGER: process.env.ENABLE_SWAGGER,
          MONGODB_URI: process.env.MONGODB_URI ? "Configurado" : "No configurado",
          JWT_SECRET: process.env.JWT_SECRET ? "Configurado" : "No configurado"
        },
        paths: {
          __dirname: __dirname,
          cwd: process.cwd()
        },
        config: {
          nodeEnv: config.nodeEnv,
          swaggerEnabled: process.env.ENABLE_SWAGGER === 'true',
          source: compiledModules.config ? "compiled" : "fallback"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, debugData);
      console.log("✅ Debug enviado");
    });
    
    // API-DOCS (Swagger placeholder)
    app.get('/api-docs', (req, res) => {
      console.log("📚 API Documentation");
      
      const docsData = {
        success: true,
        message: "Documentación de Imaginarium API",
        note: "Swagger temporalmente deshabilitado, usando respuestas JSON como text/plain",
        version: "1.0.0",
        phase: "Fase 1 - Module Aliases integrados",
        moduleAliases: moduleAliasConfigured,
        endpoints: {
          health: {
            method: "GET",
            path: "/health",
            description: "Health check del sistema"
          },
          debug: {
            method: "GET", 
            path: "/debug",
            description: "Información de debug del sistema y estado de módulos"
          },
          users: {
            method: "GET",
            path: "/api/users",
            description: "Lista de usuarios (requiere autenticación)"
          },
          conversations: {
            method: "GET",
            path: "/api/conversations", 
            description: "Lista de conversaciones (requiere autenticación)"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, docsData);
      console.log("✅ API docs enviado");
    });
    
    // API/USERS ENDPOINT
    app.get('/api/users', (req, res) => {
      console.log("👥 Users endpoint");
      
      const usersData = {
        success: true,
        message: "Endpoint de usuarios funcionando",
        note: "Base de datos temporalmente deshabilitada para testing",
        phase: "Fase 1 - Con module aliases",
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, usersData);
      console.log("✅ Users endpoint enviado");
    });
    
    // API/CONVERSATIONS ENDPOINT  
    app.get('/api/conversations', (req, res) => {
      console.log("💬 Conversations endpoint");
      
      const conversationsData = {
        success: true,
        message: "Endpoint de conversaciones funcionando", 
        note: "Base de datos temporalmente deshabilitada para testing",
        phase: "Fase 1 - Con module aliases",
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, conversationsData);
      console.log("✅ Conversations endpoint enviado");
    });
    
    // PÁGINA PRINCIPAL
    app.get('/', (req, res) => {
      console.log("🏠 Página principal");
      
      const homeData = {
        success: true,
        message: "🎉 Imaginarium API - Sistema de Conversaciones con IA",
        version: "1.0.0",
        phase: "Fase 1 - Module Aliases Integrados",
        status: "Funcionando correctamente con JSON como text/plain",
        environment: config.nodeEnv,
        moduleStatus: {
          aliases: moduleAliasConfigured,
          compiledModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null)
        },
        endpoints: {
          health: "/health",
          docs: "/api-docs", 
          debug: "/debug",
          api: "/api/v1",
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: "API funcionando con module aliases configurados. Próximo: cargar módulos compilados gradualmente.",
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, homeData);
      console.log("✅ Home page enviado");
    });
    
    // API INFO
    app.get('/api', (req, res) => {
      console.log("📋 API info");
      
      const apiData = {
        success: true,
        message: "Imaginarium API v1.0.0 - Fase 1",
        documentation: "/api-docs",
        endpoints: {
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: "Todas las respuestas en formato JSON válido con Content-Type text/plain",
        moduleAliases: moduleAliasConfigured
      };
      
      sendJSON(res, apiData);
      console.log("✅ API info enviado");
    });
    
    // CATCH ALL - 404
    app.use('*', (req, res) => {
      console.log("❓ Endpoint no encontrado:", req.url);
      
      const notFoundData = {
        success: false,
        message: "Endpoint no encontrado",
        path: req.url,
        method: req.method,
        availableEndpoints: [
          "/",
          "/health", 
          "/debug",
          "/api-docs",
          "/api",
          "/api/users",
          "/api/conversations"
        ],
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, notFoundData, 404);
    });
    
    console.log("✅ Express app configurada completamente - Fase 1");
    console.log("🚀 Delegando request a Express...");
    
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error crítico:", error);
    
    // Respuesta de emergencia
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const errorResponse = {
      success: false,
      message: "Error crítico del servidor",
      error: error.message,
      phase: "Fase 1 - Module Aliases",
      timestamp: new Date().toISOString()
    };
    
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
}; 