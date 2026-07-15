import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';
import { AppError } from '../../utils/custom-error';

export const getResumes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, resumes });
  } catch (error) {
    return next(error);
  }
};

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, version, fileUrl } = req.body;

    const resume = await prisma.resume.create({
      data: {
        name,
        version,
        fileUrl,
        userId,
      },
    });

    return res.status(201).json({ success: true, resume });
  } catch (error) {
    return next(error);
  }
};

export const updateResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, version, fileUrl } = req.body;

    const existingResume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!existingResume) {
      return next(new AppError('Resume not found or unauthorized', 404));
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        name,
        version,
        fileUrl,
      },
    });

    return res.json({ success: true, resume });
  } catch (error) {
    return next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingResume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!existingResume) {
      return next(new AppError('Resume not found or unauthorized', 404));
    }

    await prisma.resume.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
