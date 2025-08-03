const { createApp } = require("../dist/app");
const { DatabaseConnection } = require("../dist/infrastructure/database/connection");
const { validateConfig } = require("../dist/shared/config/config");
const logger = require("../dist/shared/utils/logger");

// Configurar module alias para Vercel
const moduleAlias = require("module-alias");
moduleAlias.addAliases({
  "@domain": __dirname + "/../dist/domain",
  "@application": __dirname + "/../dist/application", 
  "@infrastructure": __dirname + "/../dist/infrastructure",
  "@presentation": __dirname + "/../dist/presentation",
  "@shared": __dirname + "/../dist/shared"
});

let cachedApp = null;
let isConnected = false;

const initializeApp = async () => {
  if (cachedApp && isConnected) {
    return cachedApp;
  }

  try {
    // Validar configuración
    validateConfig();
    
    // Conectar a la base de datos solo una vez
    if (!isConnected) {
      const db = DatabaseConnection.getInstance();
      await db.connect();
      isConnected = true;
    }
    
    // Crear aplicación
    if (!cachedApp) {
      cachedApp = createApp();
      console.log("✅ Aplicación inicializada para Vercel.");
      console.log("📊 ENABLE_SWAGGER:", process.env.ENABLE_SWAGGER);
      console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    }
    
    return cachedApp;
  } catch (error) {
    console.error("❌ Error inicializando aplicación:", error);
    throw error;
  }
};

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
      res.status(200).end();
      return;
    }

    const app = await initializeApp();
    console.log("🚀 App inicializada, procesando request...");
    return app(req, res);
  } catch (error) {
    console.error("💥 Error en handler de Vercel:", error);
    
    // Si es un error de módulo no encontrado, probablemente el build falló
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error("📦 Error de módulo no encontrado:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error de compilación del servidor",
        error: "Los archivos TypeScript no han sido compilados correctamente",
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : "Error de servidor",
      timestamp: new Date().toISOString()
    });
  }
};
