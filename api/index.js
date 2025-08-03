// Test final: JSON como texto plano para aislar Content-Type
console.log("🚀 Test final: JSON con Content-Type text/plain");

module.exports = async (req, res) => {
  console.log("📥 Request:", req.method, req.url);
  
  try {
    // Headers básicos
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
    
    // Test 1: JSON con Content-Type text/plain
    app.get('/debug', (req, res) => {
      console.log("🧪 Test: JSON como text/plain");
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        test: "JSON enviado como text/plain",
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          ENABLE_SWAGGER: process.env.ENABLE_SWAGGER || 'undefined'
        },
        timestamp: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(debugData, null, 2);
      
      // CLAVE: Enviar JSON pero como text/plain
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(jsonString);
      console.log("✅ JSON enviado como text/plain");
    });
    
    // Test 2: JSON muy simple como text/plain
    app.get('/health', (req, res) => {
      console.log("🧪 Test: JSON simple como text/plain");
      
      const simpleJson = '{"status":"OK","test":"simple"}';
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(simpleJson);
      console.log("✅ JSON simple enviado como text/plain");
    });
    
    // Test 3: Texto normal (control)
    app.get('/text', (req, res) => {
      console.log("🧪 Control: Texto normal");
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send('TEXTO NORMAL - FUNCIONA - ' + new Date().toISOString());
      console.log("✅ Texto normal enviado");
    });
    
    // Test 4: JSON hardcoded como text/plain
    app.get('/hardcoded', (req, res) => {
      console.log("🧪 Test: JSON hardcoded como text/plain");
      
      // JSON directo sin stringify
      const hardcodedJson = '{"hardcoded":true,"status":"OK","timestamp":"' + new Date().toISOString() + '"}';
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(hardcodedJson);
      console.log("✅ JSON hardcoded enviado como text/plain");
    });
    
    // Página principal
    app.get('/', (req, res) => {
      console.log("🏠 Página principal");
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(200).send(`TESTS DISPONIBLES:
      
/debug - JSON complejo como text/plain
/health - JSON simple como text/plain  
/text - Texto normal (control)
/hardcoded - JSON hardcoded como text/plain

OBJETIVO: Ver si el Content-Type application/json es el problema.

Si estos funcionan, el problema es específico de Content-Type application/json.
Si fallan, el problema es más profundo.`);
    });
    
    console.log("✅ Express configurado");
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error:", error);
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send('ERROR: ' + error.message);
  }
}; 