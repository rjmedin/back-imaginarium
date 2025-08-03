import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '@application/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '@application/use-cases/AuthenticateUserUseCase';
import { GetUsersUseCase } from '@application/use-cases/GetUsersUseCase';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUserUseCase,
    private getUsersUseCase: GetUsersUseCase
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authData = await this.authenticateUserUseCase.execute(req.body);
      res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        data: authData
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const paginatedUsers = await this.getUsersUseCase.execute(page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: paginatedUsers
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
} 