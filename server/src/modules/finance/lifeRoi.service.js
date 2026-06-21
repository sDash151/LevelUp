/**
 * Life ROI Service — Cross-module integration for Finance.
 * 
 * Connects financial spending data with outcomes from:
 * - Fitness (health spending → body metrics)
 * - DSA (learning spending → problems solved)
 * - Projects (tool spending → projects shipped)
 * - Career (career spending → job applications/offers)
 * 
 * Degrades gracefully when modules have no data.
 */
import { prisma } from '../../config/database.js';

class LifeROIService {

  /**
   * Get the full Life ROI report for a user.
   * Maps money spent in self-improvement categories to real outcomes.
   */
  async getLifeROI(userId, monthsBack = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Fetch self-improvement transactions grouped by meta-category
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate },
        category: { in: this._selfImprovementCategories() },
      },
      orderBy: { date: 'desc' },
    });

    const [healthROI, learningROI, careerROI, toolsROI] = await Promise.all([
      this._getHealthROI(userId, transactions, startDate),
      this._getLearningROI(userId, transactions, startDate),
      this._getCareerROI(userId, transactions, startDate),
      this._getToolsROI(userId, transactions, startDate),
    ]);

    const totalInvested = [healthROI, learningROI, careerROI, toolsROI]
      .reduce((sum, r) => sum + r.invested, 0);

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      health: healthROI,
      learning: learningROI,
      career: careerROI,
      tools: toolsROI,
    };
  }

  /**
   * Health ROI — Money spent on health/fitness → body metric changes
   */
  async _getHealthROI(userId, allTransactions, startDate) {
    const healthCategories = ['Health & Fitness', 'Health', 'Fitness', 'Gym', 'Sports', 'Medical'];
    const txns = allTransactions.filter(t => healthCategories.includes(t.category));
    const invested = txns.reduce((s, t) => s + parseFloat(t.amount), 0);

    // Try to get fitness outcomes
    let outcomes = [];
    try {
      const metrics = await prisma.bodyMetric.findMany({
        where: { userId, date: { gte: startDate } },
        orderBy: { date: 'asc' },
      });

      if (metrics.length >= 2) {
        const first = metrics[0];
        const last = metrics[metrics.length - 1];

        if (first.weight && last.weight) {
          const diff = parseFloat(last.weight) - parseFloat(first.weight);
          outcomes.push(`${diff > 0 ? 'Gained' : 'Lost'} ${Math.abs(diff).toFixed(1)} kg`);
        }
        if (first.bodyFat && last.bodyFat) {
          const diff = parseFloat(last.bodyFat) - parseFloat(first.bodyFat);
          outcomes.push(`Body fat ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`);
        }
      }

      const sessions = await prisma.workoutSession.count({
        where: { userId, date: { gte: startDate } },
      });
      if (sessions > 0) outcomes.push(`${sessions} workouts completed`);
    } catch {
      // Fitness module data not available — degrade gracefully
    }

    return {
      category: 'Health',
      invested: Math.round(invested * 100) / 100,
      outcomes: outcomes.length > 0 ? outcomes : ['No fitness data yet'],
    };
  }

  /**
   * Learning ROI — Money spent on courses/books → DSA/skills progress
   */
  async _getLearningROI(userId, allTransactions, startDate) {
    const learningCategories = ['Learning', 'Education', 'Books', 'Courses', 'Training'];
    const txns = allTransactions.filter(t => learningCategories.includes(t.category));
    const invested = txns.reduce((s, t) => s + parseFloat(t.amount), 0);

    let outcomes = [];
    try {
      const solvedCount = await prisma.dsaUserProgress.count({
        where: { userId, status: 'SOLVED', solvedAt: { gte: startDate } },
      });
      if (solvedCount > 0) outcomes.push(`${solvedCount} DSA problems solved`);

      const patterns = await prisma.dsaPatternMastery.findMany({
        where: { userId, masteryPct: { gte: 50 } },
      });
      if (patterns.length > 0) outcomes.push(`${patterns.length} patterns mastered`);
    } catch {
      // DSA module data not available
    }

    try {
      const learnings = await prisma.projectLearning.count({
        where: {
          project: { userId },
          createdAt: { gte: startDate },
        },
      });
      if (learnings > 0) outcomes.push(`${learnings} project learnings captured`);
    } catch {
      // Project module data not available
    }

    return {
      category: 'Learning',
      invested: Math.round(invested * 100) / 100,
      outcomes: outcomes.length > 0 ? outcomes : ['No learning data yet'],
    };
  }

  /**
   * Career ROI — Money spent on career development → job applications/interviews
   */
  async _getCareerROI(userId, allTransactions, startDate) {
    const careerCategories = ['Career', 'Networking', 'Professional', 'Certifications'];
    const txns = allTransactions.filter(t => careerCategories.includes(t.category));
    const invested = txns.reduce((s, t) => s + parseFloat(t.amount), 0);

    let outcomes = [];
    try {
      const applications = await prisma.jobApplication.count({
        where: { userId, appliedDate: { gte: startDate } },
      });
      if (applications > 0) outcomes.push(`${applications} jobs applied`);

      const interviews = await prisma.jobApplication.count({
        where: {
          userId,
          appliedDate: { gte: startDate },
          status: { in: ['INTERVIEW', 'OFFER'] },
        },
      });
      if (interviews > 0) outcomes.push(`${interviews} interviews/offers`);

      const projects = await prisma.project.count({
        where: { userId, status: 'SHIPPED', createdAt: { gte: startDate } },
      });
      if (projects > 0) outcomes.push(`Built ${projects} project${projects > 1 ? 's' : ''}`);
    } catch {
      // Job/Project module data not available
    }

    return {
      category: 'Career',
      invested: Math.round(invested * 100) / 100,
      outcomes: outcomes.length > 0 ? outcomes : ['No career data yet'],
    };
  }

  /**
   * Tools ROI — Money spent on tools/software → productivity outcomes
   */
  async _getToolsROI(userId, allTransactions, startDate) {
    const toolCategories = ['Tools', 'Software', 'Technology', 'Subscriptions'];
    const txns = allTransactions.filter(t => toolCategories.includes(t.category));
    const invested = txns.reduce((s, t) => s + parseFloat(t.amount), 0);

    let outcomes = [];
    try {
      const projects = await prisma.project.findMany({
        where: { userId, createdAt: { gte: startDate } },
        include: { metrics: true },
      });

      const totalCommits = projects.reduce((s, p) => s + (p.metrics?.commitCount || 0), 0);
      if (totalCommits > 0) outcomes.push(`${totalCommits} commits made`);
      if (projects.length > 0) outcomes.push(`${projects.length} projects active`);
    } catch {
      // Project module data not available
    }

    return {
      category: 'Tools',
      invested: Math.round(invested * 100) / 100,
      outcomes: outcomes.length > 0 ? outcomes : ['No tool usage data yet'],
    };
  }

  /**
   * All categories considered as self-improvement spending
   */
  _selfImprovementCategories() {
    return [
      'Health & Fitness', 'Health', 'Fitness', 'Gym', 'Sports', 'Medical',
      'Learning', 'Education', 'Books', 'Courses', 'Training',
      'Career', 'Networking', 'Professional', 'Certifications',
      'Tools', 'Software', 'Technology',
    ];
  }
}

export const lifeROIService = new LifeROIService();
