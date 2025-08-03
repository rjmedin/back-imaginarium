import { MessageRepository } from '@domain/repositories/MessageRepository';
import { Message, CreateMessageData } from '@domain/entities/Message';
import { MessageModel } from '../database/models/MessageModel';

export class MongoMessageRepository implements MessageRepository {
  async findById(id: string): Promise<Message | null> {
    try {
      const message = await MessageModel.findById(id);
      return message ? this.toEntity(message) : null;
    } catch (error) {
      return null;
    }
  }

  async findByConversationId(conversationId: string, page: number, limit: number): Promise<{ messages: Message[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      MessageModel.find({ conversationId })
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: 1 }), // Orden cronológico ascendente
      MessageModel.countDocuments({ conversationId })
    ]);

    return {
      messages: messages.map(message => this.toEntity(message)),
      total
    };
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<{ messages: Message[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      MessageModel.find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ timestamp: -1 }),
      MessageModel.countDocuments({ userId })
    ]);

    return {
      messages: messages.map(message => this.toEntity(message)),
      total
    };
  }

  async findLatestByConversationId(conversationId: string, limit: number): Promise<Message[]> {
    const messages = await MessageModel.find({ conversationId })
      .limit(limit)
      .sort({ timestamp: -1 });

    return messages.map(message => this.toEntity(message));
  }

  async create(messageData: CreateMessageData): Promise<Message> {
    const message = new MessageModel(messageData);
    const savedMessage = await message.save();
    return this.toEntity(savedMessage);
  }

  async delete(id: string): Promise<boolean> {
    const result = await MessageModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByConversationId(conversationId: string): Promise<boolean> {
    const result = await MessageModel.deleteMany({ conversationId });
    return result.deletedCount! > 0;
  }

  async countByConversationId(conversationId: string): Promise<number> {
    return await MessageModel.countDocuments({ conversationId });
  }

  private toEntity(messageDoc: any): Message {
    return {
      id: messageDoc._id.toString(),
      conversationId: messageDoc.conversationId,
      userId: messageDoc.userId,
      content: messageDoc.content,
      messageType: messageDoc.messageType,
      timestamp: messageDoc.timestamp,
      metadata: messageDoc.metadata
    };
  }
} 