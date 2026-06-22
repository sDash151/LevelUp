import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Grid, Star, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import InsightModal from './InsightModal';

const LifeRadarSection = ({ data }) => {
  const [modalState, setModalState] = useState({ isOpen: false, type: null, title: '', insightData: null });

  // Safe fallbacks for data
  const scores = data?.scores || { mind: 0, body: 0, career: 0, money: 0, discipline: 0, reflection: 0 };
  const insights = data?.insights || {
    bestArea: { title: 'Unknown', change: '+0%' },
    focusArea: { title: 'Unknown', change: '-0%' },
    hiddenPattern: { detail: 'No pattern found' },
    opportunityZone: { detail: 'No opportunity found' }
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Radar Chart */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
            Life Balance Radar <span className="text-sm cursor-help opacity-50">ⓘ</span>
          </h2>
          <div className="shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            This Month ▾
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} />
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
                stroke="#cbd5e1"
                strokeDasharray="5 5"
                fill="none"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>
            <div className="w-8 h-1 bg-amber-400 rounded"></div> You
          </div>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>
            <div className="w-8 h-1 border-t-2 border-dashed" style={{ borderColor: 'var(--th-border)' }}></div> Ideal
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="shadow-sm p-6 rounded-3xl flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
            <Sparkles size={20} className="text-amber-500" /> AI Insights
          </h2>
          <div className="shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium cursor-pointer transition-colors hover:opacity-80" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
            This Month ▾
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          {/* Best Area */}
          <div className="border p-4 rounded-2xl flex items-start gap-4" style={{ background: 'var(--th-card)', borderColor: 'var(--color-success)40' }}>
            <div className="p-2 rounded-full shrink-0" style={{ background: '#10B98120', color: '#10B981' }}>
              <ArrowUp size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Best Performing Area</h4>
                <span className="font-bold text-lg" style={{ color: '#10B981' }}>{insights.bestArea?.change || '+0%'}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--th-text-secondary)' }}>{insights.bestArea?.area || insights.bestArea?.title || 'Unknown'}</p>
            </div>
          </div>

          {/* Focus Area */}
          <div className="border p-4 rounded-2xl flex items-start gap-4" style={{ background: 'var(--th-card)', borderColor: 'var(--color-danger)40' }}>
            <div className="p-2 rounded-full shrink-0" style={{ background: '#EF444420', color: '#EF4444' }}>
              <ArrowDown size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Focus Area</h4>
                <span className="font-bold text-lg" style={{ color: '#EF4444' }}>{insights.focusArea?.change || '-0%'}</span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--th-text-secondary)' }}>{insights.focusArea?.area || insights.focusArea?.title || 'Unknown'}</p>
            </div>
          </div>

          {/* Hidden Pattern */}
          <div 
            className="border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors hover:opacity-80"
            style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)' }}
            onClick={() => setModalState({ isOpen: true, type: 'hiddenPattern', title: 'Hidden Pattern', insightData: insights.hiddenPattern })}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full shrink-0" style={{ background: '#3B82F620', color: '#3B82F6' }}>
                <Grid size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Hidden Pattern</h4>
                <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--th-text-secondary)' }}>{insights.hiddenPattern?.detail || insights.hiddenPattern}</p>
              </div>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </div>

          {/* Opportunity Zone */}
          <div 
            className="border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors hover:opacity-80"
            style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)' }}
            onClick={() => setModalState({ isOpen: true, type: 'opportunityZone', title: 'Opportunity Zone', insightData: insights.opportunityZone })}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full shrink-0" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
                <Star size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Opportunity Zone</h4>
                <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--th-text-secondary)' }}>{insights.opportunityZone?.detail || insights.opportunityZone}</p>
              </div>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </div>
        </div>

        <div className="mt-4 pt-4 text-center">
          <button 
            className="w-full py-3 text-amber-500 hover:text-amber-600 font-semibold text-sm transition-colors rounded-xl hover:bg-amber-50"
            onClick={() => setModalState({ isOpen: true, type: 'all', title: 'All AI Insights', insightData: { detail: 'This page will display a full breakdown of all your historical AI insights and trends over time.' } })}
          >
            View All Insights
          </button>
        </div>
      </div>

      <InsightModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        insightData={modalState.insightData}
      />
    </div>
  );
};

export default LifeRadarSection;
