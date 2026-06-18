import { env } from '../../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware. Must be registered last.
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Prisma known request errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Related record not found';
        break;
      default:
        statusCode = 400;
        message = 'Database error';
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // JWT errors
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, {
      error: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, {
      url: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
