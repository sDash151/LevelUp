import React from 'react';
import { Target, Brain, Briefcase, DollarSign } from 'lucide-react';

export default function LifeROISection({ data }) {
  const { roi = {}, streaks = [] } = data || {};

  const roiCards = [
    {
      id: 'fitness',
      title: 'Fitness ROI',
      icon: Target,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/10',
      spent: roi.fitness?.spent || 0,
      outcomeLabel: 'Health Score',
      outcomeValue: roi.fitness?.outcome || 'No data',
      change: roi.fitness?.changePercent || 0,
    },
    {
      id: 'learning',
      title: 'Learning ROI',
      icon: Brain,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
      spent: roi.learning?.spent || 0,
      outcomeLabel: 'Skill Growth',
      outcomeValue: roi.learning?.outcome || 'No data',
      change: roi.learning?.changePercent || 0,
    },
    {
      id: 'career',
      title: 'Career ROI',
      icon: Briefcase,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      spent: roi.career?.spent || 0,
      outcomeLabel: 'Profile Strength',
      outcomeValue: roi.career?.outcome || 'No data',
      change: roi.career?.changePercent || 0,
    },
    {
      id: 'finance',
      title: 'Finance ROI',
      icon: DollarSign,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10',
      spent: roi.finance?.spent || 0,
      outcomeLabel: 'Wealth Growth',
      outcomeValue: roi.finance?.outcome || 'No data',
      change: roi.finance?.changePercent || 0,
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Excellent': return 'bg-purple-400';
      case 'Strong': return 'bg-emerald-400';
      case 'Good': return 'bg-blue-400';
      case 'At Risk': return 'bg-amber-400';
      default: return 'bg-slate-400';
    }
  };

  const getStatusIcon = (name) => {
    switch(name) {
      case 'Habits': return '🔥';
      case 'Fitness': return '💪';
      case 'Savings': return '💰';
      case 'DSA Practice': return '💻';
      case 'Job Prep': return '💼';
      case 'Reflections': return '📔';
      default: return '⭐';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Life ROI */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Life ROI</h2>
          <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            This Month ▾
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {roiCards.map((card) => {
            const Icon = card.icon;
            const isPositive = card.change >= 0;
            return (
              <div key={card.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                    <Icon size={16} className={card.iconColor} />
                  </div>
                  <span className="font-semibold text-slate-200 text-sm">{card.title}</span>
                </div>
                
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Spent: ₹{card.spent.toLocaleString()}</div>
                    <div className="text-sm text-white font-medium">{card.outcomeValue}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{card.change}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{card.outcomeLabel}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-auto text-center">
          <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
            View Detailed ROI Report
          </button>
        </div>
      </div>

      {/* Streak Matrix */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Streak Matrix</h2>
          <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            This Month ▾
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/30 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Streak</th>
                <th className="px-4 py-3 font-medium">Current</th>
                <th className="px-4 py-3 font-medium">Best</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {streaks.map((s) => (
                <tr key={s.name} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200 flex items-center gap-2">
                    <span>{getStatusIcon(s.name)}</span> {s.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s.current} days</td>
                  <td className="px-4 py-3 text-slate-400">{s.best} days</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s.status)}`} />
                      <span className={`text-xs font-medium ${s.status === 'At Risk' ? 'text-amber-400' : 'text-slate-300'}`}>
                        {s.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
