import { analyticsService } from './analytics.service.js';
import { success } from '../../shared/utils/response.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getFullAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getFullAnalytics(req.user.id);
  success(res, data, 'Analytics retrieved successfully');
});

export const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getOverview(req.user.id);
  success(res, { overview });
});

export const getHabitTrends = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const trends = await analyticsService.getHabitTrends(req.user.id, days);
  success(res, { trends });
});

export const getWeeklyActivity = asyncHandler(async (req, res) => {
  const activity = await analyticsService.getWeeklyActivity(req.user.id);
  success(res, { activity });
});

export const getDetailedROIReport = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDetailedROIReport(req.user.id);
  success(res, data);
});
