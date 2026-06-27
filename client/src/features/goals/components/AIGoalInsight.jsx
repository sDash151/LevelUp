import { Sparkles, Activity, Target, RefreshCw } from 'lucide-react';
import { useGoalAiInsight, useRegenerateGoalAiInsight } from '../hooks/useGoals';
import { motion } from 'motion/react';

export function AIGoalInsight() {
  const { data: insight, isLoading, error } = useGoalAiInsight();
  const regenerate = useRegenerateGoalAiInsight();

  if (isLoading) {
    return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden lg:block rounded-2xl p-5 mb-6 animate-pulse" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--th-primary)] opacity-10" />
            <div className="h-5 w-40 bg-[var(--th-bg-secondary)] rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-[var(--th-bg-secondary)] rounded-md" />
            <div className="h-4 w-1/2 bg-[var(--th-bg-secondary)] rounded-md" />
          </div>
        </div>
        {/* Mobile Skeleton */}
        <div className="lg:hidden glass-card rounded-[20px] p-5 mb-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--th-primary)] opacity-10" />
            <div className="flex flex-col gap-2">
               <div className="h-5 w-32 bg-[var(--th-highlight)] rounded-md" />
               <div className="h-3 w-20 bg-[var(--th-highlight)] rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[var(--th-highlight)] rounded-md" />
            <div className="h-4 w-3/4 bg-[var(--th-highlight)] rounded-md" />
          </div>
        </div>
      </>
    );
  }

  if (error || !insight) return null;

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP VIEW (Untouched)
          ══════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden" 
        style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--th-primary)] opacity-[0.03] blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--th-bg-secondary)' }}>
              <Sparkles className="w-4 h-4 text-[var(--th-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--th-text)] flex items-center gap-2">
                Execution Copilot
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
                <Target className="w-3.5 h-3.5 text-[var(--th-primary)]" /> Action Plan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insight.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl border flex items-start gap-2" style={{ background: 'var(--th-bg)', borderColor: 'var(--th-border)' }}>
                    <Activity className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--th-text-dim)]" />
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

      {/* ══════════════════════════════════════
          MOBILE VIEW (Premium Native)
          ══════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden glass-card rounded-[20px] p-5 mb-5 shadow-elevated relative overflow-hidden" 
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--th-primary)] opacity-[0.06] blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-sm" style={{ background: 'var(--th-highlight)' }}>
                <Sparkles className="w-5 h-5 text-[var(--th-primary)]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[16px] font-black tracking-tight text-[var(--th-text)] leading-none">
                  Execution Copilot
                </h2>
                <div className="flex mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black shadow-sm" style={{ background: 'var(--th-primary)', color: '#08080d' }}>
                    {insight.topTheme}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => regenerate.mutate()}
              disabled={regenerate.isPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-sm"
              style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}
            >
              <RefreshCw className={`w-4 h-4 ${regenerate.isPending ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-[13px] text-[var(--th-text-secondary)] mb-5 leading-relaxed font-medium">
            {insight.summary}
          </p>

          {insight.recommendations && insight.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[var(--th-primary)]" /> 
                <h4 className="text-[11px] font-black text-[var(--th-text)] uppercase tracking-widest">
                  Action Plan
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {insight.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl flex items-start gap-3 transition-colors glass" style={{ border: '1px solid var(--th-border)' }}>
                    <div className="mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--th-highlight)' }}>
                       <Activity className="w-3.5 h-3.5 text-[var(--th-primary)]" />
                    </div>
                    <p className="text-[12px] font-medium text-[var(--th-text)] leading-snug">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
