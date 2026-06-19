import { z } from 'zod';

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'SOLVED', 'REVISING']),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const updateNotesSchema = z.object({
  body: z.object({
    notes: z.string().max(5000),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const reviseSchema = z.object({
  body: z.object({
    performance: z.enum(['good', 'ok', 'bad']),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const activePathSchema = z.object({
  body: z.object({
    pathSlug: z.string().min(1),
  }),
});

export const listProblemsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(1000).optional().default(20),
    topic: z.string().optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Unknown']).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'SOLVED', 'REVISING']).optional(),
    search: z.string().optional(),
  }).optional(),
  params: z.object({ slug: z.string().min(1) }),
});
