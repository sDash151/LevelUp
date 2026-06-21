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
import { goalsService } from '../goals/goals.service.js';
import { prisma } from '../../config/database.js';

class AnalyticsService {
  async getFullAnalytics(userId) {
    // 1. Calculate and Upsert the latest snapshot first
    const hero = await this.getHeroMetrics(userId);

    // 2. Safely fetch everything else concurrently now that the DB is up to date
    const [radar, crossModule, trends, roi, intelligence] = await Promise.all([
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
      
      const changes = prev ? {
        mind: Math.round(scores.mind - prev.mindScore),
        body: Math.round(scores.body - prev.bodyScore),
        career: Math.round(scores.career - prev.careerScore),
        money: Math.round(scores.money - prev.moneyScore),
        discipline: Math.round(scores.discipline - prev.disciplineScore),
        reflection: Math.round(scores.reflection - prev.reflectionScore)
      } : {};

      const payload = {
        scores,
        changes
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
      { id: 'finance', name: 'Finance', score: financeData?.kpis?.freedomScore?.score || 0, label: 'Freedom Score', change: -5 },
      { id: 'dsa', name: 'DSA', score: dsaData?.readinessPct || 0, label: 'Progress', change: 8 },
      { id: 'career', name: 'Career', score: analyticsScoring.calculateCareerScore(jobData, {total:0, shipped:0}, {}), label: 'Job Readiness', change: 4 },
      { id: 'reflections', name: 'Reflections', score: refData?.growthScore || 0, label: 'Monthly Growth', change: 15 }
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
      { name: 'Fitness', current: fitness?.streak?.current || 0, best: fitness?.streak?.best || 0 },
      { name: 'Savings', current: finance?.savingsStreak?.current || 0, best: finance?.savingsStreak?.best || 0 },
      { name: 'DSA Practice', current: dsa?.streak || 0, best: dsa?.bestStreak || 0 },
      { name: 'Job Prep', current: jobs?.streak || 0, best: jobs?.bestStreak || 0 },
      { name: 'Reflections', current: reflections?.streak || 0, best: reflections?.bestStreak || 0 }
    ].map(s => ({
      ...s,
      status: s.current > 20 ? 'Excellent' : s.current > 10 ? 'Strong' : s.current > 3 ? 'Good' : 'At Risk'
    }));

    return { roi, streaks };
  }

  async getDetailedROIReport(userId) {
    let reportInsight = await analyticsRepository.getAIInsight(userId, 'ROI_REPORT');
    const isCacheStale = !reportInsight || (Date.now() - reportInsight.createdAt.getTime() > 24 * 60 * 60 * 1000);

    if (isCacheStale || !reportInsight.content) {
      // Fetch raw ROI metrics
      const { roi } = await this.getLifeROIAndStreaks(userId);
      
      // Generate new AI report
      const newReportText = await analyticsAI.generateDetailedROIReport(roi);
      
      if (newReportText) {
        // Cache it
        reportInsight = await analyticsRepository.createAIInsight(userId, 'ROI_REPORT', { markdown: newReportText });
      }
    }

    return {
      report: reportInsight?.content?.markdown || "Could not generate ROI report at this time. Please try again later."
    };
  }

  async getIntelligence(userId) {
    const [refStats, moodHistory] = await Promise.all([
      reflectionsService.getStats(userId).catch(() => ({})),
      reflectionsService.getMoodHistory(userId, 30).catch(() => [])
    ]);

    // 1. Finance Prediction (Emergency Fund)
    const savings = await prisma.transaction.aggregate({
      where: { userId, type: 'TRANSFER', OR: [{ category: { contains: 'Savings', mode: 'insensitive' } }, { category: { contains: 'Investment', mode: 'insensitive' } }] },
      _sum: { amount: true }
    });
    const totalSaved = parseFloat(savings._sum.amount || 0);
    const financeTarget = 10000;
    const financeProgress = Math.min(Math.round((totalSaved / financeTarget) * 100), 100);
    const financeDays = financeProgress >= 100 ? 0 : Math.round(((financeTarget - totalSaved) / 500) * 30);

    // 2. DSA Prediction
    const dsaSolved = await prisma.dsaUserProgress.count({ where: { userId, status: 'SOLVED' } });
    const dsaTarget = 450;
    const dsaProgress = Math.min(Math.round((dsaSolved / dsaTarget) * 100), 100);
    const dsaDays = dsaProgress >= 100 ? 0 : Math.round(((dsaTarget - dsaSolved) / 3) * 7);

    // 3. Career Readiness
    const jobsCount = await prisma.jobApplication.count({ where: { userId } });
    const careerTarget = 50;
    const careerProgress = Math.min(Math.round((jobsCount / careerTarget) * 100), 100);
    const careerDays = careerProgress >= 100 ? 0 : Math.round(((careerTarget - jobsCount) / 2) * 7);

    // 4. Fitness Goal
    const workouts = await prisma.workoutSession.count({ where: { userId } });
    const workoutTarget = 100;
    const fitnessProgress = Math.min(Math.round((workouts / workoutTarget) * 100), 100);
    const fitnessDays = fitnessProgress >= 100 ? 0 : Math.round(((workoutTarget - workouts) / 3) * 7);

    // 5. Discipline/Habits
    const habitsCount = await prisma.habitLog.count({ where: { userId } });
    const habitsTarget = 200;
    const habitsProgress = Math.min(Math.round((habitsCount / habitsTarget) * 100), 100);
    const habitsDays = habitsProgress >= 100 ? 0 : Math.round(((habitsTarget - habitsCount) / 5) * 7);

    // Deterministic predictions base
    const basePredictions = [
      { title: "Emergency Fund", targetDays: financeDays || 90, progress: financeProgress || 2 },
      { title: "DSA A2Z Completion", targetDays: dsaDays || 120, progress: dsaProgress || 2 },
      { title: "Job Readiness", targetDays: careerDays || 60, progress: careerProgress || 2 },
      { title: "Fitness Goal", targetDays: fitnessDays || 180, progress: fitnessProgress || 2 },
      { title: "Discipline Mastery", targetDays: habitsDays || 90, progress: habitsProgress || 2 }
    ].sort((a,b) => b.progress - a.progress);

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
