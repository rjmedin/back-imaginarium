// Función serverless con Express básico - Paso incremental
console.log("🚀 Iniciando función con Express básico");

module.exports = async (req, res) => {
  console.log("📥 Request recibido:", req.method, req.url);
  
  try {
    // Headers básicos
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS request");
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Creando Express app básica...");
    
    // Importar Express SIN module aliases
    const express = require("express");
    const app = express();
    
    console.log("✅ Express importado");
    
    // Solo middleware esencial
    app.use(express.json({ limit: '1mb' }));
    
    console.log("✅ Middleware configurado");
    
    // Rutas ultra-simples con JSON mínimo
    app.get('/debug', (req, res) => {
      console.log("🔍 Procesando /debug");
      
      const simpleResponse = {
        success: true,
        message: "Express funciona",
        timestamp: new Date().toISOString()
      };
      
      console.log("📤 Enviando JSON simple");
      res.status(200).json(simpleResponse);
    });
    
    app.get('/health', (req, res) => {
      console.log("💚 Procesando /health");
      res.status(200).json({ 
        status: "OK", 
        time: new Date().toISOString() 
      });
    });
    
    app.get('/', (req, res) => {
      console.log("🏠 Procesando raíz");
      res.status(200).json({ 
        message: "Express básico funciona",
        version: "express-test"
      });
    });
    
    // Catch all simple
    app.use('*', (req, res) => {
      res.status(404).json({ 
        error: "Not found",
        path: req.url 
      });
    });
    
    console.log("✅ Rutas configuradas, delegando request...");
    
    // Delegar el request a Express
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error:", error);
    
    // Respuesta de emergencia como texto plano
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send('ERROR: ' + error.message);
  }
}; 