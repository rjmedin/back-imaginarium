import { ConversationRepository } from '@domain/repositories/ConversationRepository';
import { PaginatedConversationsDto, ConversationResponseDto } from '../dtos/ConversationDto';
import { Conversation } from '@domain/entities/Conversation';

export class GetConversationsUseCase {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedConversationsDto> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const { conversations, total } = await this.conversationRepository.findByUserId(userId, validPage, validLimit);
    const totalPages = Math.ceil(total / validLimit);

    return {
      conversations: conversations.map(conversation => this.toResponseDto(conversation)),
      total,
      page: validPage,
      limit: validLimit,
      totalPages
    };
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