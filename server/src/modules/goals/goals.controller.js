import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { goalsService } from './goals.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const goals = await goalsService.getGoals(req.user.id, req.query.type);
  success(res, { goals });
});

export const getOne = asyncHandler(async (req, res) => {
  const goal = await goalsService.getGoal(req.user.id, req.params.id);
  success(res, { goal });
});

export const create = asyncHandler(async (req, res) => {
  const goal = await goalsService.createGoal(req.user.id, req.body);
  created(res, { goal });
});

export const update = asyncHandler(async (req, res) => {
  const goal = await goalsService.updateGoal(req.user.id, req.params.id, req.body);
  success(res, { goal }, 'Goal updated');
});

export const remove = asyncHandler(async (req, res) => {
  await goalsService.deleteGoal(req.user.id, req.params.id);
  success(res, null, 'Goal deleted');
});

export const toggleMilestone = asyncHandler(async (req, res) => {
  const milestone = await goalsService.toggleMilestone(req.user.id, req.params.id, req.params.milestoneId);
  success(res, { milestone }, milestone.isCompleted ? 'Milestone completed!' : 'Milestone unchecked');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await goalsService.getStats(req.user.id, req.query.type);
  success(res, { stats });
});

// ==================== AI ENDPOINTS ====================

const aiInsightCache = new Map();

export const getAiInsight = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const force = req.query.force === 'true';

  const cached = aiInsightCache.get(userId);
  if (!force && cached && (Date.now() - cached.timestamp < 12 * 60 * 60 * 1000)) {
    return success(res, { insight: cached.data }, 'AI Insight retrieved from cache');
  }

  const goals = await goalsService.getGoals(userId);
  
  if (!goals || goals.length === 0) {
    return res.status(400).json({ success: false, error: 'Not enough data for AI insight' });
  }

  const { goalsAI } = await import('./goals.ai.js');
  const insight = await goalsAI.generateInsight(goals);

  if (!insight) {
    return res.status(500).json({ success: false, error: 'Failed to generate AI insight' });
  }

  aiInsightCache.set(userId, { data: insight, timestamp: Date.now() });

  success(res, { insight }, 'AI Insight generated successfully');
});

export const generateMilestones = asyncHandler(async (req, res) => {
  const { title, description, category, type } = req.body;
  const { goalsAI } = await import('./goals.ai.js');
  
  const timeframe = type === 'WEEKLY' ? '1 week' : type === 'MONTHLY' ? '1 month' : type === 'YEARLY' ? '1 year' : '1 month';
  
  const details = await goalsAI.generateGoalDetails({
    title,
    description,
    category,
    timeframe
  });

  if (!details) {
    return res.status(500).json({ success: false, error: 'Failed to generate goal details' });
  }

  success(res, { details }, 'Goal details generated successfully');
});
