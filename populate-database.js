// 🌱 Script para poblar MongoDB con datos de ejemplo
// Imaginarium API - Population Script

console.log("🌱 Iniciando población de base de datos...");

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Configuración de conexión (igual que la API)
async function connectToMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db';
    
    console.log("🔗 Conectando a MongoDB...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    });
    
    mongoose.set('bufferCommands', false);
    console.log("✅ Conectado a MongoDB exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    return false;
  }
}

// Schemas (mismos que la API)
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

// Datos de ejemplo
const sampleUsers = [
  {
    email: "ana.martinez@imaginarium.com",
    name: "Ana Martínez",
    password: "password123"
  },
  {
    email: "carlos.rodriguez@imaginarium.com", 
    name: "Carlos Rodríguez",
    password: "password123"
  },
  {
    email: "maria.lopez@imaginarium.com",
    name: "María López", 
    password: "password123"
  },
  {
    email: "juan.perez@imaginarium.com",
    name: "Juan Pérez",
    password: "password123"
  },
  {
    email: "sofia.garcia@imaginarium.com",
    name: "Sofía García",
    password: "password123"
  }
];

// Conversaciones de ejemplo variadas
const sampleConversations = [
  {
    title: "Consulta sobre IA generativa",
    messages: [
      { role: "user", content: "¿Cómo funciona la inteligencia artificial generativa?" },
      { role: "assistant", content: "La IA generativa utiliza modelos de aprendizaje profundo para crear contenido nuevo basado en patrones aprendidos de datos de entrenamiento. Puede generar texto, imágenes, código y más." },
      { role: "user", content: "¿Qué aplicaciones tiene en el desarrollo de software?" },
      { role: "assistant", content: "En desarrollo de software, la IA generativa puede ayudar con: 1) Generación de código, 2) Documentación automática, 3) Testing automatizado, 4) Optimización de algoritmos, y 5) Asistencia en debugging." }
    ]
  },
  {
    title: "Planificación de proyecto",
    messages: [
      { role: "user", content: "Necesito ayuda para planificar un proyecto de API REST" },
      { role: "assistant", content: "Te ayudo con la planificación. Primero definamos: 1) Objetivos del proyecto, 2) Recursos disponibles, 3) Timeline esperado, 4) Tecnologías a usar. ¿Podrías contarme más sobre el proyecto?" },
      { role: "user", content: "Es una API para gestionar conversaciones con IA, usando Node.js y MongoDB" },
      { role: "assistant", content: "Perfecto. Para una API de conversaciones con IA sugiero esta estructura: 1) Autenticación de usuarios, 2) CRUD de conversaciones, 3) Sistema de mensajes, 4) Integración con modelo de IA, 5) Rate limiting y 6) Logging. ¿Empezamos por algún módulo específico?" }
    ]
  },
  {
    title: "Optimización de base de datos",
    messages: [
      { role: "user", content: "Mi API MongoDB está lenta, ¿cómo puedo optimizarla?" },
      { role: "assistant", content: "Para optimizar MongoDB te sugiero: 1) Crear índices en campos de búsqueda frecuente, 2) Usar agregaciones en lugar de múltiples queries, 3) Implementar paginación, 4) Considerar connection pooling, y 5) Monitorear con MongoDB Compass. ¿Qué operaciones específicas son lentas?" }
    ]
  },
  {
    title: "Despliegue en Vercel",
    messages: [
      { role: "user", content: "¿Cuáles son las mejores prácticas para desplegar una API en Vercel?" },
      { role: "assistant", content: "Para desplegar en Vercel exitosamente: 1) Configurar vercel.json correctamente, 2) Usar variables de entorno para secrets, 3) Implementar serverless functions, 4) Configurar CORS apropiadamente, 5) Manejar timeouts de función, y 6) Usar Edge Runtime cuando sea posible." }
    ]
  },
  {
    title: "Autenticación JWT",
    messages: [
      { role: "user", content: "¿Cómo implemento autenticación segura con JWT?" },
      { role: "assistant", content: "Para JWT seguro: 1) Usar secretos robustos, 2) Configurar expiración apropiada, 3) Implementar refresh tokens, 4) Validar tokens en middleware, 5) Usar HTTPS siempre, y 6) Considerar rate limiting. ¿Necesitas ayuda con algún aspecto específico?" },
      { role: "user", content: "¿Qué información debería incluir en el payload del token?" },
      { role: "assistant", content: "En el payload JWT incluye: 1) userId (identificador único), 2) email o username, 3) roles/permisos si usas RBAC, 4) iat (issued at), 5) exp (expiration). Evita datos sensibles como passwords o información personal detallada." }
    ]
  }
];

// Función para hashear passwords
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Función para limpiar base de datos
async function clearDatabase() {
  try {
    console.log("🧹 Limpiando base de datos existente...");
    await User.deleteMany({});
    await Conversation.deleteMany({});
    console.log("✅ Base de datos limpiada");
  } catch (error) {
    console.error("⚠️ Error limpiando base de datos:", error.message);
  }
}

// Función para crear usuarios
async function createUsers() {
  try {
    console.log("👥 Creando usuarios de ejemplo...");
    
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedUser = await user.save();
      users.push(savedUser);
      console.log(`✅ Usuario creado: ${userData.name} (${userData.email})`);
    }
    
    console.log(`🎉 ${users.length} usuarios creados exitosamente`);
    return users;
  } catch (error) {
    console.error("❌ Error creando usuarios:", error.message);
    return [];
  }
}

// Función para crear conversaciones
async function createConversations(users) {
  try {
    console.log("💬 Creando conversaciones de ejemplo...");
    
    const conversations = [];
    
    // Asignar conversaciones a usuarios aleatoriamente
    for (let i = 0; i < sampleConversations.length; i++) {
      const conversationData = sampleConversations[i];
      const randomUser = users[i % users.length]; // Distribuir entre usuarios
      
      // Crear mensajes con timestamps progresivos
      const messages = conversationData.messages.map((msg, index) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(Date.now() - (conversationData.messages.length - index) * 60000) // 1 minuto entre mensajes
      }));
      
      const conversation = new Conversation({
        userId: randomUser._id,
        title: conversationData.title,
        messages: messages,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        updatedAt: new Date()
      });
      
      const savedConversation = await conversation.save();
      conversations.push(savedConversation);
      console.log(`✅ Conversación creada: "${conversationData.title}" (${messages.length} mensajes)`);
    }
    
    // Crear algunas conversaciones adicionales vacías para variedad
    const emptyConversations = [
      { title: "Nueva consulta", userId: users[0]._id },
      { title: "Proyecto en desarrollo", userId: users[1]._id }
    ];
    
    for (const emptyConv of emptyConversations) {
      const conversation = new Conversation({
        userId: emptyConv.userId,
        title: emptyConv.title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedConversation = await conversation.save();
      conversations.push(savedConversation);
      console.log(`✅ Conversación vacía creada: "${emptyConv.title}"`);
    }
    
    console.log(`🎉 ${conversations.length} conversaciones creadas exitosamente`);
    return conversations;
  } catch (error) {
    console.error("❌ Error creando conversaciones:", error.message);
    return [];
  }
}

// Función para mostrar estadísticas
async function showStats() {
  try {
    console.log("\n📊 ESTADÍSTICAS DE BASE DE DATOS:");
    
    const userCount = await User.countDocuments();
    const conversationCount = await Conversation.countDocuments();
    const totalMessages = await Conversation.aggregate([
      { $unwind: "$messages" },
      { $count: "total" }
    ]);
    
    console.log(`👥 Usuarios: ${userCount}`);
    console.log(`💬 Conversaciones: ${conversationCount}`);
    console.log(`📝 Mensajes totales: ${totalMessages[0]?.total || 0}`);
    
    // Mostrar algunos usuarios de ejemplo
    const sampleUsers = await User.find({}).limit(3).select('name email createdAt');
    console.log("\n👥 Usuarios de ejemplo:");
    sampleUsers.forEach(user => {
      console.log(`  • ${user.name} (${user.email})`);
    });
    
    // Mostrar algunas conversaciones de ejemplo
    const sampleConversations = await Conversation.find({}).populate('userId', 'name').limit(3);
    console.log("\n💬 Conversaciones de ejemplo:");
    sampleConversations.forEach(conv => {
      console.log(`  • "${conv.title}" - ${conv.messages.length} mensajes (${conv.userId.name})`);
    });
    
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error.message);
  }
}

// Función principal
async function main() {
  console.log("🌱 IMAGINARIUM - POPULATION SCRIPT");
  console.log("====================================");
  
  // Conectar a MongoDB
  const connected = await connectToMongoDB();
  if (!connected) {
    console.error("💥 No se pudo conectar a MongoDB. Abortando.");
    process.exit(1);
  }
  
  try {
    // Limpiar base de datos existente
    await clearDatabase();
    
    // Crear usuarios
    const users = await createUsers();
    if (users.length === 0) {
      console.error("💥 No se pudieron crear usuarios. Abortando.");
      process.exit(1);
    }
    
    // Crear conversaciones
    const conversations = await createConversations(users);
    
    // Mostrar estadísticas
    await showStats();
    
    console.log("\n🎉 ¡BASE DE DATOS POBLADA EXITOSAMENTE!");
    console.log("🚀 Ahora puedes probar tus endpoints con datos reales:");
    console.log("   • /api/users - Verás los usuarios creados");
    console.log("   • /api/conversations - Verás las conversaciones con mensajes");
    
  } catch (error) {
    console.error("💥 Error durante la población:", error.message);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    console.error("💥 Error fatal:", error.message);
    process.exit(1);
  });
} 