import { z } from 'zod';

export const createHabitSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color hex').optional(),
    category: z.string().max(50).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    reminderTime: z.string().max(10).optional(),
  }),
});

export const updateHabitSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    category: z.string().max(50).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    reminderTime: z.string().max(10).optional().nullable(),
    isArchived: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const toggleCompleteSchema = z.object({
  body: z.object({
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  }),
  params: z.object({ id: z.string().min(1) }),
});
