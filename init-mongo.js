// Script de inicialización para MongoDB
db = db.getSiblingDB('imaginarium_db');

// Crear usuario de aplicación
db.createUser({
  user: 'imaginarium_user',
  pwd: 'imaginarium_password',
  roles: [
    {
      role: 'readWrite',
      db: 'imaginarium_db'
    }
  ]
});

// Crear colecciones e índices iniciales
db.createCollection('users');
db.createCollection('conversations');
db.createCollection('messages');

// Índices para la colección users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });

// Índices para la colección conversations
db.conversations.createIndex({ userId: 1, createdAt: -1 });
db.conversations.createIndex({ userId: 1, isActive: 1 });
db.conversations.createIndex({ userId: 1, lastMessageAt: -1 });

// Índices para la colección messages
db.messages.createIndex({ conversationId: 1, timestamp: -1 });
db.messages.createIndex({ userId: 1, timestamp: -1 });
db.messages.createIndex({ conversationId: 1, messageType: 1 });

print('Base de datos inicializada correctamente con todas las colecciones'); 