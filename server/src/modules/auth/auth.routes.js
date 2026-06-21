import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authLimiter } from '../../shared/middlewares/rateLimiter.middleware.js';
import * as controller from './auth.controller.js';
import { z } from 'zod';

const router = Router();

const onboardSchema = z.object({
  jobTitle: z.string().optional(),
  dreamRole: z.string().optional(),
  primaryFocus: z.string().optional(),
  targetIncome: z.number().optional(),
  baseCurrency: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  goal: z.string().optional(),
  experienceLevel: z.string().optional()
});

router.get('/github', authLimiter, controller.githubAuth);
router.get('/github/callback', controller.githubCallback);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getMe);
router.put('/onboard', authenticate, validate(onboardSchema), controller.onboardUser);

export default router;
