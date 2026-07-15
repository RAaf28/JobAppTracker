import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';
import { AppError } from '../../utils/custom-error';

export const getCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const companies = await prisma.company.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, companies });
  } catch (error) {
    return next(error);
  }
};

export const createCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, industry, website, location, size, notes } = req.body;

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website,
        location,
        size,
        notes,
        userId,
      },
    });

    return res.status(201).json({ success: true, company });
  } catch (error) {
    return next(error);
  }
};

export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, industry, website, location, size, notes } = req.body;

    const existingCompany = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!existingCompany) {
      return next(new AppError('Company not found or unauthorized', 404));
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        industry,
        website,
        location,
        size,
        notes,
      },
    });

    return res.json({ success: true, company });
  } catch (error) {
    return next(error);
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingCompany = await prisma.company.findFirst({
      where: { id, userId },
    });

    if (!existingCompany) {
      return next(new AppError('Company not found or unauthorized', 404));
    }

    await prisma.company.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
