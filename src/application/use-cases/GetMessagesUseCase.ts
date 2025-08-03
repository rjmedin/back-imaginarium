import { MessageRepository } from '@domain/repositories/MessageRepository';
import { ConversationRepository } from '@domain/repositories/ConversationRepository';
import { PaginatedMessagesDto, MessageResponseDto } from '../dtos/MessageDto';
import { NotFoundError, ValidationError } from '@shared/errors/AppError';
import { Message } from '@domain/entities/Message';

export class GetMessagesUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository
  ) {}

  async execute(userId: string, conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedMessagesDto> {
    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversación no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new ValidationError('No tienes permisos para ver esta conversación');
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const { messages, total } = await this.messageRepository.findByConversationId(conversationId, validPage, validLimit);
    const totalPages = Math.ceil(total / validLimit);

    return {
      messages: messages.map(message => this.toResponseDto(message)),
      total,
      page: validPage,
      limit: validLimit,
      totalPages
    };
  }

  private toResponseDto(message: Message): MessageResponseDto {
    const dto: MessageResponseDto = {
      id: message.id!,
      conversationId: message.conversationId,
      userId: message.userId,
      content: message.content,
      messageType: message.messageType,
      timestamp: message.timestamp
    };

    if (message.metadata !== undefined) {
      dto.metadata = message.metadata;
    }

    return dto;
  }
} 