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
