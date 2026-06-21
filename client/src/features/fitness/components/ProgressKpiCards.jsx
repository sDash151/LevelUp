import { Scale, Percent, Dumbbell, Camera, ArrowDown, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

// A simple utility to render an aesthetic sparkline
const Sparkline = ({ color, positive, isPhotos }) => {
  if (isPhotos) return null; // Handled differently

  // Create a visually pleasing path based on whether the trend is good (positive) or bad
  const points = positive 
    ? "0,20 10,18 20,22 30,15 40,16 50,8 60,10 70,2" // Trending 'down' or 'better' (e.g. weight loss)
    : "0,20 10,22 20,18 30,25 40,24 50,30 60,28 70,35"; // Trending 'up' or 'worse'
  
  // Actually wait, muscle mass positive means it goes UP. Weight positive means it goes DOWN.
  // We'll just generate an SVG curve that roughly matches the design sparklines.
  const pathData = positive ? "M 0 25 Q 10 20, 20 22 T 40 15 T 60 10 T 80 5" : "M 0 10 Q 10 15, 20 12 T 40 20 T 60 25 T 80 30";
  // The design has simple zig-zags with a gradient fill under it.
  const zigZag = positive ? "0,25 15,18 30,22 45,10 60,14 80,5" : "0,10 15,15 30,12 45,22 60,20 80,30";

  return (
    <svg width="80" height="40" viewBox="0 0 80 40" className="opacity-80">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${zigZag} 80,40 0,40`} fill={`url(#grad-${color})`} />
      <polyline points={zigZag} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy={positive ? "5" : "30"} r="3" fill={color} />
    </svg>
  );
};

export default function ProgressKpiCards({ kpis }) {
  if (!kpis) return null;

  const formatVal = (val) => typeof val === 'number' ? Number(val.toFixed(1)) : val;

  const cards = [
    { label: 'Weight', value: formatVal(kpis.weight?.current) || '--', unit: 'kg', change: formatVal(kpis.weight?.change), icon: Scale, color: '#10B981', positive: kpis.weight?.change <= 0 },
    { label: 'Body Fat', value: formatVal(kpis.bodyFat?.current) || '--', unit: '%', change: formatVal(kpis.bodyFat?.change), icon: Percent, color: '#F97316', positive: kpis.bodyFat?.change <= 0 },
    { label: 'Muscle Mass', value: formatVal(kpis.muscleMass?.current) || '--', unit: 'kg', change: formatVal(kpis.muscleMass?.change), icon: Dumbbell, color: '#8B5CF6', positive: kpis.muscleMass?.change >= 0 },
    { label: 'Progress Photos', value: kpis.photos?.count || 0, unit: '', icon: Camera, color: '#F59E0B', isPhotos: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const changeAbs = card.change ? Math.abs(card.change) : 0;
        const isBetter = card.positive;

        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl p-5 shadow-sm" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{card.label}</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--th-text)' }}>
                  {card.value} {card.unit && <span className="text-sm font-semibold opacity-60 ml-0.5">{card.unit}</span>}
                </p>
                
                {!card.isPhotos ? (
                  <div className="flex items-center gap-1.5">
                    {card.change != null && card.change !== 0 ? (
                      <>
                        <div className={`flex items-center gap-0.5 text-[11px] font-bold ${isBetter ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isBetter ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                          {changeAbs} {card.unit}
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>vs last month</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>No change vs last month</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>Photos logged</span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>This month</span>
                  </div>
                )}
              </div>

              {!card.isPhotos && (
                <div className="flex-shrink-0 mb-2">
                  <Sparkline color={card.color} positive={isBetter} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
