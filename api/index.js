// Test: Express con respuestas de texto plano
console.log("🚀 Iniciando Express con texto plano");

module.exports = async (req, res) => {
  console.log("📥 Request recibido:", req.method, req.url);
  
  try {
    // Headers para texto plano
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS request");
      res.status(200).end();
      return;
    }
    
    console.log("🏗️ Importando Express...");
    const express = require("express");
    console.log("✅ Express importado");
    
    console.log("🔧 Creando app Express...");
    const app = express();
    console.log("✅ App Express creada");
    
    // Middleware básico
    console.log("🔧 Configurando middleware...");
    app.use(express.text());
    console.log("✅ Middleware configurado");
    
    // Rutas con texto plano
    app.get('/debug', (req, res) => {
      console.log("🔍 Procesando /debug con Express");
      res.status(200).send(`DEBUG con Express:
- Status: OK
- Express funciona: SI
- Timestamp: ${new Date().toISOString()}
- Method: ${req.method}
- URL: ${req.url}`);
    });
    
    app.get('/health', (req, res) => {
      console.log("💚 Procesando /health con Express");
      res.status(200).send(`HEALTH con Express: OK - ${new Date().toISOString()}`);
    });
    
    app.get('/', (req, res) => {
      console.log("🏠 Procesando raíz con Express");
      res.status(200).send(`EXPRESS FUNCIONA - ${new Date().toISOString()}\nEndpoints: /debug, /health`);
    });
    
    app.use('*', (req, res) => {
      console.log("❓ Ruta no encontrada con Express");
      res.status(404).send(`NOT FOUND: ${req.method} ${req.url}`);
    });
    
    console.log("✅ Rutas Express configuradas");
    console.log("🚀 Delegando request a Express...");
    
    // Delegar a Express
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error:", error);
    res.status(500).send('ERROR: ' + error.message);
  }
}; 