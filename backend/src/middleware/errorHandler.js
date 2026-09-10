import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      },
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token expired' },
    });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
    },
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` },
  });
};
