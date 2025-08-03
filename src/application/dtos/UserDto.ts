import { UserRole } from '@domain/entities/User';

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}

export interface PaginatedUsersDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 