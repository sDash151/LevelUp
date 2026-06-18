import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { projectsService } from './projects.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await projectsService.list(req.user.id, { status }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});
export const getOne = asyncHandler(async (req, res) => { success(res, { project: await projectsService.get(req.user.id, req.params.id) }); });
export const create = asyncHandler(async (req, res) => { created(res, { project: await projectsService.create(req.user.id, req.body) }); });
export const update = asyncHandler(async (req, res) => { success(res, { project: await projectsService.update(req.user.id, req.params.id, req.body) }, 'Project updated'); });
export const remove = asyncHandler(async (req, res) => { await projectsService.delete(req.user.id, req.params.id); success(res, null, 'Project deleted'); });
export const getStats = asyncHandler(async (req, res) => { success(res, { stats: await projectsService.stats(req.user.id) }); });
