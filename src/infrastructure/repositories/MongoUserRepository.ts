import { UserRepository } from '@domain/repositories/UserRepository';
import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id);
      return user ? this.toEntity(user) : null;
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.toEntity(user) : null;
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      UserModel.find({ isActive: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments({ isActive: true })
    ]);

    return {
      users: users.map(user => this.toEntity(user)),
      total
    };
  }

  async create(userData: CreateUserData): Promise<User> {
    const user = new UserModel({
      ...userData,
      email: userData.email.toLowerCase()
    });
    
    const savedUser = await user.save();
    return this.toEntity(savedUser);
  }

  async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { 
        ...userData,
        ...(userData.email && { email: userData.email.toLowerCase() })
      },
      { new: true }
    );
    
    return updatedUser ? this.toEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    return !!result;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  private toEntity(userDoc: any): User {
    return {
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      password: userDoc.password,
      role: userDoc.role,
      isActive: userDoc.isActive,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };
  }
} 