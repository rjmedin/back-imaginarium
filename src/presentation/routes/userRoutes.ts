import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createUserSchema, loginSchema, paginationSchema } from '../validation/userValidation';
import { UserRole } from '@domain/entities/User';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  // Rutas públicas
  router.post('/register', validate(createUserSchema), (req, res, next) => {
    userController.createUser(req, res, next);
  });

  router.post('/login', validate(loginSchema), (req, res, next) => {
    userController.login(req, res, next);
  });

  // Rutas protegidas
  router.get('/profile', authenticateToken, (req, res, next) => {
    userController.getProfile(req, res, next);
  });

  router.get(
    '/',
    authenticateToken,
    authorizeRoles(UserRole.ADMIN),
    validateQuery(paginationSchema),
    (req, res, next) => {
      userController.getUsers(req, res, next);
    }
  );

  return router;
}; 