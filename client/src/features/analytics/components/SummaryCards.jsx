import { Card } from '@/design-system/components';
import { formatCurrency, formatDuration } from '@/shared/utils/formatters';

export function FinanceCard({ overview }) {
  if (!overview?.finance) return null;
  const { monthlyIncome, monthlyExpense, savings } = overview.finance;
  const savingsRate = monthlyIncome ? Math.round((savings / monthlyIncome) * 100) : 0;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Monthly Finance</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Income</span>
          <span className="stat-number text-sm font-bold text-success">{formatCurrency(monthlyIncome)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Expenses</span>
          <span className="stat-number text-sm font-bold text-danger">{formatCurrency(monthlyExpense)}</span>
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Savings</span>
          <span className="stat-number text-sm font-bold text-white">{formatCurrency(savings)}</span>
        </div>
        {/* Savings rate bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-500">Savings Rate</span>
            <span className="stat-number text-[10px] text-accent">{savingsRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${Math.min(savingsRate, 100)}%` }} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FitnessCard({ overview }) {
  if (!overview?.fitness) return null;
  const { workoutsThisWeek, totalMinutesThisMonth } = overview.fitness;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">Fitness This Month</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="stat-number text-2xl font-bold text-accent">{workoutsThisWeek}</p>
          <p className="text-[10px] text-zinc-500">Workouts/Week</p>
        </div>
        <div className="text-center">
          <p className="stat-number text-2xl font-bold text-success">{formatDuration(totalMinutesThisMonth)}</p>
          <p className="text-[10px] text-zinc-500">Total Time</p>
        </div>
      </div>
    </Card>
  );
}
