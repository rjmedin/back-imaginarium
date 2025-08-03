import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createRoutes } from '@presentation/routes';
import { createN8nRoutes } from '@presentation/routes/n8nRoutes';
import { createWebhookRoutes } from '@presentation/routes/webhookRoutes';
import { errorHandler, notFoundHandler } from '@presentation/middleware/errorHandler';
import { Container } from '@infrastructure/container/Container';
import { config } from '@shared/config/config';
import { swaggerOptions } from '@shared/config/swagger';
import logger from '@shared/utils/logger'; 

export const createApp = (): express.Application => {
  const app = express();
  const container = Container.getInstance();

  // Middlewares de seguridad
  app.use(helmet());
  
  // CORS configurado para producción y n8n
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL || 'https://back-imaginarium.vercel.app',
          'https://app.n8n.cloud',
          process.env.N8N_URL || 'http://localhost:5678'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:5678',
          'https://app.n8n.cloud',
          true
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      success: false,
      message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path.startsWith('/api/v1/n8n') || 
             req.path.startsWith('/api/v1/webhooks') ||
             req.path === '/health' ||
             req.path === '/api';
    }
  });
  app.use(limiter);

  // Middlewares de parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger Documentation
  if (config.nodeEnv === 'development' || process.env.ENABLE_SWAGGER === 'true') {
    try {
      const specs = swaggerJsdoc(swaggerOptions);
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Imaginarium API Documentation'
      }));
      
      app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
      });
      
      logger.info('Swagger UI disponible en: /api-docs');
    } catch (error) {
      logger.error('Error configurando Swagger:', error);
    }
  }

  // Request logging solo en desarrollo
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      logger.info(`Request: ${req.method} ${req.path}`, {
        body: Object.keys(req.body).length > 0 ? req.body : undefined,
        query: Object.keys(req.query).length > 0 ? req.query : undefined
      });
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente. Todo va bien.',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      features: {
        swagger: process.env.ENABLE_SWAGGER === 'true',
        n8n: true,
        webhooks: true
      }
    });
  });

  // Debug endpoint para Vercel
  app.get('/debug', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Debug endpoint funcionando',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_SWAGGER: process.env.ENABLE_SWAGGER,
        PORT: process.env.PORT
      },
      config: {
        nodeEnv: config.nodeEnv,
        swaggerEnabled: config.nodeEnv === 'development' || process.env.ENABLE_SWAGGER === 'true'
      },
      paths: {
        __dirname: __dirname,
        cwd: process.cwd()
      },
      timestamp: new Date().toISOString()
    });
  });

  // Endpoint raíz para Vercel
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: ' Imaginarium API - Sistema de Conversaciones con IA',
      version: '1.0.0',
      environment: config.nodeEnv,
      endpoints: {
        health: '/health',
        docs: '/api-docs',
        api: '/api/v1',
        n8n: '/api/v1/n8n',
        webhooks: '/api/v1/webhooks'
      },
      timestamp: new Date().toISOString()
    });
  });

  // API info endpoint
  app.get('/api', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Imaginarium API v1.0.0',
      documentation: '/api-docs',
      endpoints: {
        users: '/api/v1/users',
        conversations: '/api/v1/conversations',
        n8n: '/api/v1/n8n',
        webhooks: '/api/v1/webhooks'
      }
    });
  });

  // Rutas principales
  app.use(createRoutes(container.userController, container.conversationController));
  
  // Rutas específicas para n8n
  app.use('/api/v1/n8n', createN8nRoutes(container.conversationController));
  
  // Rutas de webhooks
  app.use('/api/v1/webhooks', createWebhookRoutes());

  // Middleware de manejo de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
