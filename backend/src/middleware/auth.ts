import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { AppError } from '../utils/custom-error';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided, authorization denied', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch (error) {
    return next(new AppError('Token is not valid or has expired', 401));
  }
};
