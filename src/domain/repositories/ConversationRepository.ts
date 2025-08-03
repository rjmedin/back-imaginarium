import { Conversation, CreateConversationData, UpdateConversationData } from '../entities/Conversation';

export interface ConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ conversations: Conversation[]; total: number }>;
  findActiveByUserId(userId: string): Promise<Conversation[]>;
  create(conversationData: CreateConversationData): Promise<Conversation>;
  update(id: string, conversationData: UpdateConversationData): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;
  incrementMessageCount(id: string): Promise<boolean>;
  updateLastMessageTime(id: string, timestamp: Date): Promise<boolean>;
} 