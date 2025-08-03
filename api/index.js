// Función serverless mínima absoluta - NO usa Express ni JSON complejos
console.log("🚀 Iniciando función mínima");

module.exports = async (req, res) => {
  console.log("📥 Request recibido:", req.method, req.url);
  
  try {
    // Headers básicos
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      console.log("✅ OPTIONS request");
      res.status(200).end();
      return;
    }
    
    console.log("📤 Enviando respuesta simple");
    
    // Respuesta ultra-simple como texto plano
    if (req.url === '/debug') {
      res.status(200).send(`
DEBUG INFO:
- Status: OK
- Method: ${req.method}
- URL: ${req.url}
- Node Version: ${process.version}
- Platform: ${process.platform}
- Timestamp: ${new Date().toISOString()}
- Environment: ${process.env.NODE_ENV || 'undefined'}
`);
    } else if (req.url === '/health') {
      res.status(200).send('HEALTH: OK - ' + new Date().toISOString());
    } else {
      res.status(200).send(`
IMAGINARIUM API - MINIMAL VERSION
Available endpoints: /health, /debug
Current: ${req.method} ${req.url}
Time: ${new Date().toISOString()}
`);
    }
    
    console.log("✅ Respuesta enviada exitosamente");
    
  } catch (error) {
    console.error("💥 Error:", error);
    res.status(500).send('ERROR: ' + error.message);
  }
}; 