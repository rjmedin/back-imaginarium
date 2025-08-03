// Versión completamente básica - SIN module aliases ni módulos externos
console.log("🔥 INICIANDO VERSION BASICA - SIN MODULE ALIASES");

// Variables básicas del entorno
const envInfo = {
  NODE_ENV: process.env.NODE_ENV || 'undefined',
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER || 'undefined',
  MONGODB_URI: process.env.MONGODB_URI ? 'Configurado' : 'No configurado',
  JWT_SECRET: process.env.JWT_SECRET ? 'Configurado' : 'No configurado',
  dirname: __dirname,
  cwd: process.cwd(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  timestamp: new Date().toISOString()
};

console.log("📊 Info del entorno:", JSON.stringify(envInfo, null, 2));

// Función ultra-básica que solo usa Express nativo
function createUltraBasicApp() {
  console.log("🏗️ Creando app ultra-básica...");
  
  try {
    const express = require("express");
    console.log("✅ Express importado exitosamente");
    
    const app = express();
    console.log("✅ App Express creada");
    
    // Middleware ultra-básico
    app.use((req, res, next) => {
      console.log(`📨 Request: ${req.method} ${req.url}`);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
    
    // Ruta debug ultra-básica
    app.get('/debug', (req, res) => {
      console.log("🔍 Procesando ruta /debug");
      
      try {
        const response = {
          success: true,
          message: "Debug endpoint - versión ultra-básica",
          info: "Esta versión NO usa module aliases ni módulos compilados",
          environment: envInfo,
          test: "Si ves esto, la configuración básica de Vercel funciona"
        };
        
        console.log("📤 Enviando respuesta debug");
        res.status(200).json(response);
        console.log("✅ Respuesta debug enviada");
        
      } catch (error) {
        console.error("❌ Error en ruta debug:", error);
        res.status(500).send('{"success":false,"message":"Error procesando debug"}');
      }
    });
    
    // Ruta health ultra-básica
    app.get('/health', (req, res) => {
      console.log("💚 Procesando ruta /health");
      
      try {
        res.status(200).json({
          success: true,
          message: "Health check - versión ultra-básica",
          status: "OK",
          version: "1.0.0-ultra-basic",
          timestamp: new Date().toISOString()
        });
        console.log("✅ Respuesta health enviada");
        
      } catch (error) {
        console.error("❌ Error en health:", error);
        res.status(200).send('{"success":true,"message":"Health OK"}');
      }
    });
    
    // Ruta raíz
    app.get('/', (req, res) => {
      console.log("🏠 Procesando ruta raíz");
      
      try {
        res.status(200).json({
          success: true,
          message: "Imaginarium API - Versión Ultra-Básica",
          note: "Esta versión usa solo Express básico para diagnosticar problemas",
          version: "1.0.0-ultra-basic",
          endpoints: ["/health", "/debug"],
          timestamp: new Date().toISOString()
        });
        console.log("✅ Respuesta raíz enviada");
        
      } catch (error) {
        console.error("❌ Error en raíz:", error);
        res.status(200).send('{"success":true,"message":"API básica funcionando"}');
      }
    });
    
    // Catch-all ultra-básico
    app.use('*', (req, res) => {
      console.log(`❓ Ruta no encontrada: ${req.method} ${req.url}`);
      
      try {
        res.status(404).json({
          success: false,
          message: "Endpoint no encontrado",
          path: req.url,
          method: req.method,
          availableEndpoints: ["/", "/health", "/debug"]
        });
      } catch (error) {
        res.status(404).send('{"success":false,"message":"Not found"}');
      }
    });
    
    console.log("✅ App ultra-básica configurada completamente");
    return app;
    
  } catch (error) {
    console.error("💥 ERROR CRÍTICO creando app ultra-básica:", error);
    return null;
  }
}

// Handler ultra-básico para Vercel
module.exports = async (req, res) => {
  console.log(`🚀 HANDLER INICIADO: ${req.method} ${req.url}`);
  console.log(`📡 User-Agent: ${req.headers['user-agent']}`);
  console.log(`🌐 Host: ${req.headers.host}`);
  
  try {
    // Headers básicos inmediatos
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log("✅ Headers configurados");
    
    // Manejar OPTIONS inmediatamente
    if (req.method === 'OPTIONS') {
      console.log("⚡ Respondiendo OPTIONS inmediatamente");
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Creando app...");
    const app = createUltraBasicApp();
    
    if (!app) {
      console.error("💥 No se pudo crear app, enviando respuesta de emergencia");
      
      // Respuesta de emergencia absoluta
      const emergencyResponse = JSON.stringify({
        success: false,
        message: "Error crítico: No se pudo crear la aplicación básica",
        timestamp: new Date().toISOString()
      });
      
      res.status(500).send(emergencyResponse);
      return;
    }
    
    console.log("✅ App creada, delegando request...");
    return app(req, res);
    
  } catch (error) {
    console.error("💥💥 ERROR CRÍTICO EN HANDLER:", error);
    console.error("Stack:", error.stack);
    
    try {
      // Último recurso
      const errorResponse = JSON.stringify({
        success: false,
        message: "Error crítico en handler",
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).send(errorResponse);
      
    } catch (finalError) {
      console.error("💥💥💥 ERROR FINAL:", finalError);
      res.status(500).send('{"success":false,"message":"Error crítico"}');
    }
  }
}; 