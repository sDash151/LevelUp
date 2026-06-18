import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive('Amount must be positive'),
    category: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    isRecurring: z.boolean().default(false),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    amount: z.number().positive().optional(),
    category: z.string().max(50).optional(),
    description: z.string().max(500).optional(),
    date: z.string().optional(),
    isRecurring: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
