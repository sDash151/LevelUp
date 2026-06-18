import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { fitnessService } from './fitness.service.js';

export const getWorkouts = asyncHandler(async (req, res) => {
  const { type, page, limit } = req.query;
  const result = await fitnessService.listWorkouts(req.user.id, { type }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});
export const getWorkout = asyncHandler(async (req, res) => { success(res, { workout: await fitnessService.getWorkout(req.user.id, req.params.id) }); });
export const createWorkout = asyncHandler(async (req, res) => { created(res, { workout: await fitnessService.createWorkout(req.user.id, req.body) }); });
export const updateWorkout = asyncHandler(async (req, res) => { success(res, { workout: await fitnessService.updateWorkout(req.user.id, req.params.id, req.body) }, 'Workout updated'); });
export const deleteWorkout = asyncHandler(async (req, res) => { await fitnessService.deleteWorkout(req.user.id, req.params.id); success(res, null, 'Workout deleted'); });
export const logDaily = asyncHandler(async (req, res) => { success(res, { log: await fitnessService.logDaily(req.user.id, req.body) }); });
export const getLogHistory = asyncHandler(async (req, res) => { const days = parseInt(req.query.days) || 30; success(res, { history: await fitnessService.getLogHistory(req.user.id, days) }); });
export const getStats = asyncHandler(async (req, res) => { success(res, { stats: await fitnessService.stats(req.user.id) }); });
