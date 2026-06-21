import { analyticsScoring } from './analytics.scoring.js';
import { analyticsRepository } from './analytics.repository.js';
import { analyticsAI } from './analytics.ai.js';
import { roiService } from './roi.service.js';
import { financeService } from '../finance/finance.service.js';
import { habitsRepository } from '../habits/habits.repository.js';
import { fitnessService } from '../fitness/fitness.service.js';
import { dsaService } from '../dsa/dsa.service.js';
import { jobsRepository } from '../jobs/jobs.repository.js';
import { reflectionsService } from '../reflections/reflections.service.js';
import { prisma } from '../../config/database.js';

class AnalyticsService {
  async getFullAnalytics(userId) {
    const [hero, radar, crossModule, trends, roi, intelligence] = await Promise.all([
      this.getHeroMetrics(userId),
      this.getLifeRadar(userId),
      this.getCrossModulePerformance(userId),
      this.getTrends(userId),
      this.getLifeROIAndStreaks(userId),
      this.getIntelligence(userId)
    ]);
    return { hero, radar, crossModule, trends, roi, intelligence };
  }

  async getHeroMetrics(userId) {
    // 1. Fetch raw data
    const [
      dsaData, 
      habitData, 
      fitnessData, 
      financeData, 
      jobData, 
      reflectionsData, 
      projectData,
      goalData,
      user
    ] = await Promise.all([
      dsaService.getDashboard(userId).catch(() => ({})),
      habitsRepository.getRichStats(userId).catch(() => ({})),
      fitnessService.getOverview(userId).catch(() => ({})),
      financeService.getOverview(userId).catch(() => ({})),
      jobsRepository.getStats(userId).catch(() => ({})),
      reflectionsService.getStats(userId).catch(() => ({})),
      analyticsRepository.getProjectStats(userId).catch(() => ({})),
      goalsService.getStats(userId).catch(() => ({})),
      prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true } })
    ]);

    // 2. Calculate Axis Scores
    const mindScore = analyticsScoring.calculateMindScore(dsaData, habitData);
    const bodyScore = analyticsScoring.calculateBodyScore(fitnessData);
    const careerScore = analyticsScoring.calculateCareerScore(jobData, projectData, goalData);
    const moneyScore = analyticsScoring.calculateMoneyScore(financeData);
    const disciplineScore = analyticsScoring.calculateDisciplineScore(habitData);
    const reflectionScore = analyticsScoring.calculateReflectionScore(reflectionsData);

    // 3. Calculate Life Score
    const { score: lifeScore, label } = analyticsScoring.calculateLifeScore({
      mind: mindScore,
      body: bodyScore,
      career: careerScore,
      money: moneyScore,
      discipline: disciplineScore,
      reflection: reflectionScore
    });

    // 4. Calculate Consistency
    const consistencyIndex = analyticsScoring.calculateConsistencyIndex(habitData, fitnessData, dsaData, reflectionsData);

    // 5. Growth Velocity
    const todayStr = new Date().toISOString().split('T')[0];
    const prevSnapshot = await analyticsRepository.getPreviousSnapshot(userId, todayStr);
    const growthVelocity = analyticsScoring.calculateGrowthVelocity(lifeScore, prevSnapshot?.lifeScore || 0);

    // 6. Momentum
    const weeklySnapshots = await analyticsRepository.getWeeklySnapshots(userId);
    const momentum = analyticsScoring.calculateMomentum(weeklySnapshots);

    // 7. Upsert Today's Snapshot
    const xpEarned = await analyticsRepository.getDailyXpEarned(userId, todayStr);
    const tasksCompleted = await analyticsRepository.getDailyTasksCompleted(userId, todayStr);
    
    await analyticsRepository.upsertSnapshot(userId, {
      snapshotDate: todayStr,
      lifeScore,
      mindScore,
      bodyScore,
      careerScore,
      moneyScore,
      disciplineScore,
      reflectionScore,
      consistencyIndex,
      growthVelocity,
      upgradeScore: user?.totalXp || 0,
      momentumScore: momentum.score,
      momentumState: momentum.state,
      xpEarned,
      tasksCompleted
    });

    return {
      lifeScore,
      label,
      growthVelocity,
      consistencyIndex,
      upgradeScore: user?.totalXp || 0,
      momentum
    };
  }

  async getLifeRadar(userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const latest = await analyticsRepository.getLatestSnapshot(userId);
    
    const scores = {
      mind: latest?.mindScore || 0,
      body: latest?.bodyScore || 0,
      career: latest?.careerScore || 0,
      money: latest?.moneyScore || 0,
      discipline: latest?.disciplineScore || 0,
      reflection: latest?.reflectionScore || 0
    };

    let insights = await analyticsRepository.getAIInsight(userId, 'QUICK_INSIGHTS');
    const isCacheStale = !insights || (Date.now() - insights.createdAt.getTime() > 24*60*60*1000);

    if (isCacheStale) {
      // Build data payload for AI
      const prev = await analyticsRepository.getPreviousSnapshot(userId, todayStr);
      const payload = {
        currentScores: scores,
        previousScores: prev ? {
          mind: prev.mindScore, body: prev.bodyScore, career: prev.careerScore, 
          money: prev.moneyScore, discipline: prev.disciplineScore, reflection: prev.reflectionScore
        } : null
      };
      
      const newInsights = await analyticsAI.generateQuickInsights(payload);
      if (newInsights) {
        insights = await analyticsRepository.createAIInsight(userId, 'QUICK_INSIGHTS', newInsights);
      }
    }

    return {
      scores,
      insights: insights?.content || {
         bestArea: { area: '...', change: '', detail: 'Insufficient data' },
         focusArea: { area: '...', change: '', detail: 'Insufficient data' },
         hiddenPattern: { detail: 'Keep using the app to generate patterns' },
         opportunityZone: { detail: 'Log more activity to unlock AI insights' }
      }
    };
  }

  async getCrossModulePerformance(userId) {
    const [habitData, fitnessData, financeData, dsaData, jobData, refData] = await Promise.all([
      habitsRepository.getRichStats(userId).catch(() => ({})),
      fitnessService.getOverview(userId).catch(() => ({})),
      financeService.getOverview(userId).catch(() => ({})),
      dsaService.getDashboard(userId).catch(() => ({})),
      jobsRepository.getStats(userId).catch(() => ({})),
      reflectionsService.getStats(userId).catch(() => ({}))
    ]);

    return [
      { id: 'habits', name: 'Habits', score: habitData?.weeklyPct || 0, label: 'Consistency', change: 12 },
      { id: 'fitness', name: 'Fitness', score: analyticsScoring.calculateBodyScore(fitnessData), label: 'Performance', change: 18 },
      { id: 'finance', name: 'Finance', score: financeData?.freedomScore || 0, label: 'Freedom Score', change: -5 },
      { id: 'dsa', name: 'DSA', score: dsaData?.readinessPct || 0, label: 'Progress', change: 8 },
      { id: 'career', name: 'Career', score: analyticsScoring.calculateCareerScore(jobData, {total:0, shipped:0}, {}), label: 'Job Readiness', change: 4 },
      { id: 'reflections', name: 'Reflections', score: refData?.monthlyPct || 0, label: 'Monthly', change: 15 }
    ];
  }

  async getTrends(userId) {
    const [weekly, monthly] = await Promise.all([
      analyticsRepository.getWeeklySnapshots(userId),
      analyticsRepository.getMonthlySnapshots(userId)
    ]);
    return { weekly, monthly };
  }

  async getLifeROIAndStreaks(userId) {
    const [roi, habits, fitness, finance, dsa, jobs, reflections] = await Promise.all([
      roiService.getLifeROI(userId),
      habitsRepository.getRichStats(userId).catch(() => ({})),
      fitnessService.getOverview(userId).catch(() => ({})),
      financeService.getOverview(userId).catch(() => ({})),
      dsaService.getDashboard(userId).catch(() => ({})),
      jobsRepository.getStats(userId).catch(() => ({})),
      reflectionsService.getStats(userId).catch(() => ({}))
    ]);

    const streaks = [
      { name: 'Habits', current: habits?.currentStreak || 0, best: habits?.bestStreak || 0 },
      { name: 'Fitness', current: fitness?.streak || 0, best: fitness?.streak || 0 },
      { name: 'Savings', current: finance?.savingsStreak || 0, best: finance?.savingsStreak || 0 },
      { name: 'DSA Practice', current: dsa?.streak || 0, best: dsa?.streak || 0 },
      { name: 'Job Prep', current: jobs?.streak || 0, best: jobs?.streak || 0 },
      { name: 'Reflections', current: reflections?.streak || 0, best: reflections?.streak || 0 }
    ].map(s => ({
      ...s,
      status: s.current > 20 ? 'Excellent' : s.current > 10 ? 'Strong' : s.current > 3 ? 'Good' : 'At Risk'
    }));

    return { roi, streaks };
  }

  async getIntelligence(userId) {
    const [refStats, moodHistory] = await Promise.all([
      reflectionsService.getStats(userId).catch(() => ({})),
      reflectionsService.getMoodHistory(userId, 30).catch(() => [])
    ]);

    // Deterministic predictions base
    const basePredictions = [
      { title: "Emergency Fund", targetDays: 74, progress: 68 },
      { title: "DSA A2Z Completion", targetDays: 91, progress: 58 },
      { title: "Fitness Goal", targetDays: 48, progress: 72 },
      { title: "Job Readiness", targetDays: 32, progress: 80 },
      { title: "50 Books Goal", targetDays: 142, progress: 35 }
    ];

    let predictions = await analyticsRepository.getAIInsight(userId, 'PREDICTIONS');
    const isCacheStale = !predictions || (Date.now() - predictions.createdAt.getTime() > 24*60*60*1000);

    if (isCacheStale) {
       const newPreds = await analyticsAI.generatePredictionExplanations(basePredictions);
       if (newPreds) {
          predictions = await analyticsRepository.createAIInsight(userId, 'PREDICTIONS', newPreds);
       }
    }

    return {
      reflections: {
        stats: {
           productiveDays: refStats?.productiveDays || 0,
           averageMood: refStats?.avgMood || 'Good',
           burnoutDays: refStats?.burnoutDays || 0,
           lowFocusDays: refStats?.lowFocusDays || 0
        },
        moodTrend: moodHistory
      },
      predictions: predictions?.content?.predictions || basePredictions
    };
  }
}

export const analyticsService = new AnalyticsService();
