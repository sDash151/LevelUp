import express from 'express';
import { getFullAnalytics, getOverview, getHabitTrends, getWeeklyActivity, getDetailedROIReport } from './analytics.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/full', getFullAnalytics);
router.get('/overview', getOverview);
router.get('/habit-trends', getHabitTrends);
router.get('/weekly-activity', getWeeklyActivity);
router.get('/roi-report', getDetailedROIReport);

export default router;
