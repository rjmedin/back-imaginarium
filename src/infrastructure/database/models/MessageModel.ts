import mongoose, { Schema, Document } from 'mongoose';
import { Message, MessageType } from '@domain/entities/Message';

interface MessageDocument extends Omit<Message, 'id'>, Document {}

const messageSchema = new Schema<MessageDocument>({
  conversationId: {
    type: String,
    required: true,
    ref: 'Conversation'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false, // Usamos timestamp personalizado
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
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ userId: 1, timestamp: -1 });
messageSchema.index({ conversationId: 1, messageType: 1 });

export const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema); 