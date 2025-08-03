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

let createApp, DatabaseConnection, validateConfig, logger;

try {
  console.log("📦 Importando módulos...");
  const appModule = require("../dist/app");
  createApp = appModule.createApp;
  console.log("✅ app.js importado");

  const dbModule = require("../dist/infrastructure/database/connection");
  DatabaseConnection = dbModule.DatabaseConnection;
  console.log("✅ database connection importado");

  const configModule = require("../dist/shared/config/config");
  validateConfig = configModule.validateConfig;
  console.log("✅ config importado");

  logger = require("../dist/shared/utils/logger");
  console.log("✅ logger importado");
} catch (error) {
  console.error("❌ Error importando módulos:", error);
  console.error("Stack:", error.stack);
}

let cachedApp = null;
let isConnected = false;

const initializeApp = async () => {
  console.log("🚀 Inicializando aplicación...");
  
  if (cachedApp && isConnected) {
    console.log("♻️ Usando aplicación cacheada");
    return cachedApp;
  }

  try {
    // Validar configuración
    console.log("🔍 Validando configuración...");
    if (validateConfig) {
      validateConfig();
      console.log("✅ Configuración válida");
    }
    
    // Conectar a la base de datos solo una vez
    if (!isConnected && DatabaseConnection) {
      console.log("🔗 Conectando a la base de datos...");
      const db = DatabaseConnection.getInstance();
      await db.connect();
      isConnected = true;
      console.log("✅ Base de datos conectada");
    }
    
    // Crear aplicación
    if (!cachedApp && createApp) {
      console.log("🏗️ Creando aplicación Express...");
      cachedApp = createApp();
      console.log("✅ Aplicación inicializada para Vercel.");
      console.log("📊 ENABLE_SWAGGER:", process.env.ENABLE_SWAGGER);
      console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    }
    
    return cachedApp;
  } catch (error) {
    console.error("❌ Error inicializando aplicación:", error);
    console.error("Stack completo:", error.stack);
    throw error;
  }
};

// Handler para Vercel (Serverless Function)
module.exports = async (req, res) => {
  console.log(`🔥 Request recibido: ${req.method} ${req.url}`);
  console.log("🔄 Headers:", req.headers);
  
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

    console.log("🔄 Inicializando aplicación...");
    const app = await initializeApp();
    
    if (!app) {
      console.error("❌ No se pudo crear la aplicación");
      return res.status(500).json({
        success: false,
        message: "Error: No se pudo inicializar la aplicación",
        timestamp: new Date().toISOString()
      });
    }
    
    console.log("🚀 App inicializada, procesando request...");
    return app(req, res);
  } catch (error) {
    console.error("💥 Error en handler de Vercel:", error);
    console.error("💥 Stack completo:", error.stack);
    
    // Si es un error de módulo no encontrado, probablemente el build falló
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error("📦 Error de módulo no encontrado:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error de compilación del servidor",
        error: "Los archivos TypeScript no han sido compilados correctamente",
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : "Error de servidor",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}; 