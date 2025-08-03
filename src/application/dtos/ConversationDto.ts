export interface CreateConversationDto {
  title: string;
  description?: string;
}

export interface UpdateConversationDto {
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface ConversationResponseDto {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  messageCount: number;
}

export interface PaginatedConversationsDto {
  conversations: ConversationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 