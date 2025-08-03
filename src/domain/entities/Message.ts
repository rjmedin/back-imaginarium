export interface Message {
  id?: string;
  conversationId: string;
  userId: string;
  content: string;
  messageType: MessageType;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export enum MessageType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface MessageMetadata {
  aiModel?: string;
  processingTime?: number;
  tokens?: number;
  temperature?: number;
  [key: string]: any;
}

export interface CreateMessageData {
  conversationId: string;
  userId: string;
  content: string;
  messageType: MessageType;
  timestamp?: Date;
  metadata?: MessageMetadata;
} 