import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created, paginated } from '../../shared/utils/response.js';
import { financeService } from './finance.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { type, category, page, limit } = req.query;
  const result = await financeService.list(req.user.id, { type, category }, page, limit);
  paginated(res, result.data, { page: result.page, limit: result.limit, total: result.total });
});
export const getOne = asyncHandler(async (req, res) => { success(res, { transaction: await financeService.get(req.user.id, req.params.id) }); });
export const create = asyncHandler(async (req, res) => { created(res, { transaction: await financeService.create(req.user.id, req.body) }); });
export const update = asyncHandler(async (req, res) => { success(res, { transaction: await financeService.update(req.user.id, req.params.id, req.body) }, 'Transaction updated'); });
export const remove = asyncHandler(async (req, res) => { await financeService.delete(req.user.id, req.params.id); success(res, null, 'Transaction deleted'); });
export const getSummary = asyncHandler(async (req, res) => { success(res, { summary: await financeService.summary(req.user.id) }); });
