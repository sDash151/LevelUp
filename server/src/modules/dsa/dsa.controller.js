import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { dsaService } from './dsa.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { topic, difficulty, status, platform, page, limit } = req.query;
  const result = await dsaService.getProblems(req.user.id, { topic, difficulty, status, platform }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});

export const getOne = asyncHandler(async (req, res) => {
  const problem = await dsaService.getProblem(req.user.id, req.params.id);
  success(res, { problem });
});

export const create = asyncHandler(async (req, res) => {
  const problem = await dsaService.createProblem(req.user.id, req.body);
  created(res, { problem });
});

export const update = asyncHandler(async (req, res) => {
  const problem = await dsaService.updateProblem(req.user.id, req.params.id, req.body);
  success(res, { problem }, 'Problem updated');
});

export const remove = asyncHandler(async (req, res) => {
  await dsaService.deleteProblem(req.user.id, req.params.id);
  success(res, null, 'Problem deleted');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dsaService.getStats(req.user.id);
  success(res, { stats });
});
