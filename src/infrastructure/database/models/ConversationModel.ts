import mongoose, { Schema, Document } from 'mongoose';
import { Conversation } from '@domain/entities/Conversation';

interface ConversationDocument extends Omit<Conversation, 'id'>, Document {}

const conversationSchema = new Schema<ConversationDocument>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, isActive: 1 });
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', conversationSchema); 