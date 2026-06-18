import { analyticsRepository } from './analytics.repository.js';

class AnalyticsService {
  async getOverview(userId) { return analyticsRepository.getOverview(userId); }
  async getHabitTrends(userId, days) { return analyticsRepository.getHabitTrends(userId, days); }
  async getWeeklyActivity(userId) { return analyticsRepository.getWeeklyActivity(userId); }
}

export const analyticsService = new AnalyticsService();
