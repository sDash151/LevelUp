import React, { useState } from 'react';
import { Target, Brain, Briefcase, DollarSign, TrendingUp, TrendingDown, Flame, Trophy, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import InsightModal from './InsightModal';
import { getDetailedROIReport } from '../api';
import toast from 'react-hot-toast';

export default function LifeROISection({ data }) {
  const { roi = {}, streaks = [] } = data || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, insightData: null });

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

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const data = await getDetailedROIReport();
      setModalState({
        isOpen: true,
        insightData: data.report
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ROI report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Life ROI Grid */}
      <div className="shadow-sm p-5 rounded-3xl flex flex-col relative overflow-hidden" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-5 relative z-10">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
            <Target className="text-amber-500" size={18} />
            Life ROI
          </h2>
          <div className="shadow-sm rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            This Month ▾
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
          {roiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-col justify-between hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--th-text)' }}>{card.title}</span>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                  <div className="flex flex-col gap-1 w-2/3 pr-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--th-text-muted)' }}>Invested</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--th-text-secondary)' }}>{formatCurrency(card.spent)}</span>
                    <span className="text-sm font-bold mt-1 leading-tight line-clamp-2" style={{ color: 'var(--th-text)' }}>{card.outcomeValue}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 w-1/3">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold" style={card.change > 0 ? { background: '#10B98120', color: '#10B981' } : card.change < 0 ? { background: '#EF444420', color: '#EF4444' } : { background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)' }}>
                      {card.change > 0 ? <TrendingUp size={10} strokeWidth={3}/> : card.change < 0 ? <TrendingDown size={10} strokeWidth={3}/> : null}
                      {card.change > 0 ? '+' : ''}{card.change}%
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-wider mt-1.5 text-right" style={{ color: 'var(--th-text-muted)' }}>{card.outcomeLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-5 pt-2 text-center relative z-10">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full py-3 font-bold text-xs transition-colors hover:opacity-80 rounded-xl flex items-center justify-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#F59E0B20', color: '#F59E0B' }}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
            )}
            {isGenerating ? 'Analyzing Life Data...' : 'View Detailed ROI Report'}
          </button>
        </div>
      </div>

      {/* Streak Matrix */}
      <div className="shadow-sm p-5 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
            <Flame className="text-rose-500" size={18} />
            Streak Matrix
          </h2>
          <div className="shadow-sm rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            This Month ▾
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'var(--th-text-muted)' }}>
                <th className="px-3 py-1.5">Habit / Skill</th>
                <th className="px-3 py-1.5">Current</th>
                <th className="px-3 py-1.5">Peak</th>
                <th className="px-3 py-1.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {streaks.map((s) => (
                <tr key={s.name} className="transition-colors group hover:opacity-80">
                  <td className="px-3 py-2.5 rounded-l-xl border-y border-l border-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-all" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                        {getStatusIcon(s.name)}
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--th-text)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 border-y border-transparent">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold" style={{ color: 'var(--th-text)' }}>{s.current}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--th-text-muted)' }}>Days</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 border-y border-transparent">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold" style={{ color: 'var(--th-text)' }}>{s.peak}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--th-text-muted)' }}>Days</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 rounded-r-xl border-y border-r border-transparent text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap
                      ${s.status === 'Excellent' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                        s.status === 'Strong' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        s.status === 'Good' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {s.status === 'At Risk' ? <AlertCircle size={8} strokeWidth={3} /> : <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'Excellent' ? 'bg-blue-500' : s.status === 'Strong' ? 'bg-emerald-500' : 'bg-amber-500'}`} />}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <InsightModal 
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ isOpen: false, insightData: null })}
      insightData={modalState.insightData}
      title="Detailed ROI Analysis"
      type="roiReport"
    />
    </>
  );
}
