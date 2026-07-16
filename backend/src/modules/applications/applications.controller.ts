import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';
import { AppError } from '../../utils/custom-error';

export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, jobType, source, search, sortBy } = req.query;

    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status as string;
    }
    if (jobType) {
      whereClause.jobType = jobType as string;
    }
    if (source) {
      whereClause.source = source as string;
    }

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { position: { contains: searchStr, mode: 'insensitive' } },
        { company: { name: { contains: searchStr, mode: 'insensitive' } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' }; // default

    if (sortBy === 'recentlyApplied') {
      orderBy = { appliedDate: 'desc' };
    } else if (sortBy === 'company') {
      orderBy = { company: { name: 'asc' } };
    } else if (sortBy === 'deadline') {
      orderBy = { deadline: 'asc' };
    } else if (sortBy === 'salary') {
      orderBy = { salaryMax: 'desc' };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        resume: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
        _count: {
          select: { interviews: true },
        },
      },
      orderBy,
    });

    return res.json({ success: true, applications });
  } catch (error) {
    return next(error);
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        company: true,
        resume: true,
        interviews: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!application) {
      return next(new AppError('Application not found or unauthorized', 404));
    }

    return res.json({ success: true, application });
  } catch (error) {
    return next(error);
  }
};

export const createApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      companyId,
      position,
      jobType,
      status,
      salaryMin,
      salaryMax,
      location,
      source,
      appliedDate,
      deadline,
      resumeId,
      coverLetter,
      notes,
      jobDescription,
      tailoringNotes,
    } = req.body;

    // Verify company belongs to user
    const company = await prisma.company.findFirst({
      where: { id: companyId, userId },
    });
    if (!company) {
      return next(new AppError('Selected company not found or unauthorized', 400));
    }

    // Verify resume belongs to user if provided
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        return next(new AppError('Selected resume not found or unauthorized', 400));
      }
    }

    const application = await prisma.application.create({
      data: {
        position,
        jobType,
        status,
        salaryMin: salaryMin !== undefined ? salaryMin : null,
        salaryMax: salaryMax !== undefined ? salaryMax : null,
        location,
        source,
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        deadline: deadline ? new Date(deadline) : null,
        coverLetter,
        notes,
        jobDescription,
        tailoringNotes,
        userId,
        companyId,
        resumeId: resumeId || null,
      },
      include: {
        company: true,
      },
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    return next(error);
  }
};

export const updateApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
      companyId,
      position,
      jobType,
      status,
      salaryMin,
      salaryMax,
      location,
      source,
      appliedDate,
      deadline,
      resumeId,
      coverLetter,
      notes,
      jobDescription,
      tailoringNotes,
    } = req.body;

    const existingApplication = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existingApplication) {
      return next(new AppError('Application not found or unauthorized', 404));
    }

    // Verify new company belongs to user if changed
    if (companyId && companyId !== existingApplication.companyId) {
      const company = await prisma.company.findFirst({
        where: { id: companyId, userId },
      });
      if (!company) {
        return next(new AppError('Selected company not found or unauthorized', 400));
      }
    }

    // Verify new resume belongs to user if changed
    if (resumeId && resumeId !== existingApplication.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        return next(new AppError('Selected resume not found or unauthorized', 400));
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        position,
        jobType,
        status,
        salaryMin: salaryMin !== undefined ? salaryMin : undefined,
        salaryMax: salaryMax !== undefined ? salaryMax : undefined,
        location,
        source,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
        coverLetter,
        notes,
        jobDescription,
        tailoringNotes,
        companyId,
        resumeId: resumeId !== undefined ? (resumeId || null) : undefined,
      },
      include: {
        company: true,
        resume: true,
      },
    });

    return res.json({ success: true, application });
  } catch (error) {
    return next(error);
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingApplication = await prisma.application.findFirst({
      where: { id, userId },
    });

    if (!existingApplication) {
      return next(new AppError('Application not found or unauthorized', 404));
    }

    await prisma.application.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
