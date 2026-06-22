import { motion } from 'motion/react';
import clsx from 'clsx';
import { Target, CheckCircle, Calendar, ArrowRight } from 'lucide-react';

/* ─── Card wrapper ─── */
export function DCard({ children, className, gold, ...props }) {
  return (
    <div
      className={clsx('rounded-2xl p-5 relative overflow-hidden', className)}
      style={{
        background: gold ? 'rgba(var(--th-primary-rgb), 0.06)' : 'var(--th-card)',
        border: gold ? '1px solid rgba(var(--th-primary-rgb), 0.2)' : '1px solid var(--th-border)',
        boxShadow: 'var(--th-shadow)',
      }}
      {...props}
    >
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--th-highlight)] to-transparent" />
      {children}
    </div>
  );
}

/* ─── SVG Progress Ring ─── */
export function ProgressRing({ percent = 0, size = 120, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--th-highlight)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
        stroke="url(#goldRing)" initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ strokeDasharray: c }}
      />
      <defs>
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--th-primary)" /><stop offset="100%" stopColor="var(--th-primary-dark)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Mini Sparkline ─── */
export function MiniSparkline({ data = [], color = '#10b981' }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 32, gap = w / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => `${i * gap},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

/* ─── Stat Card ─── */
export function StatCard({ title, icon: Icon, iconColor, children, gold, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <DCard gold={gold} className="h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{title}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}22` }}>
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
        </div>
        {children}
      </DCard>
    </motion.div>
  );
}

/* ─── Quick Action Button ─── */
export function ActionBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2.5 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[12px] group-hover:brightness-125 transition-colors" style={{ color: 'var(--th-text-muted)' }}>{label}</span>
    </button>
  );
}

/* ─── Upcoming item ─── */
export function UpcomingItem({ item }) {
  const icons = { goal: Target, habit: CheckCircle, event: Calendar };
  const Icon = icons[item?.type] || Calendar;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--th-text)' }}>{item.title}</p>
        <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>{item.subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
    </div>
  );
}

/* ─── Weekly Bar Chart ─── */
export function WeeklyBars({ data, className }) {
  if (!data?.length) return <div className={clsx("flex items-center justify-center text-[13px] min-h-[160px]", className)} style={{ color: 'var(--th-text-dim)' }}>No data yet</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={clsx("flex items-stretch justify-between gap-3 pt-8 min-h-[160px]", className)}>
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div key={d.day || i} className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer">
            {/* Tooltip Badge */}
            <div className={clsx(
              "absolute -top-8 px-2 py-1 rounded text-[10px] font-bold transition-all z-10 pointer-events-none",
              d.isHighest ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
            )} style={{ background: d.isHighest ? 'var(--th-primary)' : 'var(--th-text)', color: d.isHighest ? '#08080d' : 'var(--th-card)' }}>
              {d.value}%
            </div>
            
            {/* Bar Track Container */}
            <div className="w-full flex-1 rounded-full relative overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
              {/* Colored Bar Fill */}
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${Math.max(h, 4)}%` }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.6, type: 'spring', bounce: 0.2 }}
                className="absolute bottom-0 w-full rounded-full transition-colors"
                style={{ 
                  background: d.isHighest 
                    ? 'linear-gradient(to top, var(--th-primary-dark), var(--th-primary))' 
                    : 'rgba(var(--th-primary-rgb), 0.4)',
                  boxShadow: d.isHighest ? '0 0 10px rgba(var(--th-primary-rgb), 0.5)' : 'none'
                }}
              />
            </div>
            <span className={clsx("text-[11px] font-medium transition-colors", d.isHighest ? "text-[var(--th-primary)]" : "text-[var(--th-text-dim)] group-hover:text-[var(--th-text-secondary)]")}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
