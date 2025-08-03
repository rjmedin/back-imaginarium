import { UserRepository } from '@domain/repositories/UserRepository';
import { PaginatedUsersDto, UserResponseDto } from '../dtos/UserDto';
import { User } from '@domain/entities/User';

export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(page: number = 1, limit: number = 10): Promise<PaginatedUsersDto> {
    // Validar parámetros
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    // Obtener usuarios
    const { users, total } = await this.userRepository.findAll(validPage, validLimit);

    // Calcular páginas totales
    const totalPages = Math.ceil(total / validLimit);

    return {
      users: users.map(user => this.toResponseDto(user)),
      total,
      page: validPage,
      limit: validLimit,
      totalPages
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id!,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
} 