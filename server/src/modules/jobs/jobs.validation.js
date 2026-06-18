import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company is required').max(200),
    role: z.string().min(1, 'Role is required').max(200),
    location: z.string().max(200).optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).default('FULL_TIME'),
    status: z.enum(['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).default('SAVED'),
    url: z.string().url('Invalid URL').optional().or(z.literal('')),
    salary: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
    appliedDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
    contactName: z.string().max(100).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    // New tracker fields
    source: z.string().max(100).optional(),
    requiredSkills: z.array(z.string().max(50)).max(20).optional(),
    experience: z.string().max(100).optional(),
    workMode: z.enum(['On-site', 'Remote', 'Hybrid']).optional(),
    description: z.string().max(5000).optional(),
    companyInfo: z.string().max(2000).optional(),
    interviewRounds: z.any().optional(),
    matchScore: z.number().int().min(0).max(100).optional(),
    recruiterNotes: z.string().max(5000).optional(),
    interviewNotes: z.string().max(5000).optional(),
    companyResearch: z.string().max(5000).optional(),
    personalNotes: z.string().max(5000).optional(),
    checklist: z.any().optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(200).optional(),
    role: z.string().min(1).max(200).optional(),
    location: z.string().max(200).optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
    status: z.enum(['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
    url: z.string().url().optional().or(z.literal('')),
    salary: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
    appliedDate: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    contactName: z.string().max(100).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    // New tracker fields
    source: z.string().max(100).optional(),
    requiredSkills: z.array(z.string().max(50)).max(20).optional(),
    experience: z.string().max(100).optional(),
    workMode: z.enum(['On-site', 'Remote', 'Hybrid']).optional(),
    description: z.string().max(5000).optional(),
    companyInfo: z.string().max(2000).optional(),
    interviewRounds: z.any().optional(),
    matchScore: z.number().int().min(0).max(100).optional(),
    recruiterNotes: z.string().max(5000).optional(),
    interviewNotes: z.string().max(5000).optional(),
    companyResearch: z.string().max(5000).optional(),
    personalNotes: z.string().max(5000).optional(),
    checklist: z.any().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listJobsSchema = z.object({
  query: z.object({
    status: z.enum(['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']).optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});
