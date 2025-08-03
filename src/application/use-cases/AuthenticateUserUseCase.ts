import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRepository } from '@domain/repositories/UserRepository';
import { LoginDto, AuthResponseDto, UserResponseDto } from '../dtos/UserDto';
import { UnauthorizedError } from '@shared/errors/AppError';
import { User } from '@domain/entities/User';

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(loginData: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Generar token JWT
    const token = this.generateToken(user);

    return {
      user: this.toResponseDto(user),
      token
    };
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
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