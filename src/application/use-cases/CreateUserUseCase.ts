import bcrypt from 'bcryptjs';
import { UserRepository } from '@domain/repositories/UserRepository';
import { CreateUserDto, UserResponseDto } from '../dtos/UserDto';
import { ConflictError } from '@shared/errors/AppError';
import { User, UserRole } from '@domain/entities/User';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Crear el usuario
    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER
    });

    // Retornar sin la contraseña
    return this.toResponseDto(newUser);
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