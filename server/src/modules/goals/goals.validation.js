import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    type: z.enum(['WEEKLY', 'MONTHLY']),
    category: z.enum(['HEALTH', 'FITNESS', 'LEARNING', 'CAREER', 'PERSONAL']).optional(),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
    milestones: z.array(z.object({ title: z.string().min(1).max(200) })).optional(),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
    category: z.enum(['HEALTH', 'FITNESS', 'LEARNING', 'CAREER', 'PERSONAL']).optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});
