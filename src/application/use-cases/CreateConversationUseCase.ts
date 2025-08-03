import { ConversationRepository } from '@domain/repositories/ConversationRepository';
import { UserRepository } from '@domain/repositories/UserRepository';
import { CreateConversationDto, ConversationResponseDto } from '../dtos/ConversationDto';
import { NotFoundError } from '@shared/errors/AppError';
import { Conversation } from '@domain/entities/Conversation';

export class CreateConversationUseCase {
  constructor(
    private conversationRepository: ConversationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, conversationData: CreateConversationDto): Promise<ConversationResponseDto> {
    // Verificar que el usuario exista
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Crear la conversación
    const createData = {
      userId,
      title: conversationData.title,
      ...(conversationData.description && { description: conversationData.description })
    };
    const newConversation = await this.conversationRepository.create(createData);

    return this.toResponseDto(newConversation);
  }

  private toResponseDto(conversation: Conversation): ConversationResponseDto {
    const dto: ConversationResponseDto = {
      id: conversation.id!,
      userId: conversation.userId,
      title: conversation.title,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messageCount
    };

    if (conversation.description !== undefined) {
      dto.description = conversation.description;
    }

    if (conversation.lastMessageAt !== undefined) {
      dto.lastMessageAt = conversation.lastMessageAt;
    }

    return dto;
  }
} 