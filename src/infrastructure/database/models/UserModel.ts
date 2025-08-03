import mongoose, { Schema, Document } from 'mongoose';
import { User, UserRole } from '@domain/entities/User';

interface UserDocument extends Omit<User, 'id'>, Document {}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.password) delete ret.password;
      return ret;
    }
  }
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema); 