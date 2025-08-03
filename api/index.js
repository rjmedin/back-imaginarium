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

let mongoConnection = {
  connected: false,
  reason: "Not initialized",
  mode: "offline"
};

// Función para conectar directamente a MongoDB
async function connectToMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db';
    
    console.log("🔗 Conectando directamente a MongoDB...");
    await mongoose.connect(mongoUri, {
      // Opciones modernas de conexión
      // useNewUrlParser y useUnifiedTopology ya no son necesarias en mongoose 6+
    });
    
    console.log("✅ Conectado a MongoDB exitosamente");
    
    return {
      connected: true,
      reason: "Connected successfully",
      mode: "online"
    };
  } catch (error) {
    console.error("⚠️ Error conectando a MongoDB:", error.message);
    
    return {
      connected: false,
      reason: error.message,
      mode: "offline"
    };
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
    
    // Intentar conectar a MongoDB (solo una vez)
    if (mongoConnection.reason === "Not initialized") {
      logger.info('Intentando conectar a MongoDB directamente...');
      mongoConnection = await connectToMongoDB();
      logger.info('Estado de MongoDB', mongoConnection);
    }
    
    logger.info('Express app iniciándose', { 
      phase: 'Fase 2 - MongoDB Directo',
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
        message: "API funcionando correctamente con MongoDB directo.",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: config.nodeEnv,
        features: {
          swagger: process.env.ENABLE_SWAGGER === 'true',
          n8n: true,
          webhooks: true,
          moduleAliases: moduleAliasConfigured,
          compiledConfig: compiledModules.config !== null,
          directMongoDB: true
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
        phase: "Fase 2 - MongoDB Directo + Datos Reales",
        moduleStatus: {
          aliases: moduleAliasConfigured,
          config: compiledModules.config !== null,
          logger: false, // usando simple logger
          database: false, // usando mongoose directo
          app: false
        },
        directConnections: {
          mongoose: mongoConnection.connected,
          models: mongoConnection.connected ? ["User", "Conversation"] : []
        },
        loadedModules: Object.keys(compiledModules).filter(key => compiledModules[key] !== null),
        database: mongoConnection,
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
    
    // API/USERS ENDPOINT - CON DATOS REALES
    app.get('/api/users', async (req, res) => {
      logger.info('Users endpoint solicitado');
      
      try {
        if (mongoConnection.connected) {
          // Cargar usuarios reales de MongoDB
          const users = await User.find({}).select('-password').limit(10);
          const total = await User.countDocuments();
          
          const usersData = {
            success: true,
            message: "Usuarios cargados desde MongoDB",
            database: mongoConnection,
            phase: "Fase 2 - Datos reales de MongoDB",
            data: users,
            meta: {
              total: total,
              page: 1,
              limit: 10,
              source: "mongodb"
            },
            timestamp: new Date().toISOString()
          };
          
          sendJSON(res, usersData);
          logger.info('Users reales enviados exitosamente', { count: users.length });
        } else {
          // Datos mock si no hay conexión
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
          
          const usersData = {
            success: true,
            message: "Usuarios mock (MongoDB no conectado)",
            database: mongoConnection,
            phase: "Fase 2 - Modo offline con datos mock",
            data: mockUsers,
            meta: {
              total: 2,
              page: 1,
              limit: 10,
              source: "mock"
            },
            timestamp: new Date().toISOString()
          };
          
          sendJSON(res, usersData);
          logger.info('Users mock enviados');
        }
      } catch (error) {
        logger.error('Error en users endpoint', error);
        
        const errorData = {
          success: false,
          message: "Error al cargar usuarios",
          error: error.message,
          database: mongoConnection,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // API/CONVERSATIONS ENDPOINT - CON DATOS REALES
    app.get('/api/conversations', async (req, res) => {
      logger.info('Conversations endpoint solicitado');
      
      try {
        if (mongoConnection.connected) {
          // Cargar conversaciones reales de MongoDB
          const conversations = await Conversation.find({})
            .populate('userId', 'name email')
            .limit(10);
          const total = await Conversation.countDocuments();
          
          const conversationsData = {
            success: true,
            message: "Conversaciones cargadas desde MongoDB",
            database: mongoConnection,
            phase: "Fase 2 - Datos reales de MongoDB",
            data: conversations,
            meta: {
              total: total,
              page: 1,
              limit: 10,
              source: "mongodb"
            },
            timestamp: new Date().toISOString()
          };
          
          sendJSON(res, conversationsData);
          logger.info('Conversations reales enviadas exitosamente', { count: conversations.length });
        } else {
          // Datos mock si no hay conexión
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
          
          const conversationsData = {
            success: true,
            message: "Conversaciones mock (MongoDB no conectado)",
            database: mongoConnection,
            phase: "Fase 2 - Modo offline con datos mock",
            data: mockConversations,
            meta: {
              total: 1,
              page: 1,
              limit: 10,
              source: "mock"
            },
            timestamp: new Date().toISOString()
          };
          
          sendJSON(res, conversationsData);
          logger.info('Conversations mock enviadas');
        }
      } catch (error) {
        logger.error('Error en conversations endpoint', error);
        
        const errorData = {
          success: false,
          message: "Error al cargar conversaciones",
          error: error.message,
          database: mongoConnection,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // PÁGINA PRINCIPAL
    app.get('/', (req, res) => {
      logger.info('Página principal solicitada');
      
      const homeData = {
        success: true,
        message: "🎉 Imaginarium API - Sistema de Conversaciones con IA",
        version: "1.0.0",
        phase: "Fase 2 - MongoDB Directo + Datos Reales",
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
        note: mongoConnection.connected ? 
          "🚀 ¡API completamente funcional con base de datos real!" :
          "⚠️ API funcionando en modo offline. Configura MONGODB_URI para datos reales.",
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, homeData);
      logger.info('Home page enviado exitosamente');
    });
    
    // API INFO
    app.get('/api', (req, res) => {
      const apiData = {
        success: true,
        message: "Imaginarium API v1.0.0 - Fase 2 (MongoDB Directo)",
        endpoints: {
          users: "/api/users",
          conversations: "/api/conversations"
        },
        database: mongoConnection,
        dataSource: mongoConnection.connected ? "MongoDB Real" : "Mock Data",
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
    
    console.log("✅ Express app configurada completamente - Fase 2 (MongoDB Directo)");
    logger.info('Express app configurada completamente', { 
      phase: 'Fase 2 - MongoDB Directo',
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
      phase: "Fase 2 - MongoDB Directo",
      timestamp: new Date().toISOString()
    };
    
    res.status(500).send(JSON.stringify(errorResponse, null, 2));
  }
}; 