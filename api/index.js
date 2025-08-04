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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// FUNCIONES DE AUTENTICACIÓN
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function generateJWT(user) {
  const config = getConfig();
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  return jwt.sign(payload, config.jwtSecret || 'imaginarium_secret_key_2024');
}

function verifyJWT(token) {
  try {
    const config = getConfig();
    return jwt.verify(token, config.jwtSecret || 'imaginarium_secret_key_2024');
  } catch (error) {
    return null;
  }
}

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJSON(res, {
      success: false,
      message: "Token de autorización requerido",
      error: "Missing or invalid Authorization header"
    }, 401);
  }
  
  const token = authHeader.substring(7); // Remover "Bearer "
  const decoded = verifyJWT(token);
  
  if (!decoded) {
    return sendJSON(res, {
      success: false,
      message: "Token inválido o expirado",
      error: "Invalid JWT token"
    }, 401);
  }
  
  req.user = decoded;
  next();
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
        phase: "Fase 2 - MongoDB Robusto + Autenticación JWT",
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
    
    // API/USERS ENDPOINT - PROTEGIDO (SOLO PERFIL PROPIO)
    app.get('/api/users', authMiddleware, async (req, res) => {
      logger.info('Users endpoint solicitado (protegido)', { userId: req.user.userId });
      
      try {
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de usuarios temporalmente no disponible",
            database: mongoConnection
          }, 503);
        }
        
        // Obtener solo el perfil del usuario logueado
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
          return sendJSON(res, {
            success: false,
            message: "Usuario no encontrado"
          }, 404);
        }
        
        const usersData = {
          success: true,
          message: "Perfil de usuario obtenido exitosamente",
          database: mongoConnection,
          phase: "Fase 3 - Endpoints Protegidos",
          data: [user], // Array para mantener compatibilidad
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            source: "mongodb",
            reason: "User profile retrieved",
            protected: true,
            userId: req.user.userId
          },
          note: "Endpoint protegido - solo muestra el perfil del usuario autenticado",
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, usersData);
        logger.info('User profile enviado exitosamente', { userId: user._id });
        
      } catch (error) {
        logger.error('Error en users endpoint protegido', error);
        
        const errorData = {
          success: false,
          message: "Error al obtener perfil de usuario",
          error: error.message,
          database: mongoConnection,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // API/USERS/ALL ENDPOINT - ADMIN ONLY (FUTURO)
    app.get('/api/users/all', authMiddleware, async (req, res) => {
      logger.info('Users/all endpoint solicitado (admin)', { userId: req.user.userId });
      
      // Por ahora, solo devolver información de que necesita ser admin
      sendJSON(res, {
        success: false,
        message: "Funcionalidad de administrador no implementada",
        note: "Este endpoint estará disponible para usuarios admin en el futuro",
        requiredRole: "admin",
        currentUser: req.user.email,
        timestamp: new Date().toISOString()
      }, 403);
    });
    
    // API/CONVERSATIONS ENDPOINT - PROTEGIDO (SOLO DEL USUARIO)
    app.get('/api/conversations', authMiddleware, async (req, res) => {
      logger.info('Conversations endpoint solicitado (protegido)', { userId: req.user.userId });
      
      try {
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de conversaciones temporalmente no disponible",
            database: mongoConnection
          }, 503);
        }
        
        // Obtener solo las conversaciones del usuario logueado
        const conversations = await Conversation.find({ userId: req.user.userId })
          .populate('userId', 'name email')
          .sort({ updatedAt: -1 }) // Más recientes primero
          .limit(10);
          
        const total = await Conversation.countDocuments({ userId: req.user.userId });
        
        const conversationsData = {
          success: true,
          message: "Conversaciones del usuario cargadas desde MongoDB",
          database: mongoConnection,
          phase: "Fase 3 - Endpoints Protegidos",
          data: conversations,
          meta: {
            total: total,
            page: 1,
            limit: 10,
            source: "mongodb",
            reason: "User conversations retrieved",
            protected: true,
            userId: req.user.userId,
            userEmail: req.user.email
          },
          note: "Endpoint protegido - solo muestra conversaciones del usuario autenticado",
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, conversationsData);
        logger.info('User conversations enviadas exitosamente', { 
          userId: req.user.userId, 
          count: conversations.length, 
          total: total 
        });
        
      } catch (error) {
        logger.error('Error en conversations endpoint protegido', error);
        
        const errorData = {
          success: false,
          message: "Error al obtener conversaciones del usuario",
          error: error.message,
          database: mongoConnection,
          userId: req.user.userId,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // POST /api/conversations - CREAR NUEVA CONVERSACIÓN
    app.post('/api/conversations', authMiddleware, async (req, res) => {
      logger.info('Create conversation endpoint solicitado', { userId: req.user.userId });
      
      try {
        const { title } = req.body;
        
        // Validaciones básicas
        if (!title || title.trim().length === 0) {
          return sendJSON(res, {
            success: false,
            message: "El título de la conversación es requerido",
            received: { title: !!title }
          }, 400);
        }
        
        if (title.trim().length > 100) {
          return sendJSON(res, {
            success: false,
            message: "El título no puede exceder 100 caracteres",
            received: { titleLength: title.length, maxLength: 100 }
          }, 400);
        }
        
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de conversaciones temporalmente no disponible",
            database: mongoConnection
          }, 503);
        }
        
        // Crear nueva conversación
        const newConversation = new Conversation({
          userId: req.user.userId,
          title: title.trim(),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedConversation = await newConversation.save();
        
        // Poblar userId para la respuesta
        await savedConversation.populate('userId', 'name email');
        
        const conversationData = {
          success: true,
          message: "Conversación creada exitosamente",
          data: savedConversation,
          meta: {
            userId: req.user.userId,
            userEmail: req.user.email,
            messagesCount: 0,
            protected: true
          },
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, conversationData, 201);
        logger.info('Conversación creada exitosamente', { 
          conversationId: savedConversation._id,
          userId: req.user.userId,
          title: title.trim()
        });
        
      } catch (error) {
        logger.error('Error creando conversación', error);
        
        const errorData = {
          success: false,
          message: "Error interno del servidor creando conversación",
          error: error.message,
          userId: req.user.userId,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // POST /api/conversations/:id/messages - AGREGAR MENSAJE
    app.post('/api/conversations/:id/messages', authMiddleware, async (req, res) => {
      logger.info('Add message endpoint solicitado', { 
        userId: req.user.userId, 
        conversationId: req.params.id 
      });
      
      try {
        const { role, content } = req.body;
        const conversationId = req.params.id;
        
        // Validaciones básicas
        if (!role || !content) {
          return sendJSON(res, {
            success: false,
            message: "Role y content son requeridos",
            received: { role: !!role, content: !!content },
            validRoles: ["user", "assistant"]
          }, 400);
        }
        
        if (!["user", "assistant"].includes(role)) {
          return sendJSON(res, {
            success: false,
            message: "Role debe ser 'user' o 'assistant'",
            received: role,
            validRoles: ["user", "assistant"]
          }, 400);
        }
        
        if (content.trim().length === 0) {
          return sendJSON(res, {
            success: false,
            message: "El contenido del mensaje no puede estar vacío"
          }, 400);
        }
        
        if (content.trim().length > 2000) {
          return sendJSON(res, {
            success: false,
            message: "El contenido del mensaje no puede exceder 2000 caracteres",
            received: { contentLength: content.length, maxLength: 2000 }
          }, 400);
        }
        
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de mensajes temporalmente no disponible",
            database: mongoConnection
          }, 503);
        }
        
        // Verificar que la conversación existe y pertenece al usuario
        const conversation = await Conversation.findOne({ 
          _id: conversationId, 
          userId: req.user.userId 
        });
        
        if (!conversation) {
          return sendJSON(res, {
            success: false,
            message: "Conversación no encontrada o no pertenece al usuario",
            conversationId: conversationId,
            userId: req.user.userId
          }, 404);
        }
        
        // Crear nuevo mensaje
        const newMessage = {
          role: role,
          content: content.trim(),
          timestamp: new Date()
        };
        
        // Agregar mensaje a la conversación
        conversation.messages.push(newMessage);
        conversation.updatedAt = new Date();
        
        const savedConversation = await conversation.save();
        
        // Obtener el mensaje recién creado
        const addedMessage = savedConversation.messages[savedConversation.messages.length - 1];
        
        const messageData = {
          success: true,
          message: "Mensaje agregado exitosamente",
          data: {
            message: addedMessage,
            conversation: {
              id: savedConversation._id,
              title: savedConversation.title,
              messagesCount: savedConversation.messages.length,
              updatedAt: savedConversation.updatedAt
            }
          },
          meta: {
            userId: req.user.userId,
            userEmail: req.user.email,
            conversationId: conversationId,
            messageId: addedMessage._id,
            protected: true
          },
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, messageData, 201);
        logger.info('Mensaje agregado exitosamente', { 
          conversationId: conversationId,
          messageId: addedMessage._id,
          userId: req.user.userId,
          role: role,
          contentLength: content.trim().length
        });
        
      } catch (error) {
        logger.error('Error agregando mensaje', error);
        
        const errorData = {
          success: false,
          message: "Error interno del servidor agregando mensaje",
          error: error.message,
          userId: req.user.userId,
          conversationId: req.params.id,
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
        phase: "Fase 3 - Endpoints Protegidos con Autenticación JWT",
        status: mongoConnection.connected ? 
          "Funcionando con datos reales de MongoDB + Endpoints protegidos" : 
          "Funcionando en modo offline con datos mock + Endpoints protegidos",
        environment: config.nodeEnv,
        database: mongoConnection,
        endpoints: {
          health: "/health - System status",
          debug: "/debug - Debug information",
          auth: "/api/auth/* - Authentication (register, login, profile)",
          users: "/api/users - Own profile (protected) - " + (mongoConnection.connected ? "DATOS REALES" : "datos mock"),
          conversations: "/api/conversations - Own conversations (protected) - " + (mongoConnection.connected ? "DATOS REALES" : "datos mock"),
          createConversation: "POST /api/conversations - Create new conversation (protected)",
          addMessage: "POST /api/conversations/:id/messages - Add message (protected)"
        },
        mongoAtlasHelp: mongoConnection.ipWhitelistIssue ? {
          problem: "🚨 Detectado problema de IP Whitelist en MongoDB Atlas",
          quickFix: "Configurar 0.0.0.0/0 en Atlas Network Access",
          documentation: "https://www.mongodb.com/docs/atlas/security-whitelist/"
        } : null,
        note: mongoConnection.connected ? 
          "🚀 ¡API completamente funcional con base de datos real y endpoints protegidos!" :
          "⚠️ API funcionando en modo offline con endpoints protegidos. " + (mongoConnection.ipWhitelistIssue ? "Configurar IP whitelist en Atlas." : "Verificar configuración de MongoDB."),
        security: {
          message: "🔐 Endpoints protegidos requieren autenticación JWT",
          howToAuth: "1) POST /api/auth/login para obtener token, 2) Usar Authorization: Bearer {token}",
          tokenExpiry: "24 horas"
        },
        timestamp: new Date().toISOString()
      };
      
      sendJSON(res, homeData);
      logger.info('Home page enviado exitosamente');
    });
    
    // API INFO
    app.get('/api', (req, res) => {
      const apiData = {
        success: true,
        message: "Imaginarium API v1.0.0 - Fase 3 (Endpoints Protegidos)",
        endpoints: {
          users: "GET /api/users (protected - own profile)",
          usersAll: "GET /api/users/all (admin only - future)",
          conversations: "GET /api/conversations (protected - own conversations)",
          createConversation: "POST /api/conversations (protected)",
          addMessage: "POST /api/conversations/:id/messages (protected)",
          auth: {
            register: "POST /api/auth/register",
            login: "POST /api/auth/login",
            profile: "GET /api/auth/profile (protected)"
          }
        },
        database: mongoConnection,
        dataSource: mongoConnection.connected ? "MongoDB Real" : "Mock Data",
        fallbackStrategy: "Automatic fallback to mock data on MongoDB issues",
        note: "Responses como JSON con Content-Type text/plain"
      };
      
      sendJSON(res, apiData);
    });
    
    // ENDPOINTS DE AUTENTICACIÓN
    
    // POST /api/auth/register - Registro de usuario
    app.post('/api/auth/register', async (req, res) => {
      logger.info('Register endpoint solicitado');
      
      try {
        const { name, email, password } = req.body;
        
        // Validaciones básicas
        if (!name || !email || !password) {
          return sendJSON(res, {
            success: false,
            message: "Faltan campos requeridos",
            required: ["name", "email", "password"],
            received: { name: !!name, email: !!email, password: !!password }
          }, 400);
        }
        
        if (password.length < 6) {
          return sendJSON(res, {
            success: false,
            message: "La contraseña debe tener al menos 6 caracteres"
          }, 400);
        }
        
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de registro temporalmente no disponible",
            database: mongoConnection,
            note: "MongoDB no está conectado"
          }, 503);
        }
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return sendJSON(res, {
            success: false,
            message: "El email ya está registrado",
            email: email.toLowerCase()
          }, 409);
        }
        
        // Crear nuevo usuario
        const hashedPassword = await hashPassword(password);
        const newUser = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedUser = await newUser.save();
        
        // Generar JWT token
        const token = generateJWT(savedUser);
        
        const registerData = {
          success: true,
          message: "Usuario registrado exitosamente",
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt
          },
          token: token,
          expiresIn: "24h",
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, registerData, 201);
        logger.info('Usuario registrado exitosamente', { email: savedUser.email });
        
      } catch (error) {
        logger.error('Error en register endpoint', error);
        
        const errorData = {
          success: false,
          message: "Error interno del servidor durante el registro",
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // POST /api/auth/login - Login de usuario
    app.post('/api/auth/login', async (req, res) => {
      logger.info('Login endpoint solicitado');
      
      try {
        const { email, password } = req.body;
        
        // Validaciones básicas
        if (!email || !password) {
          return sendJSON(res, {
            success: false,
            message: "Email y contraseña son requeridos",
            received: { email: !!email, password: !!password }
          }, 400);
        }
        
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de autenticación temporalmente no disponible",
            database: mongoConnection,
            note: "MongoDB no está conectado"
          }, 503);
        }
        
        // Buscar usuario por email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return sendJSON(res, {
            success: false,
            message: "Credenciales inválidas",
            note: "Usuario no encontrado"
          }, 401);
        }
        
        // Verificar contraseña
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
          return sendJSON(res, {
            success: false,
            message: "Credenciales inválidas",
            note: "Contraseña incorrecta"
          }, 401);
        }
        
        // Generar JWT token
        const token = generateJWT(user);
        
        const loginData = {
          success: true,
          message: "Login exitoso",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          },
          token: token,
          expiresIn: "24h",
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, loginData);
        logger.info('Login exitoso', { email: user.email });
        
      } catch (error) {
        logger.error('Error en login endpoint', error);
        
        const errorData = {
          success: false,
          message: "Error interno del servidor durante el login",
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // GET /api/auth/profile - Perfil de usuario (protegido)
    app.get('/api/auth/profile', authMiddleware, async (req, res) => {
      logger.info('Profile endpoint solicitado', { userId: req.user.userId });
      
      try {
        // Verificar si MongoDB está disponible
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          return sendJSON(res, {
            success: false,
            message: "Servicio de perfil temporalmente no disponible",
            database: mongoConnection
          }, 503);
        }
        
        // Obtener datos actualizados del usuario
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
          return sendJSON(res, {
            success: false,
            message: "Usuario no encontrado"
          }, 404);
        }
        
        const profileData = {
          success: true,
          message: "Perfil de usuario obtenido exitosamente",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token: {
            issuedAt: new Date(req.user.iat * 1000),
            expiresAt: new Date(req.user.exp * 1000)
          },
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, profileData);
        logger.info('Profile enviado exitosamente', { userId: user._id });
        
      } catch (error) {
        logger.error('Error en profile endpoint', error);
        
        const errorData = {
          success: false,
          message: "Error interno del servidor obteniendo perfil",
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        sendJSON(res, errorData, 500);
      }
    });
    
    // CATCH ALL - 404
    app.use('*', (req, res) => {
      const notFoundData = {
        success: false,
        message: "Endpoint no encontrado",
        path: req.url,
        method: req.method,
        availableEndpoints: [
          "/",
          "/health", 
          "/debug",
          "/api",
          "GET /api/users (protected)",
          "GET /api/users/all (admin only)",
          "GET /api/conversations (protected)",
          "POST /api/conversations (protected)",
          "POST /api/conversations/:id/messages (protected)",
          "POST /api/auth/register",
          "POST /api/auth/login", 
          "GET /api/auth/profile (protected)"
        ],
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