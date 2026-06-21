/**
 * Finance Scoring Engine — Centralized scoring for Freedom Score and Protection Score.
 * Single source of truth. Used by Overview, Protect, and Intelligence tabs.
 */

class FinanceScoring {

  // ══════════════════════════════════════════════
  // FREEDOM SCORE (0-100)
  // ══════════════════════════════════════════════

  /**
   * Calculates the Freedom Score — a holistic financial health metric.
   * 
   * @param {Object} params
   * @param {number} params.monthlyIncome
   * @param {number} params.monthlyExpenses
   * @param {number} params.totalDebt
   * @param {number} params.emergencyFund - Current emergency fund amount
   * @param {number} params.avgMonthlyExpenses - 3-month average monthly expenses
   * @param {number} params.budgetAdherence - Percentage of budgets under limit (0-100)
   * @returns {{ score: number, label: string, breakdown: Object }}
   */
  calculateFreedomScore({ monthlyIncome, monthlyExpenses, totalDebt, emergencyFund, avgMonthlyExpenses, budgetAdherence }) {
    // 1. Savings Ratio (25%) — how much income is saved
    const savingsRatio = monthlyIncome > 0
      ? Math.min(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100, 100)
      : 0;
    const savingsScore = Math.max(0, Math.min(savingsRatio * 2, 100)); // 50% savings = 100 score

    // 2. Debt Load (20%) — total debt relative to annual income
    const annualIncome = monthlyIncome * 12;
    const debtRatio = annualIncome > 0 ? (totalDebt / annualIncome) * 100 : (totalDebt > 0 ? 100 : 0);
    const debtScore = Math.max(0, 100 - debtRatio); // Lower debt = higher score

    // 3. Emergency Fund (25%) — months of expenses covered
    const emergencyMonths = avgMonthlyExpenses > 0 ? emergencyFund / avgMonthlyExpenses : 0;
    const emergencyScore = Math.min((emergencyMonths / 6) * 100, 100); // 6 months = 100

    // 4. Burn Rate Stability (15%) — expense-to-income ratio
    const burnRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;
    const burnScore = Math.max(0, 100 - burnRatio); // Lower burn = higher score

    // 5. Budget Discipline (15%)
    const budgetScore = Math.max(0, Math.min(budgetAdherence, 100));

    // Weighted calculation
    const score = Math.round(
      savingsScore * 0.25 +
      debtScore * 0.20 +
      emergencyScore * 0.25 +
      burnScore * 0.15 +
      budgetScore * 0.15
    );

    const clampedScore = Math.max(0, Math.min(score, 100));

    return {
      score: clampedScore,
      label: this._getFreedomLabel(clampedScore),
      breakdown: {
        savingsRatio: { score: Math.round(savingsScore), weight: 25, raw: Math.round(savingsRatio * 10) / 10 },
        debtLoad: { score: Math.round(debtScore), weight: 20, raw: Math.round(debtRatio * 10) / 10 },
        emergencyFund: { score: Math.round(emergencyScore), weight: 25, raw: Math.round(emergencyMonths * 10) / 10 },
        burnRate: { score: Math.round(burnScore), weight: 15, raw: Math.round(burnRatio * 10) / 10 },
        budgetDiscipline: { score: Math.round(budgetScore), weight: 15, raw: Math.round(budgetAdherence * 10) / 10 },
      },
    };
  }

  _getFreedomLabel(score) {
    if (score >= 86) return 'Excellent';
    if (score >= 71) return 'Great';
    if (score >= 51) return 'Good Progress';
    if (score >= 31) return 'Needs Work';
    return 'Critical';
  }

  // ══════════════════════════════════════════════
  // PROTECTION SCORE (0-100)
  // ══════════════════════════════════════════════

  /**
   * Calculates the Protection Score — financial safety metric.
   * 
   * @param {Object} params
   * @param {number} params.emergencyFund
   * @param {number} params.avgMonthlyExpenses
   * @param {number} params.totalDebt
   * @param {number} params.monthlyIncome
   * @param {number} params.activeInsuranceCount
   * @param {number} params.idealInsuranceCount - Recommended number (usually 4: health, term, vehicle, accident)
   * @param {number} params.subscriptionLoad - Monthly subscription cost
   * @param {number} params.billsPaidOnTime
   * @param {number} params.totalBills
   * @returns {{ score: number, label: string, breakdown: Object }}
   */
  calculateProtectionScore({ emergencyFund, avgMonthlyExpenses, totalDebt, monthlyIncome, activeInsuranceCount, idealInsuranceCount = 4, subscriptionLoad, billsPaidOnTime, totalBills }) {
    // 1. Emergency Fund Coverage (30%)
    const emergencyMonths = avgMonthlyExpenses > 0 ? emergencyFund / avgMonthlyExpenses : 0;
    const emergencyScore = Math.min((emergencyMonths / 6) * 100, 100);

    // 2. Debt-to-Income Ratio (20%)
    const dtiRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : (totalDebt > 0 ? 100 : 0);
    const debtScore = Math.max(0, 100 - dtiRatio);

    // 3. Insurance Coverage (20%)
    const insuranceScore = idealInsuranceCount > 0
      ? Math.min((activeInsuranceCount / idealInsuranceCount) * 100, 100)
      : 100;

    // 4. Subscription Load (15%) — subs as % of income
    const subRatio = monthlyIncome > 0 ? (subscriptionLoad / monthlyIncome) * 100 : 0;
    const subScore = Math.max(0, 100 - subRatio * 5); // 20% subs = 0 score

    // 5. Bills Paid On Time (15%)
    const billScore = totalBills > 0 ? (billsPaidOnTime / totalBills) * 100 : 100;

    const score = Math.round(
      emergencyScore * 0.30 +
      debtScore * 0.20 +
      insuranceScore * 0.20 +
      subScore * 0.15 +
      billScore * 0.15
    );

    const clampedScore = Math.max(0, Math.min(score, 100));

    return {
      score: clampedScore,
      label: this._getProtectionLabel(clampedScore),
      breakdown: {
        emergencyFund: { score: Math.round(emergencyScore), weight: 30, months: Math.round(emergencyMonths * 10) / 10 },
        debtToIncome: { score: Math.round(debtScore), weight: 20, ratio: Math.round(dtiRatio * 10) / 10 },
        insurance: { score: Math.round(insuranceScore), weight: 20, count: activeInsuranceCount, ideal: idealInsuranceCount },
        subscriptionLoad: { score: Math.round(subScore), weight: 15, ratio: Math.round(subRatio * 10) / 10 },
        billsPaid: { score: Math.round(billScore), weight: 15, paid: billsPaidOnTime, total: totalBills },
      },
    };
  }

  _getProtectionLabel(score) {
    if (score >= 86) return 'Excellent';
    if (score >= 71) return 'Well Protected';
    if (score >= 51) return 'Moderate';
    if (score >= 31) return 'At Risk';
    return 'High Risk';
  }

  // ══════════════════════════════════════════════
  // UPGRADE SCORE (0-1000)
  // ══════════════════════════════════════════════

  /**
   * Calculates the Upgrade Score — self-investment tracking.
   * Measures money spent on learning, health, tools, and business.
   * 
   * @param {Array} transactions - Self-improvement category transactions
   * @returns {{ score: number, level: number, breakdown: Object }}
   */
  calculateUpgradeScore(transactions) {
    const categoryMap = {
      health: ['Health & Fitness', 'Health', 'Fitness', 'Gym', 'Sports', 'Medical'],
      learning: ['Learning', 'Education', 'Books', 'Courses', 'Training'],
      tools: ['Tools', 'Software', 'Technology'],
      business: ['Career', 'Networking', 'Professional', 'Certifications', 'Investments'],
    };

    const breakdown = { health: 0, learning: 0, tools: 0, business: 0 };

    for (const txn of transactions) {
      const amount = parseFloat(txn.amount);
      for (const [key, categories] of Object.entries(categoryMap)) {
        if (categories.includes(txn.category)) {
          breakdown[key] += amount;
          break;
        }
      }
    }

    const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

    // Score: 1 point per 100 spent, max 1000
    const score = Math.min(Math.round(total / 100) * 10, 1000);
    const level = Math.min(Math.floor(score / 100) + 1, 10);

    return {
      score,
      level,
      totalInvested: Math.round(total * 100) / 100,
      breakdown: {
        health: Math.round(breakdown.health * 100) / 100,
        learning: Math.round(breakdown.learning * 100) / 100,
        tools: Math.round(breakdown.tools * 100) / 100,
        business: Math.round(breakdown.business * 100) / 100,
      },
    };
  }

  // ══════════════════════════════════════════════
  // CASH RESERVE (months of expenses covered)
  // ══════════════════════════════════════════════

  calculateCashReserve(cashBalance, avgMonthlyExpenses) {
    if (avgMonthlyExpenses <= 0) return { months: 0, label: 'No data' };
    const months = Math.round((cashBalance / avgMonthlyExpenses) * 10) / 10;
    return {
      months,
      label: months >= 6 ? 'Healthy' : months >= 3 ? 'Moderate' : 'Low',
    };
  }

  // ══════════════════════════════════════════════
  // SAVINGS VELOCITY (monthly savings growth %)
  // ══════════════════════════════════════════════

  calculateSavingsVelocity(currentMonthSavings, previousMonthSavings) {
    if (previousMonthSavings <= 0) return { velocity: 0, trend: 'neutral' };
    const velocity = Math.round(((currentMonthSavings - previousMonthSavings) / Math.abs(previousMonthSavings)) * 1000) / 10;
    return {
      velocity,
      trend: velocity > 0 ? 'up' : velocity < 0 ? 'down' : 'neutral',
    };
  }

  // ══════════════════════════════════════════════
  // BURN RATE (daily expense rate)
  // ══════════════════════════════════════════════

  calculateBurnRate(monthlyExpenses) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Math.round((monthlyExpenses / daysInMonth) * 100) / 100;
  }
}

export const financeScoring = new FinanceScoring();
