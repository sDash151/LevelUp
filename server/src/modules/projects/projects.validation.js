import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(2000).optional(),
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).default('PLANNING'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    techStack: z.array(z.string().max(50)).max(20).default([]),
    githubUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    techStack: z.array(z.string().max(50)).max(20).optional(),
    githubUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
