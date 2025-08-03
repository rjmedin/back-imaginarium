// Configurar module alias ANTES de cualquier require
let moduleAliasStatus = false;
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
  moduleAliasStatus = true;
  console.log("✅ Module aliases configurados");
} catch (error) {
  console.error("❌ Error configurando module aliases:", error);
}

console.log("📁 __dirname:", __dirname);
console.log("📁 process.cwd():", process.cwd());
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("📊 ENABLE_SWAGGER:", process.env.ENABLE_SWAGGER);
console.log("🔗 MONGODB_URI:", process.env.MONGODB_URI ? "✅ Configurado" : "❌ Faltante");
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Configurado" : "❌ Faltante");

// Estado global de módulos con información detallada
const globalStatus = {
  moduleAlias: moduleAliasStatus,
  modules: {
    config: { loaded: false, error: null },
    logger: { loaded: false, error: null },
    database: { loaded: false, error: null },
    app: { loaded: false, error: null }
  },
  environment: {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER,
    MONGODB_URI: process.env.MONGODB_URI ? "Configurado" : "Faltante",
    JWT_SECRET: process.env.JWT_SECRET ? "Configurado" : "Faltante"
  },
  paths: {
    __dirname: __dirname,
    cwd: process.cwd()
  },
  timestamp: new Date().toISOString()
};

// Variables para los módulos
let createApp, DatabaseConnection, validateConfig, logger;

// Cargar config con manejo ultra-robusto
console.log("📦 [1/4] Intentando cargar config...");
try {
  const configModule = require("../dist/shared/config/config");
  validateConfig = configModule.validateConfig;
  globalStatus.modules.config.loaded = true;
  console.log("✅ Config cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando config:", error.message);
  globalStatus.modules.config.error = error.message;
}

// Cargar logger con manejo ultra-robusto
console.log("📦 [2/4] Intentando cargar logger...");
try {
  logger = require("../dist/shared/utils/logger");
  globalStatus.modules.logger.loaded = true;
  console.log("✅ Logger cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando logger:", error.message);
  globalStatus.modules.logger.error = error.message;
}

// Cargar database con manejo ultra-robusto
console.log("📦 [3/4] Intentando cargar database connection...");
try {
  const dbModule = require("../dist/infrastructure/database/connection");
  DatabaseConnection = dbModule.DatabaseConnection;
  globalStatus.modules.database.loaded = true;
  console.log("✅ Database connection cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando database connection:", error.message);
  globalStatus.modules.database.error = error.message;
}

// Cargar app principal con manejo ultra-robusto
console.log("📦 [4/4] Intentando cargar app principal...");
try {
  const appModule = require("../dist/app");
  createApp = appModule.createApp;
  globalStatus.modules.app.loaded = true;
  console.log("✅ App principal cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando app principal:", error.message);
  globalStatus.modules.app.error = error.message;
}

console.log("📊 Estado final de carga de módulos:", globalStatus.modules);

// Función ultra-simple para crear app de emergencia
function createEmergencyApp() {
  try {
    const express = require("express");
    const app = express();
    
    // Solo middlewares esenciales
    app.use((req, res, next) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
    
    // Rutas ultra-simples
    app.get('/debug', (req, res) => {
      try {
        const response = {
          success: true,
          message: 'Debug endpoint - modo emergencia',
          status: globalStatus,
          note: 'Esta es una respuesta de emergencia para evitar crashes'
        };
        res.status(200).json(response);
      } catch (error) {
        res.status(200).send('{"success":false,"message":"Error en debug","error":"' + error.message + '"}');
      }
    });
    
    app.get('/health', (req, res) => {
      try {
        res.status(200).json({
          success: true,
          message: 'API funcionando - modo emergencia',
          version: '1.0.0-emergency'
        });
      } catch (error) {
        res.status(200).send('{"success":false,"message":"Error en health"}');
      }
    });
    
    app.get('/', (req, res) => {
      try {
        res.status(200).json({
          success: true,
          message: 'Modo Emergencia - Algunos módulos fallaron al cargar',
          version: '1.0.0-emergency'
        });
      } catch (error) {
        res.status(200).send('{"success":false,"message":"Error en root"}');
      }
    });
    
    app.use('*', (req, res) => {
      try {
        res.status(404).json({
          success: false,
          message: 'Endpoint no encontrado - modo emergencia',
          path: req.url
        });
      } catch (error) {
        res.status(404).send('{"success":false,"message":"Not found"}');
      }
    });
    
    return app;
  } catch (error) {
    console.error("💥 Error crítico creando app de emergencia:", error);
    return null;
  }
}

// Handler para Vercel - Ultra robusto
module.exports = async (req, res) => {
  console.log(`🔥 Request recibido: ${req.method} ${req.url}`);
  
  try {
    // Headers de seguridad ultra-básicos
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ Respondiendo a preflight OPTIONS");
      res.status(200).end();
      return;
    }

    console.log("🚀 Creando aplicación de emergencia...");
    const app = createEmergencyApp();
    
    if (!app) {
      console.error("💥 CRÍTICO: No se pudo crear ni la app de emergencia");
      res.status(500).send('{"success":false,"message":"Error crítico del servidor"}');
      return;
    }
    
    console.log("✅ App de emergencia creada, procesando request...");
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error crítico en handler:", error);
    
    // Respuesta de último recurso
    try {
      res.status(500).json({
        success: false,
        message: "Error crítico del servidor",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (finalError) {
      // Si ni siquiera podemos enviar JSON, enviar texto plano
      console.error("💥💥 Error enviando respuesta de error:", finalError);
      res.status(500).send('{"success":false,"message":"Error crítico del servidor"}');
    }
  }
}; 