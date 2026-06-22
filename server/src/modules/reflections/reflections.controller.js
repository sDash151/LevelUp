import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { reflectionsService } from './reflections.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { type, page, limit } = req.query;
  const result = await reflectionsService.getReflections(req.user.id, type, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});

export const getOne = asyncHandler(async (req, res) => {
  const reflection = await reflectionsService.getReflection(req.user.id, req.params.id);
  success(res, { reflection });
});

export const create = asyncHandler(async (req, res) => {
  const reflection = await reflectionsService.createReflection(req.user.id, req.body);
  created(res, { reflection });
});

export const update = asyncHandler(async (req, res) => {
  const reflection = await reflectionsService.updateReflection(req.user.id, req.params.id, req.body);
  success(res, { reflection }, 'Reflection updated');
});

export const remove = asyncHandler(async (req, res) => {
  await reflectionsService.deleteReflection(req.user.id, req.params.id);
  success(res, null, 'Reflection deleted');
});

export const getMoodHistory = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const history = await reflectionsService.getMoodHistory(req.user.id, days);
  success(res, { history });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await reflectionsService.getStats(req.user.id);
  success(res, stats);
});

// ==================== AI ENDPOINTS ====================

const aiInsightCache = new Map();

export const getAiInsight = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const force = req.query.force === 'true';

  // Check cache: Valid for 12 hours
  const cached = aiInsightCache.get(userId);
  if (!force && cached && (Date.now() - cached.timestamp < 12 * 60 * 60 * 1000)) {
    return success(res, { insight: cached.data }, 'AI Insight retrieved from cache');
  }

  const result = await reflectionsService.getReflections(userId, null, 1, 7); // Last 7 reflections
  const reflections = result.data;
  
  if (!reflections || reflections.length === 0) {
    return res.status(400).json({ success: false, error: 'Not enough data for AI insight' });
  }

  const { reflectionsAI } = await import('./reflections.ai.js');
  const insight = await reflectionsAI.generateInsight(reflections);

  if (!insight) {
    return res.status(500).json({ success: false, error: 'Failed to generate AI insight' });
  }

  // Save to cache
  aiInsightCache.set(userId, { data: insight, timestamp: Date.now() });

  success(res, { insight }, 'AI Insight generated successfully');
});
