import { z } from 'zod';

// ==================== PROJECT SCHEMAS ====================

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).optional(),
    status: z.enum(['IDEA', 'PLANNING', 'BUILDING', 'TESTING', 'SHIPPED', 'ARCHIVED']).default('IDEA'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    stack: z.array(z.string().max(50)).max(30).default([]),
    repoUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    githubRepoId: z.string().optional(),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(['IDEA', 'PLANNING', 'BUILDING', 'TESTING', 'SHIPPED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    stack: z.array(z.string().max(50)).max(30).optional(),
    repoUrl: z.string().url().optional().or(z.literal('')).nullable(),
    liveUrl: z.string().url().optional().or(z.literal('')).nullable(),
    githubRepoId: z.string().optional().nullable(),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional().nullable(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    status: z.enum(['IDEA', 'PLANNING', 'BUILDING', 'TESTING', 'SHIPPED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    search: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

// ==================== TASK SCHEMAS ====================

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(300),
    description: z.string().max(2000).optional(),
    status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    xpReward: z.coerce.number().int().min(0).max(1000).default(10),
    dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    xpReward: z.coerce.number().int().min(0).max(1000).optional(),
    dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional().nullable(),
  }),
  params: z.object({ taskId: z.string().min(1) }),
});

// ==================== LEARNING SCHEMAS ====================

export const createLearningSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(300),
    description: z.string().max(5000).optional(),
    type: z.enum(['learning', 'bug', 'architecture', 'pattern']).default('learning'),
    tags: z.array(z.string().max(50)).max(20).default([]),
    impactScore: z.coerce.number().int().min(1).max(10).default(5),
    source: z.enum(['manual', 'ai', 'github']).default('manual'),
  }),
  params: z.object({ id: z.string().min(1) }),
});

// ==================== PIPELINE SCHEMAS ====================

export const moveProjectSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    newStatus: z.enum(['IDEA', 'PLANNING', 'BUILDING', 'TESTING', 'SHIPPED', 'ARCHIVED']),
  }),
});

// ==================== AI / JOB SCHEMAS ====================

export const aiAnalyzeSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
  }),
});

export const jobSyncSchema = z.object({
  body: z.object({
    jobId: z.string().optional(),
  }),
});
