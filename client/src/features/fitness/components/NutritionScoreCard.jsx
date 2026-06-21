import { useState } from 'react';
import { Info, Check, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useToast, Modal } from '@/design-system/components';

function SemiCircleGauge({ score = 0, size = 150, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * Math.PI;
  const pct = Math.max(0, Math.min(100, score));
  
  // The length of the filled dash
  const dashLength = (pct / 100) * circumference;

  let color = '#10B981';
  let label = 'Excellent';
  if (score < 60) { color = '#EF4444'; label = 'Needs Work'; }
  else if (score < 80) { color = '#F59E0B'; label = 'Good'; }

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + stroke / 2 + 24 }}>
      <svg width={size} height={size / 2 + stroke / 2} className="overflow-visible">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Background Track */}
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={stroke} strokeLinecap="round"
        />
        {/* Score Track */}
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none" stroke="url(#scoreGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dashLength} ${circumference}`} strokeDashoffset={0} className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Numbers inside the arc */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center justify-end" style={{ height: size / 2 }}>
        <span className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: 'var(--th-text)' }}>{score}</span>
        <span className="text-[10px] font-bold mt-1" style={{ color: 'var(--th-text-dim)' }}>/ 100</span>
      </div>
      {/* Label below the arc */}
      <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: size / 2 + stroke / 2 + 4 }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

export default function NutritionScoreCard({ score }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  if (!score) return null;
  const s = score.score || 0;
  
  const feedbackList = score.feedback || [];

  return (
    <>
      <div className="rounded-3xl p-5 h-full flex flex-col justify-between" style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)', boxShadow: 'var(--th-shadow)' }}>
        <div className="flex items-center gap-1.5 mb-5 group relative">
          <h3 className="text-sm font-bold" style={{ color: 'var(--th-text)' }}>Nutrition Score</h3>
          <Info className="w-3.5 h-3.5 cursor-help" style={{ color: 'var(--th-text-muted)' }} />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl text-[10px] font-medium shadow-xl z-10 pointer-events-none" style={{ background: 'var(--th-card)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }}>
            An overall score out of 100 based on how well you're meeting your daily macronutrient and micronutrient goals.
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <SemiCircleGauge score={s} />
          </div>

          {/* Feedback List */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {feedbackList.length > 0 ? (
              feedbackList.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-semibold leading-snug break-words" style={{ color: 'var(--th-text-secondary)' }}>{f}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] italic" style={{ color: 'var(--th-text-muted)' }}>
                Log meals to generate nutrition feedback.
              </p>
            )}
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
          View Recommendations
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Personalized Recommendations" size="md">
        <div className="space-y-6 pb-2">
          {/* Score Header inside Modal */}
          <div className="flex items-center justify-center py-6 rounded-2xl" style={{ background: 'var(--th-bg)' }}>
             <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--th-text-dim)' }}>Daily Score</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black" style={{ color: 'var(--th-text)' }}>{s}</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--th-text-muted)' }}>/ 100</span>
                </div>
             </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--th-text)' }}>Actionable Feedback</h3>
            {feedbackList.length > 0 ? (
              <div className="space-y-3">
                {feedbackList.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                      <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium leading-relaxed" style={{ color: 'var(--th-text)' }}>{f}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--th-border)' }}>
                <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--th-text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--th-text-secondary)' }}>Not enough data to generate recommendations. Log more meals!</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
