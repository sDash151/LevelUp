/**
 * Finance XP Engine — Gamification for financial discipline.
 * Centralized XP logic. No inline XP calculations.
 */
import { awardXp } from '../../shared/utils/xp.js';

const XP_REWARDS = {
  TRANSACTION_LOGGED: 10,
  BUDGET_RESPECTED: 50,
  SAVINGS_CONTRIBUTION: 20,
  NO_SPEND_DAY: 15,
  REFLECTION_COMPLETED: 30,
  GOAL_COMPLETED: 100,
};

class FinanceXP {

  async awardTransactionXp(userId) {
    return this._award(userId, XP_REWARDS.TRANSACTION_LOGGED, 'finance_transaction');
  }

  async awardBudgetXp(userId, budgetCount) {
    const total = XP_REWARDS.BUDGET_RESPECTED * budgetCount;
    return this._award(userId, total, 'finance_budget');
  }

  async awardSavingsXp(userId) {
    return this._award(userId, XP_REWARDS.SAVINGS_CONTRIBUTION, 'finance_savings');
  }

  async awardChallengeXp(userId, xpReward) {
    return this._award(userId, xpReward || 50, 'finance_challenge');
  }

  async awardNoSpendXp(userId) {
    return this._award(userId, XP_REWARDS.NO_SPEND_DAY, 'finance_no_spend');
  }

  async awardReflectionXp(userId) {
    return this._award(userId, XP_REWARDS.REFLECTION_COMPLETED, 'finance_reflection');
  }

  async awardGoalXp(userId) {
    return this._award(userId, XP_REWARDS.GOAL_COMPLETED, 'finance_goal');
  }

  /**
   * Get monthly XP breakdown for display.
   */
  getXpRewards() {
    return XP_REWARDS;
  }

  async _award(userId, amount, source) {
    try {
      return await awardXp(userId, amount, source);
    } catch (error) {
      console.error(`FinanceXP: Failed to award ${amount} XP for ${source}:`, error.message);
      return null;
    }
  }
}

export const financeXP = new FinanceXP();
