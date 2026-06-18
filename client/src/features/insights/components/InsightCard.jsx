import { motion } from 'motion/react';
import { Card } from '@/design-system/components';
import { TrendingUp, AlertTriangle, Info, Lightbulb, Sparkles, CheckCircle2, Target, Code2, Briefcase, Dumbbell, Wallet, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const typeConfig = {
  success: { icon: TrendingUp, bg: 'bg-success-dim', text: 'text-success', border: 'border-success/20' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-dim', text: 'text-warning', border: 'border-warning/20' },
  info: { icon: Info, bg: 'bg-info-dim', text: 'text-info', border: 'border-info/20' },
  tip: { icon: Lightbulb, bg: 'bg-accent-dim', text: 'text-accent', border: 'border-accent/20' },
};

const categoryIcons = {
  habits: CheckCircle2, goals: Target, dsa: Code2, jobs: Briefcase,
  fitness: Dumbbell, finance: Wallet, reflections: BookOpen, projects: Sparkles,
};

export function InsightCard({ insight, index }) {
  const config = typeConfig[insight.type] || typeConfig.info;
  const CategoryIcon = categoryIcons[insight.category] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card className={clsx('border-l-2', config.border)}>
        <div className="flex items-start gap-3">
          <div className={clsx('p-2 rounded-xl shrink-0', config.bg)}>
            <config.icon className={clsx('w-4 h-4', config.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
              <CategoryIcon className="w-3 h-3 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{insight.description}</p>
          </div>
          {insight.metric && insight.metric !== '0' && (
            <div className={clsx('stat-number text-lg font-bold shrink-0', config.text)}>
              {insight.metric}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
