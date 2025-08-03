// Configurar module alias ANTES de cualquier require
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

// Intentar cargar módulos originales con manejo de errores
let createApp, DatabaseConnection, validateConfig, logger;
let modulesStatus = {
  config: false,
  logger: false,
  database: false,
  app: false
};

try {
  console.log("📦 Intentando cargar config...");
  const configModule = require("../dist/shared/config/config");
  validateConfig = configModule.validateConfig;
  modulesStatus.config = true;
  console.log("✅ Config cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando config:", error.message);
}

try {
  console.log("📦 Intentando cargar logger...");
  logger = require("../dist/shared/utils/logger");
  modulesStatus.logger = true;
  console.log("✅ Logger cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando logger:", error.message);
}

try {
  console.log("📦 Intentando cargar database connection...");
  const dbModule = require("../dist/infrastructure/database/connection");
  DatabaseConnection = dbModule.DatabaseConnection;
  modulesStatus.database = true;
  console.log("✅ Database connection cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando database connection:", error.message);
}

try {
  console.log("📦 Intentando cargar app principal...");
  const appModule = require("../dist/app");
  createApp = appModule.createApp;
  modulesStatus.app = true;
  console.log("✅ App principal cargado exitosamente");
} catch (error) {
  console.error("❌ Error cargando app principal:", error.message);
  console.error("Stack completo:", error.stack);
}

// Función que crea la app según lo que esté disponible
function createHybridApp() {
  const express = require("express");
  const app = express();
  
  console.log("🏗️ Creando app híbrida...");
  console.log("📊 Estado de módulos:", modulesStatus);
  
  // Middlewares básicos
  app.use(express.json());
  
  // CORS básico
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
  // Rutas de debug y sistema
  app.get('/debug', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Debug endpoint - versión híbrida',
      modulesStatus: modulesStatus,
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
    });
  });

  // Si la app completa se cargó correctamente, intentar usarla
  if (modulesStatus.app && createApp) {
    try {
      console.log("🚀 Intentando crear app completa...");
      const fullApp = createApp();
      console.log("✅ App completa creada exitosamente!");
      
      // Copiar las rutas de la app completa a nuestra app básica
      fullApp._router.stack.forEach(layer => {
        app._router.stack.push(layer);
      });
      
      console.log("✅ App híbrida con funcionalidad completa");
      return app;
    } catch (error) {
      console.error("❌ Error creando app completa, usando versión básica:", error.message);
    }
  }
  
  // Rutas básicas de fallback
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API funcionando - versión híbrida (fallback)',
      timestamp: new Date().toISOString(),
      version: '1.0.0-hybrid',
      modulesLoaded: modulesStatus
    });
  });
  
  app.get('/api-docs', (req, res) => {
    if (modulesStatus.app) {
      res.status(200).json({
        success: false,
        message: 'Swagger disponible pero app completa falló al inicializarse',
        modulesStatus: modulesStatus
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Swagger no disponible - módulos de app no cargados',
        modulesStatus: modulesStatus
      });
    }
  });
  
  app.get('/api/users', (req, res) => {
    res.status(200).json({
      success: false,
      message: 'Endpoint users no disponible en modo híbrido',
      note: 'Módulos de base de datos no inicializados correctamente',
      modulesStatus: modulesStatus
    });
  });
  
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Imaginarium API - Modo Híbrido',
      version: '1.0.0-hybrid',
      modulesLoaded: modulesStatus,
      endpoints: {
        health: '/health',
        debug: '/debug',
        docs: '/api-docs'
      }
    });
  });
  
  // Catch all
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
      path: req.originalUrl,
      method: req.method,
      mode: 'hybrid'
    });
  });
  
  console.log("✅ App híbrida creada");
  return app;
}

// Handler para Vercel (Serverless Function)
module.exports = async (req, res) => {
  console.log(`🔥 Request recibido: ${req.method} ${req.url}`);
  
  try {
    // Configurar headers para CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Manejar preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.log("✅ Respondiendo a preflight OPTIONS");
      res.status(200).end();
      return;
    }

    console.log("🚀 Creando aplicación híbrida...");
    const app = createHybridApp();
    
    if (!app) {
      console.error("❌ No se pudo crear la aplicación híbrida");
      return res.status(500).json({
        success: false,
        message: "Error: No se pudo crear la aplicación híbrida",
        timestamp: new Date().toISOString()
      });
    }
    
    console.log("🚀 App híbrida creada, procesando request...");
    return app(req, res);
  } catch (error) {
    console.error("💥 Error en handler de Vercel:", error);
    console.error("💥 Stack completo:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}; 