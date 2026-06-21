import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Grid, Star, ChevronRight } from 'lucide-react';

const LifeRadarSection = ({ data }) => {
  // Safe fallbacks for data
  const scores = data?.scores || { mind: 0, body: 0, career: 0, money: 0, discipline: 0, reflection: 0 };
  const insights = data?.insights || {
    bestArea: { title: 'Unknown', change: '+0%' },
    focusArea: { title: 'Unknown', change: '-0%' },
    hiddenPattern: 'No pattern found',
    opportunityZone: 'No opportunity found'
  };

  const chartData = [
    { subject: 'Mind', A: scores.mind, B: 100 },
    { subject: 'Body', A: scores.body, B: 100 },
    { subject: 'Career', A: scores.career, B: 100 },
    { subject: 'Money', A: scores.money, B: 100 },
    { subject: 'Discipline', A: scores.discipline, B: 100 },
    { subject: 'Reflection', A: scores.reflection, B: 100 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Left Column */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 w-full lg:w-3/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Life Balance Radar</h2>
          <select className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-500">
            <option>This Month</option>
            <option>Last Month</option>
            <option>All Time</option>
          </select>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="You"
                dataKey="A"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.4}
              />
              <Radar
                name="Ideal"
                dataKey="B"
                stroke="#64748b"
                strokeDasharray="5 5"
                fill="none"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Column */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 w-full lg:w-2/5 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
          <select className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-500">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          {/* Best Area */}
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <ArrowUp className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-semibold">Best Area</p>
                <p className="text-white font-medium">{insights.bestArea?.title || 'Unknown'}</p>
              </div>
            </div>
            <span className="text-emerald-400 font-bold">{insights.bestArea?.change || '+0%'}</span>
          </div>

          {/* Focus Area */}
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/20 p-2 rounded-lg">
                <ArrowDown className="text-rose-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-semibold">Focus Area</p>
                <p className="text-white font-medium">{insights.focusArea?.title || 'Unknown'}</p>
              </div>
            </div>
            <span className="text-rose-400 font-bold">{insights.focusArea?.change || '-0%'}</span>
          </div>

          {/* Hidden Pattern */}
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Grid className="text-blue-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-semibold">Hidden Pattern</p>
                <p className="text-white font-medium text-sm line-clamp-1">{insights.hiddenPattern}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-500 w-5 h-5" />
          </div>

          {/* Opportunity Zone */}
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Star className="text-amber-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-semibold">Opportunity Zone</p>
                <p className="text-white font-medium text-sm line-clamp-1">{insights.opportunityZone}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-500 w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
          <button className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
            View All Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifeRadarSection;
