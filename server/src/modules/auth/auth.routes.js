import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authLimiter } from '../../shared/middlewares/rateLimiter.middleware.js';
import * as controller from './auth.controller.js';
import { z } from 'zod';

const router = Router();

const onboardSchema = z.object({
  body: z.object({
    // Step 1: Career & Finance
    primaryFocus: z.string().optional(),
    jobTitle: z.string().optional(),
    currentSalary: z.number().optional(),
    dreamRole: z.string().optional(),
    targetIncome: z.number().optional(),
    baseCurrency: z.string().optional(),
    
    // Step 2: Localization
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    phoneNumber: z.string().optional(),
    timezone: z.string().optional(),
    mantra: z.string().optional(),
    
    // Step 3: Physical
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    goal: z.string().optional(),
    experienceLevel: z.string().optional(),

    // Step 4: Persona
    leetcodeUrl: z.string().optional(),
    linkedinUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),

    onboardingStep: z.number().optional(),
  })
});

router.get('/github', authLimiter, controller.githubAuth);
router.get('/github/callback', controller.githubCallback);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getMe);
router.put('/onboard', authenticate, validate(onboardSchema), controller.onboardUser);

export default router;
