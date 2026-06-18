import { insightsRepository } from './insights.repository.js';

class InsightsService {
  async getInsights(userId) { return insightsRepository.generateInsights(userId); }
}

export const insightsService = new InsightsService();
