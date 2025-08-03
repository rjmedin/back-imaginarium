import Joi from 'joi';
import { MessageType } from '@domain/entities/Message';

export const createMessageSchema = Joi.object({
  conversationId: Joi.string()
    .required()
    .messages({
      'any.required': 'El ID de conversación es obligatorio'
    }),
  content: Joi.string()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'string.min': 'El contenido debe tener al menos 1 carácter',
      'string.max': 'El contenido no puede exceder 10000 caracteres',
      'any.required': 'El contenido es obligatorio'
    }),
  messageType: Joi.string()
    .valid(...Object.values(MessageType))
    .required()
    .messages({
      'any.only': 'Tipo de mensaje inválido',
      'any.required': 'El tipo de mensaje es obligatorio'
    }),
  metadata: Joi.object()
    .optional()
}); 