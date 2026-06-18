import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authLimiter } from '../../shared/middlewares/rateLimiter.middleware.js';
import { signupSchema, loginSchema, forgotPasswordSchema } from './auth.validation.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), controller.signup);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.get('/me', authenticate, controller.getMe);

export default router;
