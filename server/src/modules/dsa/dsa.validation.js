import { z } from 'zod';

export const createDsaProblemSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    platform: z.string().min(1).max(50),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    topic: z.string().min(1).max(50),
    url: z.string().url('Invalid URL').optional().or(z.literal('')),
    notes: z.string().max(2000).optional(),
    status: z.enum(['SOLVED', 'ATTEMPTED', 'REVISIT', 'TODO']).default('TODO'),
    timeSpent: z.number().int().min(0).optional(),
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

export const updateDsaProblemSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    platform: z.string().max(50).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    topic: z.string().max(50).optional(),
    url: z.string().url().optional().or(z.literal('')),
    notes: z.string().max(2000).optional(),
    status: z.enum(['SOLVED', 'ATTEMPTED', 'REVISIT', 'TODO']).optional(),
    timeSpent: z.number().int().min(0).optional(),
    rating: z.number().int().min(1).max(5).optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listDsaProblemsSchema = z.object({
  query: z.object({
    topic: z.string().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    status: z.enum(['SOLVED', 'ATTEMPTED', 'REVISIT', 'TODO']).optional(),
    platform: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
