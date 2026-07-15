import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';
import { AppError } from '../../utils/custom-error';

export const getInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    // Get interviews for applications belonging to this user
    const interviews = await prisma.interview.findMany({
      where: {
        application: {
          userId,
        },
      },
      include: {
        application: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
    return res.json({ success: true, interviews });
  } catch (error) {
    return next(error);
  }
};

export const createInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { stage, date, time, interviewer, meetingLink, notes, outcome, applicationId } = req.body;

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) {
      return next(new AppError('Application not found or unauthorized', 400));
    }

    const interview = await prisma.interview.create({
      data: {
        stage,
        date: new Date(date),
        time,
        interviewer,
        meetingLink,
        notes,
        outcome: outcome || 'Pending',
        applicationId,
      },
    });

    return res.status(201).json({ success: true, interview });
  } catch (error) {
    return next(error);
  }
};

export const updateInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { stage, date, time, interviewer, meetingLink, notes, outcome, applicationId } = req.body;

    // Verify interview exists and application belongs to user
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id,
        application: { userId },
      },
    });

    if (!existingInterview) {
      return next(new AppError('Interview not found or unauthorized', 404));
    }

    // Verify new application belongs to user if changed
    if (applicationId && applicationId !== existingInterview.applicationId) {
      const application = await prisma.application.findFirst({
        where: { id: applicationId, userId },
      });
      if (!application) {
        return next(new AppError('Selected application not found or unauthorized', 400));
      }
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        stage,
        date: date ? new Date(date) : undefined,
        time,
        interviewer,
        meetingLink,
        notes,
        outcome,
        applicationId,
      },
    });

    return res.json({ success: true, interview });
  } catch (error) {
    return next(error);
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify interview exists and application belongs to user
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id,
        application: { userId },
      },
    });

    if (!existingInterview) {
      return next(new AppError('Interview not found or unauthorized', 404));
    }

    await prisma.interview.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
