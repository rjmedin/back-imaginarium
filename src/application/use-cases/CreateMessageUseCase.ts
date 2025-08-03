import { MessageRepository } from '@domain/repositories/MessageRepository';
import { ConversationRepository } from '@domain/repositories/ConversationRepository';
import { CreateMessageDto, MessageResponseDto } from '../dtos/MessageDto';
import { NotFoundError, ValidationError } from '@shared/errors/AppError';
import { Message } from '@domain/entities/Message';

export class CreateMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository
  ) {}

  async execute(userId: string, messageData: CreateMessageDto): Promise<MessageResponseDto> {
    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await this.conversationRepository.findById(messageData.conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversación no encontrada');
    }

    if (conversation.userId !== userId) {
      throw new ValidationError('No tienes permisos para escribir en esta conversación');
    }

    if (!conversation.isActive) {
      throw new ValidationError('La conversación está inactiva');
    }

    // Crear el mensaje
    const createData = {
      conversationId: messageData.conversationId,
      userId,
      content: messageData.content,
      messageType: messageData.messageType,
      timestamp: new Date(),
      ...(messageData.metadata && { metadata: messageData.metadata })
    };
    const newMessage = await this.messageRepository.create(createData);

    // Actualizar estadísticas de la conversación
    await this.conversationRepository.incrementMessageCount(messageData.conversationId);
    await this.conversationRepository.updateLastMessageTime(messageData.conversationId, new Date());

    return this.toResponseDto(newMessage);
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