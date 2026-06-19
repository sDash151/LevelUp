import { motion } from 'motion/react';
import { Building2, TreeDeciduous, Network, BrainCircuit, Blocks, ArrowRight } from 'lucide-react';

const TOPIC_ICONS = {
  Trees: TreeDeciduous, Graphs: Network, 'Dynamic Programming': BrainCircuit,
  'System Design': Blocks, default: Building2,
};
const TOPIC_COLORS = ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

export function DsaCompanyMode({ company, topics = [], onViewPack }) {
  if (!company) {
    return (
      <div className="rounded-2xl p-4 h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Company Mode</h3>
          <span onClick={onViewPack} className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View prep packs</span>
        </div>
        <p className="text-[11px] py-4 italic" style={{ color: 'var(--th-text-muted)' }}>
          Add an active job application in the Job Tracker to activate Company Mode.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Company Mode</h3>
        <span onClick={onViewPack} className="text-[11px] cursor-pointer" style={{ color: 'var(--th-primary)' }}>View prep packs</span>
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--th-primary-rgb), 0.12)' }}>
          <Building2 className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{company} Interview Path</p>
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Based on your active job target</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {topics.map((t, i) => {
          const IconComp = TOPIC_ICONS[t.topic] || TOPIC_ICONS.default;
          const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
          const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
          return (
            <div key={t.topic} className="flex items-center gap-2.5">
              <IconComp className="w-3.5 h-3.5 shrink-0" style={{ color }} />
              <span className="text-[12px] flex-1 min-w-0 truncate" style={{ color: 'var(--th-text)' }}>{t.topic}</span>
              <span className="text-[11px] shrink-0 w-12 text-right" style={{ color: 'var(--th-text-muted)' }}>{t.solved} / {t.total}</span>
              <div className="w-16 h-1.5 rounded-full shrink-0 overflow-hidden" style={{ background: 'var(--th-border)' }}>
                <motion.div className="h-full rounded-full" style={{ background: color }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewPack}
        className="w-full py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'var(--th-primary)', color: '#000' }}
      >
        View Full Prep Pack
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
