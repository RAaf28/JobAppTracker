import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required'),
    industry: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name cannot be empty').optional(),
    industry: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});
