import { Router } from 'express';
import { authenticate } from '../shared/middlewares/auth.middleware.js';
import authRoutes from '../modules/auth/auth.routes.js';
import habitsRoutes from '../modules/habits/habits.routes.js';
import goalsRoutes from '../modules/goals/goals.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import reflectionsRoutes from '../modules/reflections/reflections.routes.js';
import dsaRoutes from '../modules/dsa/dsa.routes.js';
import jobsRoutes from '../modules/jobs/jobs.routes.js';
import projectsRoutes from '../modules/projects/projects.routes.js';
import financeRoutes from '../modules/finance/finance.routes.js';
import fitnessRoutes from '../modules/fitness/fitness.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import insightsRoutes from '../modules/insights/insights.routes.js';
import focusRoutes from '../modules/focus/focus.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'LevelUp API is running', timestamp: new Date().toISOString() });
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/habits', authenticate, habitsRoutes);
router.use('/goals', authenticate, goalsRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/reflections', authenticate, reflectionsRoutes);
router.use('/dsa', authenticate, dsaRoutes);
router.use('/jobs', authenticate, jobsRoutes);
router.use('/projects', authenticate, projectsRoutes);
router.use('/finance', authenticate, financeRoutes);
router.use('/fitness', authenticate, fitnessRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/insights', authenticate, insightsRoutes);
router.use('/focus', authenticate, focusRoutes);

export default router;


