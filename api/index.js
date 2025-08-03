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

// Función simplificada para probar (la que funcionó antes)
function createSimpleApp() {
  const express = require("express");
  const app = express();
  
  console.log("🏗️ Creando app Express básica...");
  
  // Middlewares básicos
  app.use(express.json());
  
  // CORS básico
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
  
  // Rutas de prueba
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API funcionando - versión simplificada',
      timestamp: new Date().toISOString(),
      version: '1.0.0-debug'
    });
  });
  
  app.get('/debug', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Debug endpoint funcionando',
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
  
  app.get('/api-docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Swagger temporalmente deshabilitado para debugging',
      note: 'Usar /debug para información del sistema'
    });
  });
  
  app.get('/api/users', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Endpoint users en modo debug',
      note: 'Base de datos temporalmente deshabilitada para debugging'
    });
  });
  
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Imaginarium API - Modo Debug',
      version: '1.0.0-debug',
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
      method: req.method
    });
  });
  
  console.log("✅ App Express básica creada");
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

    console.log("🚀 Creando aplicación simplificada...");
    const app = createSimpleApp();
    
    if (!app) {
      console.error("❌ No se pudo crear la aplicación");
      return res.status(500).json({
        success: false,
        message: "Error: No se pudo crear la aplicación simplificada",
        timestamp: new Date().toISOString()
      });
    }
    
    console.log("🚀 App creada, procesando request...");
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