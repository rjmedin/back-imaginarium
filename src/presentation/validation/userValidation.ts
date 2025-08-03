import Joi from 'joi';
import { UserRole } from '@domain/entities/User';

export const createUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es obligatorio'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': 'Rol inválido'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es obligatorio'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es obligatoria'
    })
});

export const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Debe ser un email válido'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .optional()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': 'Rol inválido'
    }),
  isActive: Joi.boolean()
    .optional()
});

export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'La página debe ser mayor a 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'El límite debe ser mayor a 0',
      'number.max': 'El límite no puede exceder 100'
    })
}); 