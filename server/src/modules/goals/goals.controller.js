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

