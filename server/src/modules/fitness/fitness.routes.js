import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  logWorkoutSchema, smartParseSchema, logFoodSchema, logWaterSchema,
  logMetricSchema, logMeasurementSchema, profileSchema, milestoneSchema,
  uploadPhotoSchema,
} from './fitness.validation.js';
import * as controller from './fitness.controller.js';

const router = Router();

// ── Profile ──
router.get('/profile', controller.getProfile);
router.put('/profile', validate(profileSchema), controller.upsertProfile);

// ── Overview ──
router.get('/overview', controller.getOverview);
router.get('/overview/ai-insight', controller.getAIOverviewInsight);

// ── Plan ──
router.get('/plan', controller.getPlan);
router.get('/plan/memory', controller.getWorkoutMemory);
router.get('/plan/top-lifts', controller.getTopLiftsProgress);
router.get('/plan/insights', controller.getPlanInsights);
router.post('/plan/optimize', controller.optimizePlan);

// ── Workouts ──
router.get('/workouts/stats', controller.getWorkoutStats);
router.get('/workouts', controller.getWorkoutHistory);
router.post('/workouts', validate(logWorkoutSchema), controller.logWorkout);
router.post('/workouts/smart-parse', validate(smartParseSchema), controller.smartLogWorkout);
router.post('/workouts/smart-confirm', controller.confirmSmartLog);

// ── Nutrition ──
router.get('/nutrition', controller.getNutritionDashboard);
router.get('/nutrition/ai-insight', controller.getAINutritionInsight);
router.post('/nutrition/meals', validate(logFoodSchema), controller.logFood);
router.delete('/nutrition/meals/:id', controller.deleteMealLog);
router.post('/nutrition/meals/smart-parse', validate(smartParseSchema), controller.smartLogFood);
router.post('/nutrition/water', validate(logWaterSchema), controller.logWater);

// ── Progress ──
router.get('/progress', controller.getProgress);
router.post('/progress/metrics', validate(logMetricSchema), controller.logBodyMetric);
router.post('/progress/measurements', validate(logMeasurementSchema), controller.logMeasurement);
router.post('/progress/photos', validate(uploadPhotoSchema), controller.uploadPhoto);
router.get('/progress/ai-insight', controller.getAIProgressInsight);

// ── Milestones ──
router.get('/milestones', controller.getMilestones);
router.post('/milestones', validate(milestoneSchema), controller.createMilestone);
router.put('/milestones/:id/toggle', controller.toggleMilestone);
router.delete('/milestones/:id', controller.deleteMilestone);

export default router;
