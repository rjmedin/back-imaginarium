import mongoose from 'mongoose';
import logger from '@shared/utils/logger';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Ya conectado a MongoDB');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imaginarium_db';
      
      await mongoose.connect(mongoUri);
      
      this.isConnected = true;
      logger.info('Conectado exitosamente a MongoDB');

      // Manejar eventos de conexión
      mongoose.connection.on('error', (error) => {
        logger.error('Error de conexión MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Desconectado de MongoDB');
        this.isConnected = false;
      });

    } catch (error) {
      logger.error('Error al conectar a MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Desconectado de MongoDB');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
} 