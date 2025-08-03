import { MessageType, MessageMetadata } from '@domain/entities/Message';

export interface CreateMessageDto {
  conversationId: string;
  content: string;
  messageType: MessageType;
  metadata?: MessageMetadata;
}

export interface MessageResponseDto {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  messageType: MessageType;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface PaginatedMessagesDto {
  messages: MessageResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationWithMessagesDto {
  conversation: import('./ConversationDto').ConversationResponseDto;
  messages: MessageResponseDto[];
  totalMessages: number;
} 