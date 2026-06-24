import { useState } from 'react';
import { Sparkles, ChevronRight, Check, X, Target, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/design-system/components';

export default function AIFitnessInsight({ insight, onGenerate, isGenerating, title = 'AI Fitness Insight' }) {
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const handleGenerate = async () => {
    if (!onGenerate) return;
    const previousSummary = insight?.summary;
    const result = await onGenerate();
    
    if (result.isError || result.error) {
      toast.error('AI Generation failed. The API rate limit may be exceeded. Please wait a minute and try again.', { icon: '⚠️', duration: 5000 });
    } else {
      const newSummary = result.data?.data?.insight?.summary || result.data?.summary || result.data?.data?.summary || result.data?.insight?.summary;
      const isUnchanged = result.data?.isUnchanged || result.data?.data?.insight?.isUnchanged || result.data?.insight?.isUnchanged;
      
      if (isUnchanged || (previousSummary && previousSummary === newSummary)) {
        toast.info('Insights are up to date! No new data logged since last analysis.', { icon: '✅' });
      } else {
        toast.success('AI Insights successfully generated!', { icon: '✨' });
      }
    }
  };

  if (!insight) return (
    <div className="rounded-3xl p-5 h-full flex flex-col" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-violet-500/10">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--th-text)]">{title}</h3>
      </div>
      <p className="text-xs text-[var(--th-text-secondary)] mb-4 font-medium leading-relaxed">Log a few workouts and meals to generate personalized AI insights.</p>
      
      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-violet-600 px-3 py-2.5 rounded-xl hover:bg-violet-700 transition-all w-full mt-auto shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {isGenerating ? 'Analyzing Data...' : 'Analyze My Data'}
      </button>
    </div>
  );

  const d = insight;

  return (
    <>
      <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-violet-500/10">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--th-text)]">AI Fitness Insight</h3>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="p-1.5 rounded-lg hover:bg-[var(--th-border)] transition text-[var(--th-text-secondary)] disabled:opacity-50"
            title="Refresh AI Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {d.title && <p className="text-sm font-bold text-[var(--th-text)] mb-1">{d.title}</p>}
        {d.summary && <p className="text-xs text-[var(--th-text-secondary)] mb-4 font-medium leading-relaxed">{d.summary}</p>}

        {Array.isArray(d.recommendations) && d.recommendations.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-[var(--th-text)] mb-2">Recommendations for You</p>
            <div className="space-y-2">
              {d.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-medium text-[var(--th-text-secondary)] bg-emerald-500/10 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1 text-[11px] font-semibold text-white bg-violet-500 px-3 py-2.5 rounded-lg hover:bg-violet-600 transition w-full mt-auto shadow-sm "
        >
          View All Insights <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6" 
              style={{ 
                background: 'var(--th-card-solid)', 
                border: '1px solid var(--th-border-hover)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--th-highlight) inset'
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--th-bg-secondary)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--th-text)]">{d.title || 'AI Fitness Insight'}</h2>
                    <p className="text-xs font-semibold text-[var(--th-text-dim)]">Detailed Analysis</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--th-bg-secondary)] transition">
                  <X className="w-5 h-5 text-[var(--th-text)]" />
                </button>
              </div>

              <div className="space-y-6 mt-6">
                {d.summary && (
                  <div className="relative p-5 rounded-2xl overflow-hidden border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10" />
                    <p className="relative text-sm font-medium text-[var(--th-text)] leading-relaxed">{d.summary}</p>
                  </div>
                )}

                {Array.isArray(d.observations) && d.observations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Key Observations
                    </h4>
                    <ul className="space-y-2.5">
                      {d.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[var(--th-text-secondary)] bg-[var(--th-card)]/40 p-3 rounded-xl border border-white/5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                          <span className="leading-relaxed">{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(d.weaknesses) && d.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Areas to Improve
                    </h4>
                    <ul className="space-y-2.5">
                      {d.weaknesses.map((weak, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[var(--th-text-secondary)] bg-[var(--th-card)]/40 p-3 rounded-xl border border-white/5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                          <span className="leading-relaxed">{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(d.recommendations) && d.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Actionable Recommendations
                    </h4>
                    <ul className="space-y-2.5">
                      {d.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[var(--th-text)] bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.05)]">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
