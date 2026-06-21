import { TrendingUp, Heart, Target, Calendar } from 'lucide-react';

export default function PlanInsightsCards({ insights = {} }) {
  const cards = [
    { key: 'strengthTrend', label: 'Strength Trend', icon: TrendingUp, color: '#10B981', value: insights.strengthTrend?.label || 'N/A', desc: insights.strengthTrend?.description || '' },
    { key: 'recoveryStatus', label: 'Recovery Status', icon: Heart, color: '#3B82F6', value: insights.recoveryStatus?.label || 'N/A', desc: insights.recoveryStatus?.description || '' },
    { key: 'focusArea', label: 'Focus Area', icon: Target, color: '#E8A23A', value: insights.focusArea?.label || 'N/A', desc: insights.focusArea?.description || '' },
    { key: 'nextDeload', label: 'Next Deload', icon: Calendar, color: '#8B5CF6', value: insights.nextDeload?.label || 'N/A', desc: insights.nextDeload?.description || '' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{card.label}</span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>{card.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-dim)' }}>{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
