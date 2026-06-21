import cron from 'node-cron';
import { analyticsRepository } from './analytics.repository.js';
import { analyticsService } from './analytics.service.js';

export const initAnalyticsCron = () => {
  // Run every day at 00:05
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Starting daily Analytics Snapshots...');
    try {
      const userIds = await analyticsRepository.getActiveUserIds();
      
      let successCount = 0;
      for (const userId of userIds) {
        try {
          // This calculates today's metrics and saves to DB
          await analyticsService.getHeroMetrics(userId);
          successCount++;
        } catch (err) {
          console.error(`[CRON] Failed for user ${userId}:`, err.message);
        }
      }
      console.log(`[CRON] Snapshots completed: ${successCount}/${userIds.length}`);
    } catch (error) {
      console.error('[CRON] Analytics Snapshot Job failed:', error);
    }
  });
};
