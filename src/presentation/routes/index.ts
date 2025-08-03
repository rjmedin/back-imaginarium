import { Router } from 'express';
import { createUserRoutes } from './userRoutes';
import { createConversationRoutes } from './conversationRoutes';
import { UserController } from '../controllers/UserController';
import { ConversationController } from '../controllers/ConversationController';

export const createRoutes = (userController: UserController, conversationController: ConversationController): Router => {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  router.use('/api/v1/users', createUserRoutes(userController));
  router.use('/api/v1/conversations', createConversationRoutes(conversationController));

  return router;
}; 