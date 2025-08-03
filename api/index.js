// Test: JSON responses graduales con Express
console.log("🚀 Iniciando Express con JSON gradual");

module.exports = async (req, res) => {
  console.log("📥 Request recibido:", req.method, req.url);
  
  try {
    // Manejar OPTIONS primero
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS request");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Importando Express...");
    const express = require("express");
    const app = express();
    console.log("✅ Express importado y app creada");
    
    // Middleware mínimo
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
    
    // Test 1: JSON ultra-simple
    app.get('/test1', (req, res) => {
      console.log("🧪 Test 1: JSON ultra-simple");
      res.json({ test: 1 });
    });
    
    // Test 2: JSON con string
    app.get('/test2', (req, res) => {
      console.log("🧪 Test 2: JSON con string");
      res.json({ message: "hello" });
    });
    
    // Test 3: JSON con timestamp
    app.get('/test3', (req, res) => {
      console.log("🧪 Test 3: JSON con timestamp");
      res.json({ 
        success: true,
        time: new Date().toISOString()
      });
    });
    
    // Test 4: JSON más complejo (como el que falló antes)
    app.get('/test4', (req, res) => {
      console.log("🧪 Test 4: JSON complejo");
      res.json({
        success: true,
        message: 'Debug endpoint funcionando',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          ENABLE_SWAGGER: process.env.ENABLE_SWAGGER
        },
        timestamp: new Date().toISOString()
      });
    });
    
    // Test 5: Enviar JSON manualmente
    app.get('/test5', (req, res) => {
      console.log("🧪 Test 5: JSON manual");
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send('{"manual": true, "test": 5}');
    });
    
    // Debug principal con diferentes métodos
    app.get('/debug', (req, res) => {
      console.log("🔍 Debug principal");
      
      // Método directo sin res.json()
      res.setHeader('Content-Type', 'application/json');
      const response = JSON.stringify({
        success: true,
        method: "manual_stringify",
        express_works: true,
        timestamp: new Date().toISOString()
      });
      
      console.log("📤 Enviando JSON con stringify manual");
      res.status(200).send(response);
    });
    
    // Health check (sabemos que texto funciona)
    app.get('/health', (req, res) => {
      console.log("💚 Health check (texto)");
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send('EXPRESS + JSON TEST - OK');
    });
    
    // Página principal con links
    app.get('/', (req, res) => {
      console.log("🏠 Página principal");
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(`EXPRESS JSON TESTS
Endpoints para probar:
- /test1 (JSON ultra-simple)
- /test2 (JSON con string)  
- /test3 (JSON con timestamp)
- /test4 (JSON complejo)
- /test5 (JSON manual)
- /debug (JSON con stringify)
- /health (texto de control)

Prueba cada uno para ver cuál falla.`);
    });
    
    console.log("✅ Todas las rutas configuradas");
    console.log("🚀 Delegando a Express...");
    
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error:", error);
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send('ERROR: ' + error.message);
  }
}; 