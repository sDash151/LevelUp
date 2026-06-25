import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { fitnessService } from './fitness.service.js';

// ── Profile ──
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await fitnessService.getProfile(req.user.id);
  success(res, { profile });
});

export const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await fitnessService.upsertProfile(req.user.id, req.body);
  success(res, { profile }, 'Profile updated');
});

// ── Overview ──
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await fitnessService.getOverview(req.user.id);
  success(res, overview);
});

export const getAIOverviewInsight = asyncHandler(async (req, res) => {
  const insight = await fitnessService.getAIOverviewInsight(req.user.id);
  success(res, { insight });
});

// ── Plan & Catalog ──

export const getExerciseCatalog = asyncHandler(async (req, res) => {
  const catalog = await fitnessService.getExerciseCatalog();
  success(res, catalog);
});

export const getExerciseSwaps = asyncHandler(async (req, res) => {
  const { muscles, equipment, exclude } = req.query;
  const swaps = await fitnessService.getExerciseSwaps({ userId: req.user.id, muscles, equipment, exclude });
  success(res, swaps);
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await fitnessService.getPlan(req.user.id);
  success(res, plan);
});

export const getWorkoutMemory = asyncHandler(async (req, res) => {
  const data = await fitnessService.getWorkoutMemory(req.user.id);
  success(res, data);
});

export const getTopLiftsProgress = asyncHandler(async (req, res) => {
  const lifts = await fitnessService.getTopLiftsProgress(req.user.id);
  success(res, { lifts });
});

export const getPlanInsights = asyncHandler(async (req, res) => {
  const insights = await fitnessService.getPlanInsights(req.user.id);
  success(res, { insights });
});

export const optimizePlan = asyncHandler(async (req, res) => {
  const plan = await fitnessService.optimizePlan(req.user.id);
  if (!plan) return success(res, null, 'AI service unavailable. Plan not generated.');
  created(res, { plan }, 'Plan optimized');
});

// ── Workouts ──
export const getWorkoutStats = asyncHandler(async (req, res) => {
  const stats = await fitnessService.getWorkoutStats(req.user.id);
  success(res, { stats });
});

export const getWorkoutHistory = asyncHandler(async (req, res) => {
  const { search, type, muscleGroup, startDate, endDate, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const result = await fitnessService.getWorkoutHistory(req.user.id, {
    search, type, muscleGroup, startDate, endDate, skip, take: parseInt(limit),
  });
  success(res, result);
});

export const logWorkout = asyncHandler(async (req, res) => {
  const session = await fitnessService.logWorkout(req.user.id, req.body);
  created(res, { session }, 'Workout logged!');
});

export const smartLogWorkout = asyncHandler(async (req, res) => {
  const parsed = await fitnessService.smartLogWorkout(req.user.id, req.body.text);
  if (!parsed) return success(res, null, 'AI service unavailable');
  success(res, { parsed });
});

export const confirmSmartLog = asyncHandler(async (req, res) => {
  const session = await fitnessService.confirmSmartLog(req.user.id, req.body);
  created(res, { session }, 'Workout logged!');
});

// ── Nutrition ──
export const getNutritionDashboard = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const dashboard = await fitnessService.getNutritionDashboard(req.user.id, date);
  success(res, dashboard);
});

export const getAINutritionInsight = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const insight = await fitnessService.getAINutritionInsight(req.user.id, date);
  success(res, { insight });
});

export const logFood = asyncHandler(async (req, res) => {
  const meal = await fitnessService.logFood(req.user.id, req.body);
  created(res, { meal }, 'Food logged!');
});

export const deleteMealLog = asyncHandler(async (req, res) => {
  await fitnessService.deleteMealLog(req.user.id, req.params.id);
  success(res, null, 'Meal deleted successfully');
});

export const updateWorkout = asyncHandler(async (req, res) => {
  const session = await fitnessService.updateWorkout(req.user.id, req.params.id, req.body);
  success(res, { session }, 'Workout updated!');
});

export const deleteWorkout = asyncHandler(async (req, res) => {
  await fitnessService.deleteWorkout(req.user.id, req.params.id);
  success(res, null, 'Workout deleted successfully');
});

export const updateMealLog = asyncHandler(async (req, res) => {
  const meal = await fitnessService.updateMealLog(req.user.id, req.params.id, req.body);
  success(res, { meal }, 'Meal updated!');
});

export const smartLogFood = asyncHandler(async (req, res) => {
  const parsed = await fitnessService.smartLogFood(req.user.id, req.body.text);
  if (!parsed) return success(res, null, 'AI service unavailable');
  success(res, { parsed });
});

export const logWater = asyncHandler(async (req, res) => {
  const entry = await fitnessService.logWater(req.user.id, req.body.amount, req.body.date);
  created(res, { entry }, 'Water logged!');
});

// ── Progress ──
export const getProgress = asyncHandler(async (req, res) => {
  const { range = '3M' } = req.query;
  const progress = await fitnessService.getProgress(req.user.id, range);
  success(res, progress);
});

export const logBodyMetric = asyncHandler(async (req, res) => {
  const metric = await fitnessService.logBodyMetric(req.user.id, req.body);
  created(res, { metric }, 'Body metric logged!');
});

export const logMeasurement = asyncHandler(async (req, res) => {
  const measurement = await fitnessService.logMeasurement(req.user.id, req.body);
  created(res, { measurement }, 'Measurement logged!');
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  const photo = await fitnessService.uploadPhoto(req.user.id, req.body);
  created(res, { photo }, 'Photo uploaded!');
});

export const getAIProgressInsight = asyncHandler(async (req, res) => {
  const insight = await fitnessService.getAIProgressInsight(req.user.id);
  success(res, { insight });
});

// ── Milestones ──
export const getMilestones = asyncHandler(async (req, res) => {
  const milestones = await fitnessService.getMilestones(req.user.id);
  success(res, { milestones });
});

export const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await fitnessService.createMilestone(req.user.id, req.body);
  created(res, { milestone }, 'Milestone created!');
});

export const toggleMilestone = asyncHandler(async (req, res) => {
  const milestone = await fitnessService.toggleMilestone(req.params.id, req.body.isAchieved);
  success(res, { milestone }, 'Milestone updated');
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  await fitnessService.deleteMilestone(req.params.id);
  success(res, null, 'Milestone deleted');
});

// ══════════════════════════════════════════════════════════════
// AI MASTER PLANNER CONTROLLERS
// ══════════════════════════════════════════════════════════════

import { plannerService } from './planner.service.js';

export const generateWorkoutPlan = asyncHandler(async (req, res) => {
  const result = await plannerService.generateWorkoutPlan(req.user.id, req.body);
  created(res, result, 'Workout plan generated');
});

export const generateDietPlan = asyncHandler(async (req, res) => {
  const result = await plannerService.generateDietPlan(req.user.id, req.body);
  created(res, result, 'Diet plan generated');
});

export const generateRecoveryPlan = asyncHandler(async (req, res) => {
  const result = await plannerService.generateRecoveryPlan(req.user.id, req.body);
  created(res, result, 'Recovery plan generated');
});

export const generateTransformationPlan = asyncHandler(async (req, res) => {
  const result = await plannerService.generateTransformationPlan(req.user.id, req.body);
  created(res, result, 'Transformation plan generated');
});

export const parseCoachMessage = asyncHandler(async (req, res) => {
  const result = await plannerService.parseCoachMessage(req.user.id, req.body.text, req.body.currentConstraints);
  success(res, result);
});

export const generateFromChat = asyncHandler(async (req, res) => {
  const result = await plannerService.generateFromChat(req.user.id, req.body);
  created(res, result, 'Plan generated from coach chat');
});

export const swapMeal = asyncHandler(async (req, res) => {
  const { planId, day, mealType } = req.body;
  const result = await plannerService.swapMeal(req.user.id, planId, day, mealType);
  success(res, result, 'Meal swapped');
});

export const swapExercise = asyncHandler(async (req, res) => {
  const { planId, day, exerciseIndex, targetExerciseName, reason } = req.body;
  const result = await plannerService.swapExercise(req.user.id, planId, day, exerciseIndex, targetExerciseName, reason);
  success(res, result, 'Exercise swapped');
});

export const getAdherenceScore = asyncHandler(async (req, res) => {
  const result = await plannerService.getAdherenceScore(req.user.id);
  success(res, result);
});

export const getAdaptiveReview = asyncHandler(async (req, res) => {
  const result = await plannerService.getAdaptiveReview(req.user.id);
  success(res, result);
});

export const getActivePlans = asyncHandler(async (req, res) => {
  const result = await plannerService.getActivePlans(req.user.id);
  success(res, result);
});

export const getPlanHistory = asyncHandler(async (req, res) => {
  const result = await plannerService.getPlanHistory(req.user.id);
  success(res, result);
});

