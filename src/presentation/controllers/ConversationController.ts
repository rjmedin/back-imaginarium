import { Request, Response, NextFunction } from 'express';
import { CreateConversationUseCase } from '@application/use-cases/CreateConversationUseCase';
import { GetConversationsUseCase } from '@application/use-cases/GetConversationsUseCase';
import { CreateMessageUseCase } from '@application/use-cases/CreateMessageUseCase';
import { GetMessagesUseCase } from '@application/use-cases/GetMessagesUseCase';
import { AuthenticatedRequest } from '../middleware/auth';

export class ConversationController {
  constructor(
    private createConversationUseCase: CreateConversationUseCase,
    private getConversationsUseCase: GetConversationsUseCase,
    private createMessageUseCase: CreateMessageUseCase,
    private getMessagesUseCase: GetMessagesUseCase
  ) {}

  async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const conversation = await this.createConversationUseCase.execute(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Conversación creada exitosamente',
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const conversations = await this.getConversationsUseCase.execute(userId, page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Conversaciones obtenidas exitosamente',
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }

  async createMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const message = await this.createMessageUseCase.execute(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Mensaje creado exitosamente',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.conversationId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await this.getMessagesUseCase.execute(userId, conversationId, page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes obtenidos exitosamente',
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }
} 