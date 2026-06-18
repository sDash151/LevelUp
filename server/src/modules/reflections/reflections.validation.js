import { z } from 'zod';

export const createReflectionSchema = z.object({
  body: z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    title: z.string().max(200).optional(),
    content: z.string().min(1, 'Content is required').max(5000),
    mood: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    gratitude: z.string().max(1000).optional(),
    improvements: z.string().max(1000).optional(),
  }),
});

export const updateReflectionSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional(),
    content: z.string().min(1).max(5000).optional(),
    mood: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    gratitude: z.string().max(1000).optional(),
    improvements: z.string().max(1000).optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listReflectionsSchema = z.object({
  query: z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
