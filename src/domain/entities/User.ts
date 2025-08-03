export interface User {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
} 