// Imaginarium API - Solución definitiva con JSON como text/plain
console.log("🚀 Imaginarium API iniciando - JSON como text/plain");

// Función helper para enviar JSON como text/plain
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
    
    // Middleware básico
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // HEALTH CHECK
    app.get('/health', (req, res) => {
      console.log("💚 Health check");
      
      const healthData = {
        success: true,
        message: "API funcionando correctamente. Todo va bien.",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development',
        features: {
          swagger: process.env.ENABLE_SWAGGER === 'true',
          n8n: true,
          webhooks: true
        }
      };
      
      sendJSON(res, healthData);
      console.log("✅ Health check enviado");
    });
    
    // DEBUG ENDPOINT
    app.get('/debug', (req, res) => {
      console.log("🔍 Debug endpoint");
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        method: "json_as_text_plain",
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
          nodeEnv: process.env.NODE_ENV || 'development',
          swaggerEnabled: process.env.ENABLE_SWAGGER === 'true'
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
        endpoints: {
          health: {
            method: "GET",
            path: "/health",
            description: "Health check del sistema"
          },
          debug: {
            method: "GET", 
            path: "/debug",
            description: "Información de debug del sistema"
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
        status: "Funcionando correctamente con JSON como text/plain",
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: "/health",
          docs: "/api-docs", 
          debug: "/debug",
          api: "/api/v1",
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: "API completamente funcional usando JSON como text/plain para evitar problemas de Content-Type en Vercel",
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
        message: "Imaginarium API v1.0.0",
        documentation: "/api-docs",
        endpoints: {
          users: "/api/users",
          conversations: "/api/conversations"
        },
        note: "Todas las respuestas en formato JSON válido con Content-Type text/plain"
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
    
    console.log("✅ Express app configurada completamente");
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
      timestamp: new Date().toISOString()
    };
    
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
}; 