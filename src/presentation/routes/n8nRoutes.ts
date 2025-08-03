import { Router } from "express";
import { ConversationController } from "../controllers/ConversationController";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { Response, NextFunction } from "express";

export const createN8nRoutes = (conversationController: ConversationController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/n8n/conversations/create:
   *   post:
   *     summary: Crear conversación optimizada para n8n
   *     tags: [N8n Integration]
   *     security:
   *       - bearerAuth: []
   */
  router.post("/conversations/create", authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const conversation = await conversationController["createConversationUseCase"].execute(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: "Conversación creada exitosamente",
        data: conversation,
        output: {
          conversationId: conversation.id,
          title: conversation.title,
          timestamp: conversation.createdAt,
          userId: userId
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/v1/n8n/messages/send:
   *   post:
   *     summary: Enviar mensaje optimizado para n8n
   *     tags: [N8n Integration]
   *     security:
   *       - bearerAuth: []
   */
  router.post("/messages/send", authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { conversationId, content, messageType = "user", metadata = {} } = req.body;

      const messageData = {
        conversationId,
        content,
        messageType,
        metadata: {
          source: "n8n",
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };

      const message = await conversationController["createMessageUseCase"].execute(userId, messageData);

      res.status(201).json({
        success: true,
        message: "Mensaje enviado exitosamente",
        data: message,
        output: {
          messageId: message.id,
          conversationId: message.conversationId,
          content: message.content,
          type: message.messageType,
          timestamp: message.timestamp
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/v1/n8n/conversations/list:
   *   get:
   *     summary: Listar conversaciones formato n8n
   *     tags: [N8n Integration]
   *     security:
   *       - bearerAuth: []
   */
  router.get("/conversations/list", authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await conversationController["getConversationsUseCase"].execute(userId, page, limit);

      res.status(200).json({
        success: true,
        message: "Conversaciones obtenidas exitosamente",
        data: result,
        output: result.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          messageCount: conv.messageCount,
          lastActivity: conv.lastMessageAt,
          isActive: conv.isActive
        }))
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}; 