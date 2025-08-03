import Joi from 'joi';

export const createConversationSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 1 carácter',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título es obligatorio'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    })
});

export const updateConversationSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'El título debe tener al menos 1 carácter',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
  isActive: Joi.boolean()
    .optional()
}); 