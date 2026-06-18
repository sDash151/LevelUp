import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { jobsService } from './jobs.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { status, type, page, limit } = req.query;
  const result = await jobsService.getJobs(req.user.id, { status, type }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});

export const getOne = asyncHandler(async (req, res) => {
  const job = await jobsService.getJob(req.user.id, req.params.id);
  success(res, { job });
});

export const create = asyncHandler(async (req, res) => {
  const job = await jobsService.createJob(req.user.id, req.body);
  created(res, { job });
});

export const update = asyncHandler(async (req, res) => {
  const job = await jobsService.updateJob(req.user.id, req.params.id, req.body);
  success(res, { job }, 'Job application updated');
});

export const remove = asyncHandler(async (req, res) => {
  await jobsService.deleteJob(req.user.id, req.params.id);
  success(res, null, 'Job application deleted');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await jobsService.getStats(req.user.id);
  success(res, { stats });
});

export const generateAIPrep = asyncHandler(async (req, res) => {
  const result = await jobsService.generateAIPrep(req.user.id, req.params.id);
  if (result.locked) return success(res, result, 'Generation locked');
  if (result.error) return success(res, result, result.message);
  success(res, result, 'AI prep generated');
});

export const startPreparation = asyncHandler(async (req, res) => {
  const result = await jobsService.startPreparation(req.user.id, req.params.id);
  success(res, result, result.already ? 'Already started' : 'Preparation started');
});
