import { ConversationRepository } from '@domain/repositories/ConversationRepository';
import { Conversation, CreateConversationData, UpdateConversationData } from '@domain/entities/Conversation';
import { ConversationModel } from '../database/models/ConversationModel';

export class MongoConversationRepository implements ConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    try {
      const conversation = await ConversationModel.findById(id);
      return conversation ? this.toEntity(conversation) : null;
    } catch (error) {
      return null;
    }
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<{ conversations: Conversation[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [conversations, total] = await Promise.all([
      ConversationModel.find({ userId, isActive: true })
        .skip(skip)
        .limit(limit)
        .sort({ lastMessageAt: -1, createdAt: -1 }),
      ConversationModel.countDocuments({ userId, isActive: true })
    ]);

    return {
      conversations: conversations.map(conversation => this.toEntity(conversation)),
      total
    };
  }

  async findActiveByUserId(userId: string): Promise<Conversation[]> {
    const conversations = await ConversationModel.find({ 
      userId, 
      isActive: true 
    }).sort({ lastMessageAt: -1, createdAt: -1 });

    return conversations.map(conversation => this.toEntity(conversation));
  }

  async create(conversationData: CreateConversationData): Promise<Conversation> {
    const conversation = new ConversationModel(conversationData);
    const savedConversation = await conversation.save();
    return this.toEntity(savedConversation);
  }

  async update(id: string, conversationData: UpdateConversationData): Promise<Conversation | null> {
    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      id,
      conversationData,
      { new: true }
    );
    
    return updatedConversation ? this.toEntity(updatedConversation) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ConversationModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    return !!result;
  }

  async incrementMessageCount(id: string): Promise<boolean> {
    const result = await ConversationModel.findByIdAndUpdate(
      id,
      { $inc: { messageCount: 1 } },
      { new: true }
    );
    
    return !!result;
  }

  async updateLastMessageTime(id: string, timestamp: Date): Promise<boolean> {
    const result = await ConversationModel.findByIdAndUpdate(
      id,
      { lastMessageAt: timestamp },
      { new: true }
    );
    
    return !!result;
  }

  private toEntity(conversationDoc: any): Conversation {
    return {
      id: conversationDoc._id.toString(),
      userId: conversationDoc.userId,
      title: conversationDoc.title,
      description: conversationDoc.description,
      isActive: conversationDoc.isActive,
      createdAt: conversationDoc.createdAt,
      updatedAt: conversationDoc.updatedAt,
      lastMessageAt: conversationDoc.lastMessageAt,
      messageCount: conversationDoc.messageCount
    };
  }
} 