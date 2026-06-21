import express from 'express';
import { getFullAnalytics, getOverview, getHabitTrends, getWeeklyActivity } from './analytics.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/full', getFullAnalytics);
router.get('/overview', getOverview);
router.get('/habit-trends', getHabitTrends);
router.get('/weekly-activity', getWeeklyActivity);

export default router;
