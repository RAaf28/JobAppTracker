import { z } from 'zod';

export const createResumeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Resume name is required'),
    version: z.string().min(1, 'Version is required'),
    fileUrl: z.string().optional().nullable(),
  }),
});

export const updateResumeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Resume name cannot be empty').optional(),
    version: z.string().min(1, 'Version cannot be empty').optional(),
    fileUrl: z.string().optional().nullable(),
  }),
});
