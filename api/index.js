// Imaginarium API - Fase 1: Agregando Module Aliases gradualmente
console.log("🚀 Imaginarium API - Fase 1: Module Aliases + Database");

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

// Intentar cargar logger compilado
if (moduleAliasConfigured) {
  try {
    console.log("📦 Intentando cargar logger compilado...");
    const loggerModule = require("../dist/shared/utils/logger");
    compiledModules.logger = loggerModule.default || loggerModule;
    console.log("✅ Logger compilado cargado exitosamente");
  } catch (error) {
    console.error("⚠️ No se pudo cargar logger compilado:", error.message);
    console.log("📝 Usando logger console como fallback");
  }
}

// Intentar cargar database connection compilado
if (moduleAliasConfigured) {
  try {
    console.log("📦 Intentando cargar database connection compilado...");
    const dbModule = require("../dist/infrastructure/database/connection");
    compiledModules.database = dbModule.DatabaseConnection;
    console.log("✅ Database connection compilado cargado exitosamente");
  } catch (error) {
    console.error("⚠️ No se pudo cargar database connection compilado:", error.message);
    console.log("📝 Database connection no disponible - usando modo offline");
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

// Función para logging (compilado o fallback)
function getLogger() {
  if (compiledModules.logger) {
    console.log("📝 Usando logger compilado");
    return compiledModules.logger;
  } else {
    console.log("📝 Usando logger console fallback");
    return {
      info: (message, meta) => console.log("ℹ️", message, meta || ''),
      error: (message, meta) => console.error("❌", message, meta || ''),
      warn: (message, meta) => console.warn("⚠️", message, meta || ''),
      debug: (message, meta) => console.log("🔍", message, meta || '')
    };
  }
}

// Función para database connection (compilado o fallback)
function getDatabaseConnection() {
  if (compiledModules.database) {
    console.log("🗄️ Usando database connection compilado");
    return compiledModules.database;
  } else {
    console.log("🗄️ Database connection no disponible - modo offline");
    return null;
  }
}

// Función para intentar conectar a la base de datos
async function tryConnectDatabase() {
  const DatabaseConnection = getDatabaseConnection();
  
  if (!DatabaseConnection) {
    return {
      connected: false,
      reason: "DatabaseConnection class not available",
      mode: "offline"
    };
  }

  try {
    console.log("🔗 Intentando conectar a MongoDB...");
    const db = DatabaseConnection.getInstance();
    await db.connect();
    console.log("✅ Conectado a MongoDB exitosamente");
    
    return {
      connected: true,
      reason: "Connected successfully",
      mode: "online"
    };
  } catch (error) {
    console.error("⚠️ Error conectando a MongoDB:", error.message);
    
    return {
      connected: false,
      reason: error.message,
      mode: "offline"
    };
  }
}

// Variable global para estado de la base de datos
let databaseStatus = {
  connected: false,
  reason: "Not initialized",
  mode: "offline"
};

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
    
    // Obtener configuración y logger (compilados o fallback)
    const config = getConfig();
    const logger = getLogger();
    
    // Intentar conectar a la base de datos (solo una vez)
    if (databaseStatus.reason === "Not initialized") {
      logger.info('Intentando conectar a la base de datos...');
      databaseStatus = await tryConnectDatabase();
      logger.info('Estado de la base de datos', databaseStatus);
    }
    
    // Usar logger compilado si está disponible
    logger.info('Express app iniciándose', { 
      phase: 'Fase 1 - Module Aliases + Database',
      compiledModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
      databaseStatus: databaseStatus
    });
    
    // Middleware básico
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // HEALTH CHECK (mejorado con database status)
    app.get('/health', (req, res) => {
      logger.info('Health check solicitado');
      
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
          compiledConfig: compiledModules.config !== null,
          compiledLogger: compiledModules.logger !== null,
          compiledDatabase: compiledModules.database !== null
        },
        database: databaseStatus
      };
      
      sendJSON(res, healthData);
      logger.info('Health check enviado exitosamente');
    });
    
    // DEBUG ENDPOINT (mejorado con database info)
    app.get('/debug', (req, res) => {
      logger.info('Debug endpoint solicitado');
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        method: "json_as_text_plain",
        phase: "Fase 1 - Module Aliases (Config + Logger + Database)",
        moduleStatus: {
          aliases: moduleAliasConfigured,
          config: compiledModules.config !== null,
          logger: compiledModules.logger !== null,
          database: compiledModules.database !== null,
          app: compiledModules.app !== null
        },
        loadedModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
        database: databaseStatus,
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
        logger: {
          source: compiledModules.logger ? "compiled" : "fallback"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, debugData);
      logger.info('Debug enviado exitosamente');
    });
    
    // API-DOCS (Swagger placeholder)
    app.get('/api-docs', (req, res) => {
      logger.info('API Documentation solicitada');
      
      const docsData = {
        success: true,
        message: "Documentación de Imaginarium API",
        note: "Swagger temporalmente deshabilitado, usando respuestas JSON como text/plain",
        version: "1.0.0",
        phase: "Fase 1 - Module Aliases integrados (Config + Logger + Database)",
        moduleAliases: moduleAliasConfigured,
        compiledModulesActive: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
        databaseStatus: databaseStatus,
        endpoints: {
          health: {
            method: "GET",
            path: "/health",
            description: "Health check del sistema con estado de base de datos"
          },
          debug: {
            method: "GET", 
            path: "/debug",
            description: "Información de debug del sistema, módulos y base de datos"
          },
          users: {
            method: "GET",
            path: "/api/users",
            description: "Lista de usuarios (requiere autenticación)",
            status: databaseStatus.connected ? "Conectado a DB real" : "Modo offline con datos mock"
          },
          conversations: {
            method: "GET",
            path: "/api/conversations", 
            description: "Lista de conversaciones (requiere autenticación)",
            status: databaseStatus.connected ? "Conectado a DB real" : "Modo offline con datos mock"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, docsData);
      logger.info('API docs enviado exitosamente');
    });
    
    // API/USERS ENDPOINT (mejorado con database awareness)
    app.get('/api/users', (req, res) => {
      logger.info('Users endpoint solicitado');
      
      const usersData = {
        success: true,
        message: databaseStatus.connected ? 
          "Endpoint de usuarios funcionando con base de datos" : 
          "Endpoint de usuarios en modo offline",
        database: databaseStatus,
        note: databaseStatus.connected ? 
          "Conectado a MongoDB - datos reales disponibles" : 
          "Base de datos desconectada - usando datos mock",
        phase: "Fase 1 - Con module aliases (Config + Logger + Database)",
        data: [], // TODO: cargar datos reales si database está conectada
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          source: databaseStatus.connected ? "database" : "mock"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, usersData);
      logger.info('Users endpoint enviado exitosamente');
    });
    
    // API/CONVERSATIONS ENDPOINT (mejorado con database awareness)
    app.get('/api/conversations', (req, res) => {
      logger.info('Conversations endpoint solicitado');
      
      const conversationsData = {
        success: true,
        message: databaseStatus.connected ? 
          "Endpoint de conversaciones funcionando con base de datos" : 
          "Endpoint de conversaciones en modo offline",
        database: databaseStatus,
        note: databaseStatus.connected ? 
          "Conectado a MongoDB - datos reales disponibles" : 
          "Base de datos desconectada - usando datos mock",
        phase: "Fase 1 - Con module aliases (Config + Logger + Database)",
        data: [], // TODO: cargar datos reales si database está conectada
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          source: databaseStatus.connected ? "database" : "mock"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, conversationsData);
      logger.info('Conversations endpoint enviado exitosamente');
    });
    
    // PÁGINA PRINCIPAL
    app.get('/', (req, res) => {
      logger.info('Página principal solicitada');
      
      const homeData = {
        success: true,
        message: "🎉 Imaginarium API - Sistema de Conversaciones con IA",
        version: "1.0.0",
        phase: "Fase 1 - Module Aliases Integrados (Config + Logger + Database)",
        status: "Funcionando correctamente con JSON como text/plain",
        environment: config.nodeEnv,
        moduleStatus: {
          aliases: moduleAliasConfigured,
          compiledModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null)
        },
        database: databaseStatus,
        endpoints: {
          health: "/health",
          docs: "/api-docs", 
          debug: "/debug",
          api: "/api/v1",
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: databaseStatus.connected ? 
          "API funcionando con base de datos conectada. ¡Listo para datos reales!" :
          "API funcionando en modo offline. Base de datos por configurar.",
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, homeData);
      logger.info('Home page enviado exitosamente');
    });
    
    // API INFO
    app.get('/api', (req, res) => {
      logger.info('API info solicitada');
      
      const apiData = {
        success: true,
        message: "Imaginarium API v1.0.0 - Fase 1 (Config + Logger + Database)",
        documentation: "/api-docs",
        endpoints: {
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: "Todas las respuestas en formato JSON válido con Content-Type text/plain",
        moduleAliases: moduleAliasConfigured,
        compiledModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
        database: databaseStatus
      };
      
      sendJSON(res, apiData);
      logger.info('API info enviado exitosamente');
    });
    
    // CATCH ALL - 404
    app.use('*', (req, res) => {
      logger.warn('Endpoint no encontrado', { path: req.url, method: req.method });
      
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
    
    console.log("✅ Express app configurada completamente - Fase 1 (Config + Logger + Database)");
    logger.info('Express app configurada completamente', { 
      phase: 'Fase 1 - Config + Logger + Database',
      databaseStatus: databaseStatus 
    });
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
      phase: "Fase 1 - Module Aliases (Config + Logger + Database)",
      timestamp: new Date().toISOString()
    };
    
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
}; 