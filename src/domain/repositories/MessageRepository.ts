import { Message, CreateMessageData } from '../entities/Message';

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByConversationId(conversationId: string, page: number, limit: number): Promise<{ messages: Message[]; total: number }>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ messages: Message[]; total: number }>;
  findLatestByConversationId(conversationId: string, limit: number): Promise<Message[]>;
  create(messageData: CreateMessageData): Promise<Message>;
  delete(id: string): Promise<boolean>;
  deleteByConversationId(conversationId: string): Promise<boolean>;
  countByConversationId(conversationId: string): Promise<number>;
} 