import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Apple, CheckCircle2 } from 'lucide-react';

export default function NutritionSummaryCard({ data }) {
  const { calories, protein, carbs, fats } = data?.calories ? data : {
    calories: { consumed: 0, goal: 2100 },
    protein: { consumed: 0, goal: 150 },
    carbs: { consumed: 0, goal: 250 },
    fats: { consumed: 0, goal: 70 },
  };

  const calPct = calories?.goal > 0 ? Math.round((calories.consumed / calories.goal) * 100) : 0;
  const chartData = [
    { value: calories?.consumed || 0 },
    { value: Math.max(0, (calories?.goal || 0) - (calories?.consumed || 0)) },
  ];

  const macros = [
    { label: 'Protein', consumed: protein?.consumed || 0, goal: protein?.goal || 150, color: '#10B981', textColor: 'text-emerald-500' },
    { label: 'Carbs', consumed: carbs?.consumed || 0, goal: carbs?.goal || 250, color: '#F59E0B', textColor: 'text-amber-500' },
    { label: 'Fats', consumed: fats?.consumed || 0, goal: fats?.goal || 70, color: '#EF4444', textColor: 'text-rose-500' },
  ];

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Apple className="w-3.5 h-3.5 text-rose-500" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Nutrition Summary</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--th-text-dim)] font-medium">
          Today <span className="text-[8px]">▼</span>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4 flex-1">
        <div className="relative w-[130px] h-[130px] flex-shrink-0 -ml-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={62} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270} cornerRadius={5}>
                <Cell fill="#10B981" />
                <Cell fill="var(--th-highlight)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
            <span className="text-2xl font-bold leading-none mb-1" style={{ color: 'var(--th-text)' }}>{(calories?.consumed || 0).toLocaleString()}</span>
            <span className="text-[11px] font-medium leading-none mb-1" style={{ color: 'var(--th-text-secondary)' }}>/ {(calories?.goal || 2100).toLocaleString()}</span>
            <span className="text-[10px] text-[var(--th-text-dim)] leading-none">kcal</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {macros.map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{m.label}</span>
                <span className="font-bold">
                  <span className={m.textColor}>{m.consumed}</span>
                  <span className="text-[var(--th-text-dim)]">/{m.goal}g</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-[var(--th-bg-secondary)] dark:bg-[var(--th-card)]/5">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (m.consumed / m.goal) * 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{calPct >= 70 && calPct <= 110 ? "Good job! You're within your daily calorie goal." : calPct < 70 ? "Eat more to hit your calorie goal." : "You've exceeded your calorie goal."}</span>
      </div>
    </div>
  );
}
