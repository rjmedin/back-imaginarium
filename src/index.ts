import { createApp } from './app';
import { DatabaseConnection } from '@infrastructure/database/connection';
import { config, validateConfig } from '@shared/config/config';
import logger from '@shared/utils/logger';

async function startServer(): Promise<void> {
  try {
    // Validar configuración
    validateConfig();
    logger.info('Configuración validada correctamente');

    // Conectar a la base de datos
    const db = DatabaseConnection.getInstance();
    await db.connect();

    // Crear aplicación
    const app = createApp();

    // Iniciar servidor
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${config.port}`);
      logger.info(`🌍 Ambiente: ${config.nodeEnv}`);
      logger.info(`📊 Health check: http://localhost:${config.port}/health`);
    });

    // Manejo graceful de cierre
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Recibida señal ${signal}. Cerrando servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        
        try {
          await db.disconnect();
          logger.info('Desconectado de MongoDB');
          process.exit(0);
        } catch (error) {
          logger.error('Error al desconectar de MongoDB:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer(); 