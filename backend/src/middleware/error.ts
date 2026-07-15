import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/custom-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle unique constraint or database errors from Prisma
  if (err.message && err.message.includes('Unique constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'A record with this unique value already exists.',
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
