export interface Conversation {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  messageCount: number;
}

export interface CreateConversationData {
  userId: string;
  title: string;
  description?: string;
}

export interface UpdateConversationData {
  title?: string;
  description?: string;
  isActive?: boolean;
  lastMessageAt?: Date;
  messageCount?: number;
} 