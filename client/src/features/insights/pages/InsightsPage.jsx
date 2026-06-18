import { useState } from 'react';
import { AnimatedPage, EmptyState } from '@/design-system/components';
import { useInsights } from '../hooks/useInsights';
import { InsightCard } from '../components/InsightCard';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

const FILTERS = [null, 'success', 'warning', 'info', 'tip'];
const LABELS = { null: 'All', success: '🎉 Wins', warning: '⚠️ Alerts', info: 'ℹ️ Info', tip: '💡 Tips' };

export default function InsightsPage() {
  const [filter, setFilter] = useState(null);
  const { data: insights = [] } = useInsights();
  const filtered = filter ? insights.filter((i) => i.type === filter) : insights;

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" /> Insights
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Smart observations across your life</p>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', filter === f ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{LABELS[f]}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Sparkles} title="No insights available" description="Keep using LevelUp and insights will appear here" />
      ) : (
        <div className="space-y-3">
          {filtered.map((insight, i) => (
            <InsightCard key={`${insight.category}-${insight.title}`} insight={insight} index={i} />
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
