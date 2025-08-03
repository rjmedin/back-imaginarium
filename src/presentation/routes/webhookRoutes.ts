import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

export const createWebhookRoutes = (): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/webhooks/test:
   *   post:
   *     summary: Endpoint de prueba para n8n
   *     tags: [Webhooks]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/test', authenticateToken, (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Webhook test exitoso',
      timestamp: new Date().toISOString(),
      data: req.body,
      output: {
        status: 'received',
        timestamp: new Date().toISOString(),
        payload: req.body
      }
    });
  });

  /**
   * @swagger
   * /api/v1/webhooks/conversation-notification:
   *   post:
   *     summary: Recibir notificaciones de conversaciones
   *     tags: [Webhooks]
   */
  router.post('/conversation-notification', (req, res) => {
    const { type, conversationId, data } = req.body;
    
    res.status(200).json({
      success: true,
      message: 'Notificación recibida',
      type,
      conversationId,
      processed: true,
      timestamp: new Date().toISOString()
    });
  });

  return router;
}; 