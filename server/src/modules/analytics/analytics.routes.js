import { Router } from 'express';
import * as c from './analytics.controller.js';

const router = Router();
router.get('/overview', c.getOverview);
router.get('/habit-trends', c.getHabitTrends);
router.get('/weekly-activity', c.getWeeklyActivity);

export default router;
