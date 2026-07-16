import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/custom-error';
import { AuthRequest } from '../../types';
import { env } from '../../config/env';

const JWT_SECRET = env.JWT_SECRET;

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email } = req.body;
  const userId = req.user!.id;

  try {
    // Check if email already in use by another user
    if (email && email.toLowerCase() !== req.user!.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return next(new AppError('Email is already in use by another account', 400));
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email ? email.toLowerCase() : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};
