import { Card } from '@/design-system/components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/shared/utils/formatters';
import clsx from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-zinc-400">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function FinanceSummary({ summary }) {
  if (!summary) return null;
  const chartData = summary.byCategory?.map((c) => ({ name: c.category, value: c.amount })) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Income */}
      <Card>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Monthly Income</p>
        <p className="stat-number text-2xl font-bold text-success">{formatCurrency(summary.monthlyIncome)}</p>
      </Card>

      {/* Expense */}
      <Card>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Monthly Expense</p>
        <p className="stat-number text-2xl font-bold text-danger">{formatCurrency(summary.monthlyExpense)}</p>
      </Card>

      {/* Savings */}
      <Card>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Savings</p>
        <p className={clsx('stat-number text-2xl font-bold', summary.savings >= 0 ? 'text-success' : 'text-danger')}>
          {formatCurrency(summary.savings)}
        </p>
      </Card>

      {/* Category Breakdown */}
      {chartData.length > 0 && (
        <Card className="md:col-span-3">
          <h3 className="text-sm font-semibold text-white mb-3">Expense Breakdown</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {chartData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-zinc-400 truncate">{c.name}</span>
                  <span className="text-[10px] text-zinc-300 ml-auto stat-number">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
