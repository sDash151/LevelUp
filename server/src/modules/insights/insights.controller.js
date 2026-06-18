import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success } from '../../shared/utils/response.js';
import { insightsService } from './insights.service.js';

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await insightsService.getInsights(req.user.id);
  success(res, { insights });
});
