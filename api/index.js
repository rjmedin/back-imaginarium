// Imaginarium API - Fase 2: Conexión MongoDB Directa
console.log("🚀 Imaginarium API - Fase 2: MongoDB + Datos Reales");

// PASO 1: Configurar module aliases (manteniendo compatibilidad)
let moduleAliasConfigured = false;
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
  moduleAliasConfigured = true;
  console.log("✅ Module aliases configurados exitosamente");
} catch (error) {
  console.error("❌ Error configurando module aliases:", error.message);
}

// PASO 2: Intentar cargar módulos compilados (los que funcionan)
let compiledModules = {
  config: null,
  logger: null,
  database: null,
  app: null
};

// Cargar config compilado (funciona)
if (moduleAliasConfigured) {
  try {
    console.log("📦 Cargando config compilado...");
    const configModule = require("../dist/shared/config/config");
    compiledModules.config = configModule;
    console.log("✅ Config compilado cargado exitosamente");
  } catch (error) {
    console.error("⚠️ No se pudo cargar config compilado:", error.message);
  }
}

// PASO 3: Conexión directa a MongoDB (sin módulos compilados)
const mongoose = require('mongoose');

// Estado global de conexión más robusto
let mongoConnection = {
  connected: false,
  reason: "Not initialized",
  mode: "offline",
  lastAttempt: null,
  ipWhitelistIssue: false,
  connectionAttempts: 0,
  maxAttempts: 3
};

// Función para detectar problemas específicos de MongoDB Atlas
function analyzeMongoError(error) {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('ip') && errorMessage.includes('whitelist')) {
    return {
      type: 'IP_WHITELIST',
      message: '🚨 IP de Vercel no está en MongoDB Atlas Whitelist',
      solution: 'Configurar 0.0.0.0/0 en Atlas Network Access',
      critical: true
    };
  }
  
  if (errorMessage.includes('authentication failed')) {
    return {
      type: 'AUTH_ERROR',
      message: '🔐 Error de autenticación en MongoDB',
      solution: 'Verificar credenciales en MONGODB_URI',
      critical: true
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      type: 'TIMEOUT',
      message: '⏱️ Timeout de conexión o operación',
      solution: 'Verificar conectividad de red',
      critical: false
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: error.message,
    solution: 'Revisar configuración de MongoDB',
    critical: false
  };
}

// Función mejorada para conectar a MongoDB
async function connectToMongoDB() {
  // No reintentar si ya se intentó recientemente
  if (mongoConnection.lastAttempt && 
      Date.now() - mongoConnection.lastAttempt < 30000 && // 30 segundos
      mongoConnection.connectionAttempts >= mongoConnection.maxAttempts) {
    console.log("⏸️ Evitando reconexión prematura a MongoDB");
    return mongoConnection;
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db';
    
    console.log("🔗 Conectando directamente a MongoDB...");
    
         // Configuración de conexión con timeouts cortos (compatible con mongoose moderno)
     await mongoose.connect(mongoUri, {
       serverSelectionTimeoutMS: 5000, // 5 segundos timeout
       connectTimeoutMS: 5000,         // 5 segundos para conectar
       socketTimeoutMS: 5000,          // 5 segundos para operaciones
       maxPoolSize: 5,                 // Max 5 conexiones
     });
     
     // Deshabilitar buffering después de la conexión (alternativa moderna)
     mongoose.set('bufferCommands', false);
    
    console.log("✅ Conectado a MongoDB exitosamente");
    
    // Reset de contadores en caso de éxito
    mongoConnection.connectionAttempts = 0;
    mongoConnection.lastAttempt = Date.now();
    
    return {
      connected: true,
      reason: "Connected successfully",
      mode: "online",
      lastAttempt: Date.now(),
      ipWhitelistIssue: false,
      connectionAttempts: mongoConnection.connectionAttempts
    };
  } catch (error) {
    console.error("⚠️ Error conectando a MongoDB:", error.message);
    
    const errorAnalysis = analyzeMongoError(error);
    mongoConnection.connectionAttempts++;
    mongoConnection.lastAttempt = Date.now();
    
    console.error("📊 Análisis del error:", errorAnalysis);
    
    return {
      connected: false,
      reason: error.message,
      mode: "offline",
      lastAttempt: Date.now(),
      ipWhitelistIssue: errorAnalysis.type === 'IP_WHITELIST',
      connectionAttempts: mongoConnection.connectionAttempts,
      errorAnalysis: errorAnalysis
    };
  }
}

// Función para verificar si la conexión está realmente operativa
async function testMongoConnection() {
  if (!mongoConnection.connected) {
    return false;
  }
  
  try {
    // Test simple con timeout corto
    await mongoose.connection.db.admin().ping();
    console.log("✅ MongoDB ping exitoso");
    return true;
  } catch (error) {
    console.error("❌ MongoDB ping falló:", error.message);
    
    // Actualizar estado si el ping falla
    mongoConnection.connected = false;
    mongoConnection.reason = `Ping failed: ${error.message}`;
    mongoConnection.mode = "offline";
    
    return false;
  }
}

// PASO 4: Modelos básicos de MongoDB (directos)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

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

// Función para obtener configuración
function getConfig() {
  if (compiledModules.config) {
    console.log("📋 Usando config compilado");
    return compiledModules.config.config;
  } else {
    console.log("📋 Usando config manual fallback");
    return {
      port: parseInt(process.env.PORT || '3000'),
      nodeEnv: process.env.NODE_ENV || 'development',
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db',
      jwtSecret: process.env.JWT_SECRET || 'imaginarium_secret_key_2024',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    };
  }
}

// Función para logging simple
function getLogger() {
  return {
    info: (message, meta) => console.log("ℹ️", message, meta || ''),
    error: (message, meta) => console.error("❌", message, meta || ''),
    warn: (message, meta) => console.warn("⚠️", message, meta || ''),
    debug: (message, meta) => console.log("🔍", message, meta || '')
  };
}

// Función para ejecutar operaciones de MongoDB con timeout y fallback
async function safeMongoOperation(operation, fallbackData, operationName) {
  // Verificar conexión primero
  const isConnected = await testMongoConnection();
  
  if (!isConnected) {
    console.log(`⚠️ MongoDB no operativo para ${operationName}, usando fallback`);
    return {
      success: true,
      data: fallbackData,
      source: 'fallback',
      reason: 'MongoDB not operational'
    };
  }
  
  try {
    console.log(`🔄 Ejecutando operación MongoDB: ${operationName}`);
    
    // Timeout promise para operaciones
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout (3s)')), 3000);
    });
    
    // Race entre la operación y el timeout
    const result = await Promise.race([operation(), timeoutPromise]);
    
    console.log(`✅ Operación ${operationName} exitosa`);
    return {
      success: true,
      data: result,
      source: 'mongodb',
      reason: 'Operation successful'
    };
  } catch (error) {
    console.error(`❌ Error en operación ${operationName}:`, error.message);
    
    // Analizar error y actualizar estado de conexión si es crítico
    const errorAnalysis = analyzeMongoError(error);
    if (errorAnalysis.critical) {
      mongoConnection.connected = false;
      mongoConnection.reason = error.message;
      mongoConnection.mode = "offline";
    }
    
    return {
      success: false,
      data: fallbackData,
      source: 'fallback',
      reason: error.message,
      errorAnalysis: errorAnalysis
    };
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
    
    const config = getConfig();
    const logger = getLogger();
    
    // Intentar conectar a MongoDB (solo una vez por intervalo)
    if (mongoConnection.reason === "Not initialized" || 
        (Date.now() - mongoConnection.lastAttempt > 60000)) { // 1 minuto entre reintentos
      logger.info('Intentando conectar a MongoDB directamente...');
      mongoConnection = await connectToMongoDB();
      logger.info('Estado de MongoDB', mongoConnection);
    }
    
    logger.info('Express app iniciándose', { 
      phase: 'Fase 2 - MongoDB Robusto',
      compiledModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
      mongoStatus: mongoConnection
    });
    
    // Middleware básico
    app.use(express.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
    
    // HEALTH CHECK
    app.get('/health', (req, res) => {
      logger.info('Health check solicitado');
      
      const healthData = {
        success: true,
        message: "API funcionando correctamente con MongoDB robusto.",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: config.nodeEnv,
        features: {
          swagger: process.env.ENABLE_SWAGGER === 'true',
          n8n: true,
          webhooks: true,
          moduleAliases: moduleAliasConfigured,
          compiledConfig: compiledModules.config !== null,
          directMongoDB: true,
          mongoRobustHandling: true
        },
        database: mongoConnection
      };
      
      sendJSON(res, healthData);
      logger.info('Health check enviado exitosamente');
    });
    
    // DEBUG ENDPOINT
    app.get('/debug', (req, res) => {
      logger.info('Debug endpoint solicitado');
      
      const debugData = {
        success: true,
        message: "Debug endpoint funcionando",
        method: "json_as_text_plain",
        phase: "Fase 2 - MongoDB Robusto + Manejo de Errores",
        moduleStatus: {
          aliases: moduleAliasConfigured,
          config: compiledModules.config !== null,
          logger: false, // usando simple logger
          database: false, // usando mongoose directo
          app: false
        },
        directConnections: {
          mongoose: mongoConnection.connected,
          models: mongoConnection.connected ? ["User", "Conversation"] : [],
          timeouts: "3s operations, 5s connection",
          reconnectStrategy: "Smart with backoff"
        },
        loadedModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
        database: mongoConnection,
        mongoAtlasHelp: mongoConnection.ipWhitelistIssue ? {
          problem: "🚨 IP Whitelist Issue detectado",
          solution: "1. Ir a MongoDB Atlas → Network Access\n2. Add IP Address → 0.0.0.0/0 (Allow from anywhere)\n3. Guardar y esperar 1-2 minutos",
          documentation: "https://www.mongodb.com/docs/atlas/security-whitelist/"
        } : null,
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
          nodeEnv: config.nodeEnv,
          swaggerEnabled: process.env.ENABLE_SWAGGER === 'true',
          source: compiledModules.config ? "compiled" : "fallback"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, debugData);
      logger.info('Debug enviado exitosamente');
    });
    
    // API/USERS ENDPOINT - CON MANEJO ROBUSTO
    app.get('/api/users', async (req, res) => {
      logger.info('Users endpoint solicitado');
      
      // Datos mock como fallback
      const mockUsers = [
        {
          _id: "mock1",
          email: "usuario1@example.com",
          name: "Usuario Demo 1",
          createdAt: new Date().toISOString()
        },
        {
          _id: "mock2", 
          email: "usuario2@example.com",
          name: "Usuario Demo 2",
          createdAt: new Date().toISOString()
        }
      ];
      
      // Intentar operación MongoDB con fallback inteligente
      const result = await safeMongoOperation(
        async () => {
          const users = await User.find({}).select('-password').limit(10);
          const total = await User.countDocuments();
          return { users, total };
        },
        { users: mockUsers, total: mockUsers.length },
        'users.find'
      );
      
      const usersData = {
        success: true,
        message: result.source === 'mongodb' ? 
          "Usuarios cargados desde MongoDB" : 
          "Usuarios mock (MongoDB no operativo)",
        database: mongoConnection,
        phase: "Fase 2 - MongoDB Robusto",
        data: result.data.users,
        meta: {
          total: result.data.total,
          page: 1,
          limit: 10,
          source: result.source,
          reason: result.reason
        },
        troubleshooting: result.errorAnalysis || null,
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, usersData);
      logger.info('Users enviados exitosamente', { source: result.source, count: result.data.users.length });
    });
    
    // API/CONVERSATIONS ENDPOINT - CON MANEJO ROBUSTO
    app.get('/api/conversations', async (req, res) => {
      logger.info('Conversations endpoint solicitado');
      
      // Datos mock como fallback
      const mockConversations = [
        {
          _id: "conv1",
          title: "Conversación Demo 1",
          userId: { name: "Usuario Demo", email: "demo@example.com" },
          messages: [
            { role: "user", content: "Hola", timestamp: new Date().toISOString() },
            { role: "assistant", content: "¡Hola! ¿En qué puedo ayudarte?", timestamp: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      
      // Intentar operación MongoDB con fallback inteligente
      const result = await safeMongoOperation(
        async () => {
          const conversations = await Conversation.find({})
            .populate('userId', 'name email')
            .limit(10);
          const total = await Conversation.countDocuments();
          return { conversations, total };
        },
        { conversations: mockConversations, total: mockConversations.length },
        'conversations.find'
      );
      
      const conversationsData = {
        success: true,
        message: result.source === 'mongodb' ? 
          "Conversaciones cargadas desde MongoDB" : 
          "Conversaciones mock (MongoDB no operativo)",
        database: mongoConnection,
        phase: "Fase 2 - MongoDB Robusto",
        data: result.data.conversations,
        meta: {
          total: result.data.total,
          page: 1,
          limit: 10,
          source: result.source,
          reason: result.reason
        },
        troubleshooting: result.errorAnalysis || null,
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, conversationsData);
      logger.info('Conversations enviadas exitosamente', { source: result.source, count: result.data.conversations.length });
    });
    
    // PÁGINA PRINCIPAL
    app.get('/', (req, res) => {
      logger.info('Página principal solicitada');
      
      const homeData = {
        success: true,
        message: "🎉 Imaginarium API - Sistema de Conversaciones con IA",
        version: "1.0.0",
        phase: "Fase 2 - MongoDB Robusto + Manejo de Errores",
        status: mongoConnection.connected ? 
          "Funcionando con datos reales de MongoDB" : 
          "Funcionando en modo offline con datos mock",
        environment: config.nodeEnv,
        database: mongoConnection,
        endpoints: {
          health: "/health",
          debug: "/debug",
          users: "/api/users - " + (mongoConnection.connected ? "DATOS REALES" : "datos mock"),
          conversations: "/api/conversations - " + (mongoConnection.connected ? "DATOS REALES" : "datos mock")
        },
        mongoAtlasHelp: mongoConnection.ipWhitelistIssue ? {
          problem: "🚨 Detectado problema de IP Whitelist en MongoDB Atlas",
          quickFix: "Configurar 0.0.0.0/0 en Atlas Network Access",
          documentation: "https://www.mongodb.com/docs/atlas/security-whitelist/"
        } : null,
        note: mongoConnection.connected ? 
          "🚀 ¡API completamente funcional con base de datos real!" :
          "⚠️ API funcionando en modo offline. " + (mongoConnection.ipWhitelistIssue ? "Configurar IP whitelist en Atlas." : "Verificar configuración de MongoDB."),
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, homeData);
      logger.info('Home page enviado exitosamente');
    });
    
    // API INFO
    app.get('/api', (req, res) => {
      const apiData = {
        success: true,
        message: "Imaginarium API v1.0.0 - Fase 2 (MongoDB Robusto)",
        endpoints: {
          users: "/api/users",
          conversations: "/api/conversations"
        },
        database: mongoConnection,
        dataSource: mongoConnection.connected ? "MongoDB Real" : "Mock Data",
        fallbackStrategy: "Automatic fallback to mock data on MongoDB issues",
        note: "Responses como JSON con Content-Type text/plain"
      };
      
      sendJSON(res, apiData);
    });
    
    // CATCH ALL - 404
    app.use('*', (req, res) => {
      const notFoundData = {
        success: false,
        message: "Endpoint no encontrado",
        path: req.url,
        method: req.method,
        availableEndpoints: ["/", "/health", "/debug", "/api/users", "/api/conversations"],
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, notFoundData, 404);
    });
    
    console.log("✅ Express app configurada completamente - Fase 2 (MongoDB Robusto)");
    logger.info('Express app configurada completamente', { 
      phase: 'Fase 2 - MongoDB Robusto',
      mongoStatus: mongoConnection 
    });
    console.log("🚀 Delegando request a Express...");
    
    return app(req, res);
    
  } catch (error) {
    console.error("💥 Error crítico:", error);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const errorResponse = {
      success: false,
      message: "Error crítico del servidor",
      error: error.message,
      phase: "Fase 2 - MongoDB Robusto",
      timestamp: new Date().toISOString()
    };
    
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
}; 