// Solución definitiva: JSON manual como string - EVITA res.json()
console.log("🚀 Iniciando solución JSON manual");

// Función helper para crear JSON manualmente
function createJSONResponse(data) {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return '{"error":"JSON stringify failed","message":"' + error.message + '"}';
  }
}

module.exports = async (req, res) => {
  console.log("📥 Request:", req.method, req.url);
  
  try {
    // Headers seguros
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS");
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Creando Express...");
    const express = require("express");
    const app = express();
    
    // Middleware CORS
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // RUTA DEBUG - JSON manual
    app.get('/debug', (req, res) => {
      console.log("🔍 Debug - JSON manual");
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        method: "manual_json_string",
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          ENABLE_SWAGGER: process.env.ENABLE_SWAGGER || 'undefined',
          MONGODB_URI: process.env.MONGODB_URI ? "Configurado" : "No configurado",
          JWT_SECRET: process.env.JWT_SECRET ? "Configurado" : "No configurado"
        },
        paths: {
          __dirname: __dirname,
          cwd: process.cwd()
        },
        timestamp: new Date().toISOString()
      };
      
      const jsonString = createJSONResponse(debugData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ Debug JSON enviado manualmente");
    });
    
    // RUTA HEALTH - JSON simple
    app.get('/health', (req, res) => {
      console.log("💚 Health - JSON manual");
      
      const healthData = {
        success: true,
        message: "API funcionando - JSON manual",
        status: "OK",
        timestamp: new Date().toISOString(),
        version: "1.0.0-manual-json"
      };
      
      const jsonString = createJSONResponse(healthData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ Health JSON enviado manualmente");
    });
    
    // RUTA API-DOCS - JSON simple
    app.get('/api-docs', (req, res) => {
      console.log("📚 API-docs - JSON manual");
      
      const docsData = {
        success: true,
        message: "Swagger temporalmente deshabilitado",
        note: "Usando JSON manual para evitar problemas de res.json()",
        availableEndpoints: ["/health", "/debug", "/api/users"]
      };
      
      const jsonString = createJSONResponse(docsData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ API-docs JSON enviado manualmente");
    });
    
    // RUTA API/USERS - JSON simple
    app.get('/api/users', (req, res) => {
      console.log("👥 Users - JSON manual");
      
      const usersData = {
        success: true,
        message: "Endpoint users funcionando",
        note: "Base de datos temporalmente deshabilitada para testing",
        data: [],
        timestamp: new Date().toISOString()
      };
      
      const jsonString = createJSONResponse(usersData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ Users JSON enviado manualmente");
    });
    
    // RUTA RAÍZ - JSON simple
    app.get('/', (req, res) => {
      console.log("🏠 Raíz - JSON manual");
      
      const homeData = {
        success: true,
        message: "Imaginarium API - Funcionando con JSON manual",
        version: "1.0.0-manual-json",
        note: "Esta versión evita res.json() y usa JSON.stringify() manual",
        endpoints: {
          health: "/health",
          debug: "/debug",
          docs: "/api-docs",
          users: "/api/users"
        },
        timestamp: new Date().toISOString()
      };
      
      const jsonString = createJSONResponse(homeData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ Home JSON enviado manualmente");
    });
    
    // CATCH ALL
    app.use('*', (req, res) => {
      console.log("❓ No encontrado:", req.url);
      
      const notFoundData = {
        success: false,
        message: "Endpoint no encontrado",
        path: req.url,
        method: req.method,
        availableEndpoints: ["/", "/health", "/debug", "/api-docs", "/api/users"]
      };
      
      const jsonString = createJSONResponse(notFoundData);
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(404).send(jsonString);
    });
    
    console.log("✅ Express configurado, delegando...");
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error crítico:", error);
    
    // Respuesta de emergencia como texto plano
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send('ERROR CRITICO: ' + error.message);
  }
}; 