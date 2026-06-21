import { prisma } from '../../config/database.js';

class ROIService {
  async getLifeROI(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const prevThirtyDaysAgo = new Date(thirtyDaysAgo);
      prevThirtyDaysAgo.setDate(prevThirtyDaysAgo.getDate() - 30);

      const [
        fitnessROI,
        learningROI,
        careerROI,
        financeROI
      ] = await Promise.all([
        this._getFitnessROI(userId, thirtyDaysAgo),
        this._getLearningROI(userId, thirtyDaysAgo),
        this._getCareerROI(userId, thirtyDaysAgo),
        this._getFinanceROI(userId, thirtyDaysAgo)
      ]);

      return {
        fitness: fitnessROI,
        learning: learningROI,
        career: careerROI,
        finance: financeROI
      };
    } catch (error) {
      console.error('Error calculating Life ROI:', error);
      return {
        fitness: { spent: 0, outcome: 'No data', changePercent: 0 },
        learning: { spent: 0, outcome: 'No data', changePercent: 0 },
        career: { spent: 0, outcome: 'No data', changePercent: 0 },
        finance: { spent: 0, outcome: 'No data', changePercent: 0 }
      };
    }
  }

  async _getFitnessROI(userId, since) {
    try {
      // Spent on fitness/health
      const spendAggr = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: since },
          OR: [
            { category: { contains: 'Health', mode: 'insensitive' } },
            { category: { contains: 'Fitness', mode: 'insensitive' } },
            { category: { contains: 'Gym', mode: 'insensitive' } },
          ],
        },
        _sum: { amount: true },
      });
      const spent = parseFloat(spendAggr._sum.amount || 0);

      // Outcome: Body metric changes
      const latestMetric = await prisma.bodyMetric.findFirst({
        where: { userId },
        orderBy: { date: 'desc' }
      });
      const oldestMetric = await prisma.bodyMetric.findFirst({
        where: { userId, date: { gte: since } },
        orderBy: { date: 'asc' }
      });

      let outcome = 'Maintained';
      let changePercent = 0;
      
      if (latestMetric && oldestMetric && latestMetric.id !== oldestMetric.id) {
        const weightDiff = parseFloat(latestMetric.weight) - parseFloat(oldestMetric.weight);
        if (Math.abs(weightDiff) > 0.5) {
          outcome = `${weightDiff > 0 ? 'Gained' : 'Lost'} ${Math.abs(weightDiff).toFixed(1)} kg`;
          changePercent = (Math.abs(weightDiff) / parseFloat(oldestMetric.weight)) * 100;
        } else if (latestMetric.bodyFat && oldestMetric.bodyFat) {
           const bfDiff = parseFloat(latestMetric.bodyFat) - parseFloat(oldestMetric.bodyFat);
           if(Math.abs(bfDiff) > 0.5) {
              outcome = `${bfDiff > 0 ? 'Gained' : 'Lost'} ${Math.abs(bfDiff).toFixed(1)}% body fat`;
              changePercent = (Math.abs(bfDiff) / parseFloat(oldestMetric.bodyFat)) * 100;
           }
        }
      } else {
        // Fallback outcome: workout count
        const workoutCount = await prisma.workoutSession.count({
          where: { userId, date: { gte: since } }
        });
        if (workoutCount > 0) {
           outcome = `Completed ${workoutCount} Workouts`;
           changePercent = workoutCount > 10 ? 15 : 5; // Fake positive change
        }
      }

      return { spent, outcome, changePercent: Math.round(changePercent) };
    } catch (e) {
       return { spent: 0, outcome: 'No data', changePercent: 0 };
    }
  }

  async _getLearningROI(userId, since) {
    try {
      const spendAggr = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: since },
          OR: [
            { category: { contains: 'Education', mode: 'insensitive' } },
            { category: { contains: 'Learning', mode: 'insensitive' } },
            { category: { contains: 'Course', mode: 'insensitive' } },
            { category: { contains: 'Book', mode: 'insensitive' } },
            { category: { contains: 'Subscription', mode: 'insensitive' } },
          ],
        },
        _sum: { amount: true },
      });
      const spent = parseFloat(spendAggr._sum.amount || 0);

      const dsaSolved = await prisma.dsaUserProgress.count({
        where: { userId, status: 'SOLVED', solvedAt: { gte: since } }
      });

      let outcome = 'Learning in progress';
      let changePercent = 0;
      if (dsaSolved > 0) {
        outcome = `Solved ${dsaSolved} DSA Problems`;
        changePercent = Math.min((dsaSolved / 10) * 10, 100);
      } else {
         // Fallback to learning habits
         const learningHabits = await prisma.habitLog.count({
           where: { userId, completedAt: { gte: since }, habit: { category: { in: ['LEARNING', 'EDUCATION'] } } }
         });
         if (learningHabits > 0) {
            outcome = `Completed ${learningHabits} Learning Tasks`;
            changePercent = 12;
         }
      }

      return { spent, outcome, changePercent: Math.round(changePercent) };
    } catch (e) {
       return { spent: 0, outcome: 'No data', changePercent: 0 };
    }
  }

  async _getCareerROI(userId, since) {
    try {
      const spendAggr = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: since },
          OR: [
            { category: { contains: 'Career', mode: 'insensitive' } },
            { category: { contains: 'Professional', mode: 'insensitive' } },
            { category: { contains: 'Networking', mode: 'insensitive' } },
            { category: { contains: 'Software', mode: 'insensitive' } },
          ],
        },
        _sum: { amount: true },
      });
      const spent = parseFloat(spendAggr._sum.amount || 0);

      const projectsShipped = await prisma.project.count({
        where: { userId, status: 'SHIPPED', updatedAt: { gte: since } }
      });

      let outcome = 'Building skills';
      let changePercent = 0;

      if (projectsShipped > 0) {
        outcome = `Built ${projectsShipped} Project${projectsShipped > 1 ? 's' : ''}`;
        changePercent = projectsShipped * 25;
      } else {
        const jobsApplied = await prisma.jobApplication.count({
          where: { userId, appliedDate: { gte: since } }
        });
        if (jobsApplied > 0) {
           outcome = `Applied to ${jobsApplied} Jobs`;
           changePercent = Math.min((jobsApplied / 5) * 10, 100);
        }
      }

      return { spent, outcome, changePercent: Math.round(changePercent) };
    } catch (e) {
       return { spent: 0, outcome: 'No data', changePercent: 0 };
    }
  }

  async _getFinanceROI(userId, since) {
     try {
       const spendAggr = await prisma.transaction.aggregate({
         where: {
           userId,
           type: 'EXPENSE',
           date: { gte: since },
           necessityLevel: { in: ['WASTEFUL', 'LUXURY'] }
         },
         _sum: { amount: true }
       });
       const spent = parseFloat(spendAggr._sum.amount || 0);
       
       const savingsAggr = await prisma.transaction.aggregate({
         where: {
           userId,
           type: 'TRANSFER',
           date: { gte: since },
           OR: [
             { category: { contains: 'Savings', mode: 'insensitive' } },
             { category: { contains: 'Investment', mode: 'insensitive' } }
           ]
         },
         _sum: { amount: true }
       });
       const saved = parseFloat(savingsAggr._sum.amount || 0);
       
       return { 
         spent, // This is "wasteful" spend, mapped to "Spent"
         saved, // We add this extra field for finance ROI
         outcome: `Saved ₹${saved}`,
         changePercent: saved > 0 ? 14 : 0 
       };
     } catch (e) {
       return { spent: 0, saved: 0, outcome: 'No data', changePercent: 0 };
     }
  }
}

export const roiService = new ROIService();
