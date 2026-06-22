import { Sparkles, Brain, Loader2, RefreshCw } from 'lucide-react';
import { useAiInsight, useRegenerateAiInsight } from '../hooks/useReflections';
import { motion } from 'motion/react';

export function AIReflectionInsight() {
  const { data: insight, isLoading, error } = useAiInsight();
  const regenerate = useRegenerateAiInsight();

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 mb-6 animate-pulse" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--th-primary)] opacity-10" />
          <div className="h-5 w-32 bg-[var(--th-bg-secondary)] rounded-md" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-[var(--th-bg-secondary)] rounded-md" />
          <div className="h-4 w-full bg-[var(--th-bg-secondary)] rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !insight) return null; // Hide if no data or error

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden" 
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--th-primary)] opacity-[0.03] blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
            <Sparkles className="w-4 h-4 text-[var(--th-primary)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--th-text)] flex items-center gap-2">
              Weekly Copilot Insight
              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold" style={{ background: 'var(--th-primary)', color: '#08080d' }}>
                {insight.topTheme}
              </span>
            </h2>
          </div>
          <button 
            onClick={() => regenerate.mutate()}
            disabled={regenerate.isPending}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}
          >
            <RefreshCw className={`w-3 h-3 ${regenerate.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        <p className="text-sm text-[var(--th-text-secondary)] mb-6 leading-relaxed font-medium">
          {insight.summary}
        </p>

        {insight.recommendations && insight.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--th-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[var(--th-primary)]" /> Actionable Advice
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insight.recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl border" style={{ background: 'var(--th-bg)', borderColor: 'var(--th-border)' }}>
                  <p className="text-[11px] font-semibold text-[var(--th-text-secondary)] leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
