import { useState } from 'react';
import { Sparkles, ChevronRight, Check, X, Target, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/design-system/components';

export default function AIFitnessInsight({ insight, onGenerate, isGenerating, title = 'AI Fitness Insight' }) {
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const handleGenerate = async () => {
    if (!onGenerate) return;
    const result = await onGenerate();
    if (result.isError || result.error) {
      toast.error('AI Generation failed. The API rate limit may be exceeded. Please wait a minute and try again.', { icon: '⚠️', duration: 5000 });
    } else {
      toast.success('AI Insights successfully generated!', { icon: '✨' });
    }
  };

  if (!insight) return (
    <div className="rounded-3xl p-5 h-full flex flex-col" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE', boxShadow: 'var(--th-shadow)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-violet-500/10">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <h3 className="text-sm font-bold text-violet-900">{title}</h3>
      </div>
      <p className="text-xs text-violet-800 mb-4 font-medium leading-relaxed">Log a few workouts and meals to generate personalized AI insights.</p>
      
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
      <div className="rounded-2xl p-5 h-full flex flex-col" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-violet-500/10">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <h3 className="text-sm font-bold text-violet-900">AI Fitness Insight</h3>
        </div>

        {d.title && <p className="text-sm font-bold text-violet-950 mb-1">{d.title}</p>}
        {d.summary && <p className="text-xs text-violet-800 mb-4 font-medium leading-relaxed">{d.summary}</p>}

        {d.recommendations?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-violet-900 mb-2">Recommendations for You</p>
            <div className="space-y-2">
              {d.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1 text-[11px] font-semibold text-white bg-violet-500 px-3 py-2.5 rounded-lg hover:bg-violet-600 transition w-full mt-auto shadow-sm shadow-violet-200"
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
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl" 
              style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-200 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-violet-950">{d.title || 'AI Fitness Insight'}</h2>
                    <p className="text-xs font-semibold text-violet-700">Detailed Analysis</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-violet-200 transition">
                  <X className="w-5 h-5 text-violet-900" />
                </button>
              </div>

              <div className="space-y-5">
                {d.summary && (
                  <div className="p-4 rounded-xl bg-violet-500/10">
                    <p className="text-sm font-medium text-violet-900 leading-relaxed">{d.summary}</p>
                  </div>
                )}

                {d.observations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-violet-600" /> Key Observations
                    </h4>
                    <ul className="space-y-2">
                      {d.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-violet-800 bg-white/50 p-2.5 rounded-lg border border-violet-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {d.weaknesses?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-violet-600" /> Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {d.weaknesses.map((weak, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-violet-800 bg-white/50 p-2.5 rounded-lg border border-violet-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {d.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-violet-600" /> Actionable Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {d.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
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
