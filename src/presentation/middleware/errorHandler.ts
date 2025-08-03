import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors/AppError';
import logger from '@shared/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';

  // Si es un error operacional conocido
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Errores de validación de MongoDB
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
  }
  // Error de duplicado de MongoDB
  else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Recurso ya existe';
  }
  // Error de cast de MongoDB (ID inválido)
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  }

  // Log del error
  if (statusCode >= 500) {
    logger.error(`Error ${statusCode}: ${error.message}`, {
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    logger.warn(`Error ${statusCode}: ${error.message}`, {
      url: req.url,
      method: req.method
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Manejo de rutas no encontradas
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
}; 