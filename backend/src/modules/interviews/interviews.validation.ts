import { z } from 'zod';

export const createInterviewSchema = z.object({
  body: z.object({
    stage: z.string().min(1, 'Stage is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().optional().nullable(),
    interviewer: z.string().optional().nullable(),
    meetingLink: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    outcome: z.enum(['Passed', 'Failed', 'Pending']).optional().nullable(),
    applicationId: z.string().uuid('Invalid application ID'),
  }),
});

export const updateInterviewSchema = z.object({
  body: z.object({
    stage: z.string().min(1, 'Stage cannot be empty').optional(),
    date: z.string().optional(),
    time: z.string().optional().nullable(),
    interviewer: z.string().optional().nullable(),
    meetingLink: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    outcome: z.enum(['Passed', 'Failed', 'Pending']).optional().nullable(),
    applicationId: z.string().uuid('Invalid application ID').optional(),
  }),
});
