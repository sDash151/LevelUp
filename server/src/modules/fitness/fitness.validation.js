import { z } from 'zod';

export const createWorkoutSchema = z.object({
  body: z.object({
    type: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'HIIT', 'OTHER']),
    name: z.string().min(1, 'Name is required').max(200),
    duration: z.number().int().min(1, 'Duration is required').max(600),
    caloriesBurned: z.number().int().min(0).optional(),
    notes: z.string().max(1000).optional(),
    exercises: z.array(z.object({
      name: z.string().min(1).max(100),
      sets: z.number().int().min(1).optional(),
      reps: z.number().int().min(1).optional(),
      weight: z.number().min(0).optional(),
      duration: z.number().int().min(0).optional(),
    })).default([]),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  }),
});

export const updateWorkoutSchema = z.object({
  body: z.object({
    type: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'HIIT', 'OTHER']).optional(),
    name: z.string().min(1).max(200).optional(),
    duration: z.number().int().min(1).max(600).optional(),
    caloriesBurned: z.number().int().min(0).optional(),
    notes: z.string().max(1000).optional(),
    exercises: z.array(z.object({
      name: z.string().min(1).max(100),
      sets: z.number().int().min(1).optional(),
      reps: z.number().int().min(1).optional(),
      weight: z.number().min(0).optional(),
      duration: z.number().int().min(0).optional(),
    })).optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const logFitnessSchema = z.object({
  body: z.object({
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    weight: z.number().positive().optional(),
    steps: z.number().int().min(0).optional(),
    water: z.number().min(0).optional(),
    sleep: z.number().min(0).max(24).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listWorkoutsSchema = z.object({
  query: z.object({
    type: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORTS', 'YOGA', 'HIIT', 'OTHER']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
