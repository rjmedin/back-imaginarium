import { User, CreateUserData, UpdateUserData } from '../entities/User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<{ users: User[]; total: number }>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
} 