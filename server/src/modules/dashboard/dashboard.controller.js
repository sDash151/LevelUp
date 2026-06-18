import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success } from '../../shared/utils/response.js';
import { dashboardService } from './dashboard.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user.id);
  success(res, summary);
});
