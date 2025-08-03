import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';
import { authenticateToken } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createConversationSchema } from '../validation/conversationValidation';
import { createMessageSchema } from '../validation/messageValidation';
import { paginationSchema } from '../validation/userValidation';

export const createConversationRoutes = (conversationController: ConversationController): Router => {
  const router = Router();

  // Todas las rutas requieren autenticación
  router.use(authenticateToken);

  // Conversaciones
  router.post('/', validate(createConversationSchema), (req, res, next) => {
    conversationController.createConversation(req, res, next);
  });

  router.get('/', validateQuery(paginationSchema), (req, res, next) => {
    conversationController.getConversations(req, res, next);
  });

  // Mensajes
  router.post('/messages', validate(createMessageSchema), (req, res, next) => {
    conversationController.createMessage(req, res, next);
  });

  router.get('/:conversationId/messages', validateQuery(paginationSchema), (req, res, next) => {
    conversationController.getMessages(req, res, next);
  });

  return router;
}; 