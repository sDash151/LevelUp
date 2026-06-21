import { z } from 'zod';

// ═══════════════════════════════════════════════════
// TRANSACTION
// ═══════════════════════════════════════════════════

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    amount: z.number().positive('Amount must be positive'),
    category: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    merchant: z.string().max(100).optional(),
    paymentMethod: z.string().max(50).optional(),
    necessityLevel: z.enum(['ESSENTIAL', 'COMFORTABLE', 'LUXURY', 'WASTEFUL']).optional(),
    mood: z.enum(['NECESSARY', 'HAPPY', 'REGRET', 'NEUTRAL']).optional(),
    tags: z.array(z.string()).optional(),
    note: z.string().max(1000).optional(),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    accountId: z.string().optional(),
    isRecurring: z.boolean().optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
    amount: z.number().positive().optional(),
    category: z.string().min(1).max(50).optional(),
    description: z.string().max(500).optional(),
    merchant: z.string().max(100).optional(),
    paymentMethod: z.string().max(50).optional(),
    necessityLevel: z.enum(['ESSENTIAL', 'COMFORTABLE', 'LUXURY', 'WASTEFUL']).optional(),
    mood: z.enum(['NECESSARY', 'HAPPY', 'REGRET', 'NEUTRAL']).optional(),
    tags: z.array(z.string()).optional(),
    note: z.string().max(1000).optional(),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    accountId: z.string().optional(),
  }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
    category: z.string().optional(),
    merchant: z.string().optional(),
    paymentMethod: z.string().optional(),
    mood: z.enum(['NECESSARY', 'HAPPY', 'REGRET', 'NEUTRAL']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['latest', 'oldest', 'highest', 'lowest']).optional(),
  }),
});

export const aiLogTransactionSchema = z.object({
  body: z.object({
    text: z.string().min(3).max(500, 'Text too long'),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({ id: z.string() }),
});

// ═══════════════════════════════════════════════════
// FINANCE ACCOUNT
// ═══════════════════════════════════════════════════

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['cash', 'savings', 'investment', 'debt']),
    balance: z.number().default(0),
    institution: z.string().max(100).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
    includeInNetWorth: z.boolean().optional(),
  }),
});

export const updateAccountSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['cash', 'savings', 'investment', 'debt']).optional(),
    balance: z.number().optional(),
    institution: z.string().max(100).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
    includeInNetWorth: z.boolean().optional(),
  }),
});

// ═══════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    monthlyLimit: z.number().positive(),
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    monthlyLimit: z.number().positive().optional(),
  }),
});

// ═══════════════════════════════════════════════════
// FINANCE GOAL
// ═══════════════════════════════════════════════════

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    goalType: z.enum(['EMERGENCY', 'ASSET', 'TRAVEL', 'EDUCATION', 'INVESTMENT', 'OPPORTUNITY', 'CUSTOM']).optional(),
    targetAmount: z.number().positive(),
    currentAmount: z.number().min(0).optional(),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    goalType: z.enum(['EMERGENCY', 'ASSET', 'TRAVEL', 'EDUCATION', 'INVESTMENT', 'OPPORTUNITY', 'CUSTOM']).optional(),
    targetAmount: z.number().positive().optional(),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  }),
});

export const contributeGoalSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    amount: z.number().positive(),
  }),
});

// ═══════════════════════════════════════════════════
// SUBSCRIPTION
// ═══════════════════════════════════════════════════

export const createSubscriptionSchema = z.object({
  body: z.object({
    merchant: z.string().min(1).max(100),
    amount: z.number().positive(),
    cycle: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
    nextRenewal: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
    category: z.string().max(50).optional(),
  }),
});

// ═══════════════════════════════════════════════════
// DEBT
// ═══════════════════════════════════════════════════

export const createDebtSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    type: z.enum(['loan', 'credit_card', 'emi']),
    totalAmount: z.number().positive(),
    paidAmount: z.number().min(0).optional(),
    monthlyEmi: z.number().min(0).optional(),
    interestRate: z.number().min(0).max(100).optional(),
    dueDay: z.number().int().min(1).max(31).optional(),
  }),
});

export const updateDebtSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    paidAmount: z.number().min(0).optional(),
    monthlyEmi: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'PAID_OFF', 'DEFAULTED']).optional(),
  }),
});

// ═══════════════════════════════════════════════════
// BILL
// ═══════════════════════════════════════════════════

export const createBillSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    amount: z.number().positive(),
    dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    category: z.string().max(50).optional(),
    isRecurring: z.boolean().optional(),
    cycle: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  }),
});

export const payBillSchema = z.object({
  params: z.object({ id: z.string() }),
});

// ═══════════════════════════════════════════════════
// INSURANCE
// ═══════════════════════════════════════════════════

export const createInsuranceSchema = z.object({
  body: z.object({
    type: z.enum(['health', 'term', 'vehicle', 'accident']),
    provider: z.string().min(1).max(100),
    policyNumber: z.string().max(100).optional(),
    premium: z.number().positive(),
    cycle: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
    expiryDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  }),
});

// ═══════════════════════════════════════════════════
// REFLECTION
// ═══════════════════════════════════════════════════

export const createReflectionSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
    whatWentWell: z.string().max(2000).optional(),
    unnecessarySpending: z.string().max(2000).optional(),
    improvementPlan: z.string().max(2000).optional(),
  }),
});

// ═══════════════════════════════════════════════════
// CATEGORY
// ═══════════════════════════════════════════════════

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    icon: z.string().max(50).optional(),
    color: z.string().max(20).optional(),
    type: z.enum(['income', 'expense']),
  }),
});

// ═══════════════════════════════════════════════════
// GENERIC PARAM SCHEMAS
// ═══════════════════════════════════════════════════

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const monthQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
  }),
});
