// 🔍 Script para verificar datos en MongoDB Atlas (con URL directa)
console.log("🔍 Verificando datos en MongoDB Atlas...");

const mongoose = require('mongoose');

// URL directa de Atlas con base de datos especificada
const ATLAS_URI = "mongodb+srv://rodolfojmedina:y7QqMAROzYfROgrb@cluster0.4vdcvsn.mongodb.net/imaginarium_db?retryWrites=true&w=majority&appName=Cluster0";

// Configuración de conexión
async function connectToMongoDB() {
  try {
    console.log("🔗 Conectando a Atlas cluster...");
    
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    });
    
    mongoose.set('bufferCommands', false);
    console.log("✅ Conectado a MongoDB Atlas exitosamente");
    
    // Mostrar información de la conexión
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Base de datos activa: ${dbName}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    return false;
  }
}

// Schemas (mismos que la API y el script de población)
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

// Función para mostrar estadísticas detalladas
async function showDetailedStats() {
  try {
    console.log("\n📊 ESTADÍSTICAS DETALLADAS:");
    
    // Contar documentos
    const userCount = await User.countDocuments();
    const conversationCount = await Conversation.countDocuments();
    
    console.log(`👥 Total usuarios: ${userCount}`);
    console.log(`💬 Total conversaciones: ${conversationCount}`);
    
    if (userCount > 0) {
      console.log("\n👥 USUARIOS ENCONTRADOS:");
      const users = await User.find({}).select('name email createdAt').limit(10);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      });
    } else {
      console.log("⚠️ No se encontraron usuarios en la base de datos");
    }
    
    if (conversationCount > 0) {
      console.log("\n💬 CONVERSACIONES ENCONTRADAS:");
      const conversations = await Conversation.find({}).populate('userId', 'name email').limit(10);
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. "${conv.title}" - ${conv.messages.length} mensajes`);
      });
      
      // Contar mensajes totales
      const totalMessages = await Conversation.aggregate([
        { $unwind: "$messages" },
        { $count: "total" }
      ]);
      console.log(`📝 Total mensajes: ${totalMessages[0]?.total || 0}`);
    } else {
      console.log("⚠️ No se encontraron conversaciones en la base de datos");
    }
    
    // Verificar collections en la base de datos
    console.log("\n🗄️ COLLECTIONS EN LA BASE DE DATOS:");
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`  • ${collection.name}`);
    });
    
    // Verificar otras bases de datos disponibles
    console.log("\n🗄️ BASES DE DATOS DISPONIBLES:");
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    dbs.databases.forEach(db => {
      console.log(`  • ${db.name} (${db.sizeOnDisk ? Math.round(db.sizeOnDisk / 1024) + ' KB' : 'empty'})`);
    });
    
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error.message);
  }
}

// Función principal
async function main() {
  console.log("🔍 IMAGINARIUM - ATLAS DATABASE VERIFICATION");
  console.log("==========================================");
  
  // Conectar a MongoDB
  const connected = await connectToMongoDB();
  if (!connected) {
    console.error("💥 No se pudo conectar a MongoDB Atlas. Abortando.");
    process.exit(1);
  }
  
  try {
    await showDetailedStats();
    
    console.log("\n✅ VERIFICACIÓN COMPLETADA");
    console.log("📋 Si no hay datos, puede ser que:");
    console.log("   1. Los datos se crearon en otra base de datos");
    console.log("   2. La API está usando una URL diferente");
    console.log("   3. Hay un problema de configuración");
    
  } catch (error) {
    console.error("💥 Error durante la verificación:", error.message);
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