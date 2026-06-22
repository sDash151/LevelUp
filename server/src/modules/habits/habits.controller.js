import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { habitsService } from './habits.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const habits = await habitsService.getHabits(req.user.id);
  success(res, { habits });
});

export const getOne = asyncHandler(async (req, res) => {
  const habit = await habitsService.getHabit(req.user.id, req.params.id);
  success(res, { habit });
});

export const create = asyncHandler(async (req, res) => {
  const habit = await habitsService.createHabit(req.user.id, req.body);
  created(res, { habit });
});

export const update = asyncHandler(async (req, res) => {
  const habit = await habitsService.updateHabit(req.user.id, req.params.id, req.body);
  success(res, { habit }, 'Habit updated');
});

export const remove = asyncHandler(async (req, res) => {
  await habitsService.deleteHabit(req.user.id, req.params.id);
  success(res, null, 'Habit deleted');
});

export const toggleComplete = asyncHandler(async (req, res) => {
  const result = await habitsService.toggleComplete(req.user.id, req.params.id, req.body.date);
  success(res, result, result.completed ? 'Habit completed!' : 'Completion removed');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await habitsService.getStats(req.user.id);
  success(res, { stats });
});

export const getRichStats = asyncHandler(async (req, res) => {
  const stats = await habitsService.getRichStats(req.user.id);
  success(res, stats);
});

export const getCalendarStats = asyncHandler(async (req, res) => {
  const now  = new Date();
  const year  = req.query.year  || now.getFullYear();
  const month = req.query.month || now.getMonth() + 1;
  const selectedDate = req.query.selectedDate || now.toISOString().split('T')[0];
  const stats = await habitsService.getCalendarStats(req.user.id, year, month, selectedDate);
  success(res, stats);
});

// ==================== AI ENDPOINTS ====================

const aiInsightCache = new Map();

export const getAiInsight = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const force = req.query.force === 'true';

  // Check cache: Valid for 12 hours to save API calls
  const cached = aiInsightCache.get(userId);
  if (!force && cached && (Date.now() - cached.timestamp < 12 * 60 * 60 * 1000)) {
    return success(res, { insight: cached.data }, 'AI Insight retrieved from cache');
  }

  const habits = await habitsService.getHabits(userId);
  
  if (!habits || habits.length === 0) {
    return res.status(400).json({ success: false, error: 'Not enough data for AI insight' });
  }

  const { habitsAI } = await import('./habits.ai.js');
  const insight = await habitsAI.generateInsight(habits);

  if (!insight) {
    return res.status(500).json({ success: false, error: 'Failed to generate AI insight' });
  }

  // Save to cache
  aiInsightCache.set(userId, { data: insight, timestamp: Date.now() });

  success(res, { insight }, 'AI Insight generated successfully');
});
