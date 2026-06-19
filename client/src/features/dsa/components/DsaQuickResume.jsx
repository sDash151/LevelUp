import { motion } from 'motion/react';
import { ArrowRight, Code2 } from 'lucide-react';

export function DsaQuickResume({ pathName, topic, nextProblem, eta, onResume }) {
  if (!nextProblem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'linear-gradient(135deg, rgba(var(--th-primary-rgb), 0.08), rgba(var(--th-primary-rgb), 0.02))', border: '1px solid var(--th-border)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(var(--th-primary-rgb), 0.15)' }}>
        <Code2 className="w-5 h-5" style={{ color: 'var(--th-primary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--th-primary)' }}>Continue where you left off</p>
        <p className="text-[13px] font-semibold mt-0.5 truncate" style={{ color: 'var(--th-text)' }}>{pathName}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
          {topic} · <span style={{ color: 'var(--th-text)' }}>{nextProblem.title}</span> · {eta} min
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResume?.();
        }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
        style={{ background: 'var(--th-primary)', color: '#000' }}
      >
        Resume
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
