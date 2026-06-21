import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CheckCircle, Smile, Flame, Target } from 'lucide-react';

export default function ReflectionIntelligence({ data }) {
  const { reflections = {}, predictions = [] } = data || {};
  const stats = reflections.stats || {};
  const moodHistory = reflections.moodTrend || [];

  const moodData = moodHistory.map((m, i) => ({
    name: i.toString(),
    value: m.score // assuming score is 1-10 or 1-5
  }));

  if (moodData.length === 0) {
    // Mock data for UI if missing
    for (let i = 0; i < 30; i++) {
      moodData.push({ name: String(i), value: Math.random() * 5 + 5 });
    }
  }

  const statCards = [
    { label: 'Productive Days', value: `${stats.productiveDays || 0} days`, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Average Mood', value: stats.averageMood || 'Neutral', icon: Smile, color: 'text-amber-400' },
    { label: 'Burnout Days', value: `${stats.burnoutDays || 0} days`, icon: Flame, color: 'text-rose-400' },
    { label: 'Low Focus Days', value: `${stats.lowFocusDays || 0} days`, icon: Target, color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Reflection Intelligence */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Reflection Intelligence</h2>
          <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            This Month ▾
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Chart Area */}
          <div className="flex-1 border border-slate-700/30 rounded-xl p-4 bg-slate-800/20">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Mood Trend</h3>
            <div className="h-32 w-full relative">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-lg opacity-80 z-10">
                <span>😁</span>
                <span>😐</span>
                <span>😞</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="ml-6">
                <AreaChart data={moodData} margin={{ top: 5, right: 0, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#60a5fa" fillOpacity={1} fill="url(#colorMood)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 ml-6">
                <span>1 Jun</span>
                <span>7 Jun</span>
                <span>14 Jun</span>
                <span>21 Jun</span>
                <span>28 Jun</span>
              </div>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-col gap-3 w-full md:w-48 justify-center">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={stat.color} />
                    <span className="text-xs font-medium text-slate-300">{stat.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto text-center">
          <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
            View All Reflections
          </button>
        </div>
      </div>

      {/* Prediction Engine */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Prediction Engine</h2>
          <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg">
            At current pace
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6 flex-1 justify-center">
          {predictions.map((pred, idx) => {
            const icons = ['💰', '💻', '💪', '💼', '📚'];
            const icon = icons[idx % icons.length];
            
            return (
              <div key={idx} className="group cursor-pointer">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <span>{icon}</span> {pred.title}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {pred.targetDays ? `Target in ${pred.targetDays} days` : pred.targetText || 'In Progress'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex-1">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${pred.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">{pred.progress}%</span>
                </div>
                
                {pred.explanation && (
                  <div className="hidden group-hover:block mt-2 p-2 bg-slate-800/80 rounded border border-slate-700 text-xs text-slate-300">
                    <p>{pred.explanation}</p>
                    {pred.tip && <p className="text-amber-400 mt-1 italic">Tip: {pred.tip}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-auto text-center">
          <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
            View All Predictions
          </button>
        </div>
      </div>
    </div>
  );
}
