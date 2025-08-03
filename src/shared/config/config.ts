import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Base de datos
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'imaginarium_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
};

export const validateConfig = (): void => {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }
}; 