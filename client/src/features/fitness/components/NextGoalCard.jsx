import { Target } from 'lucide-react';

export default function NextGoalCard({ milestones = [] }) {
  const activeGoal = milestones.find(m => !m.isAchieved) || {
    title: 'Reach 12% Body Fat',
    targetDate: 'Aug 20, 2026',
    progress: 40,
    current: '14.2%',
    target: '12%',
  };

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/10">
          <Target className="w-4 h-4 text-violet-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--th-text)]">Next Goal</h3>
        </div>
      </div>
      
      <p className="text-sm font-bold text-[var(--th-text)] mb-1">{activeGoal.title}</p>
      {activeGoal.targetDate && (
        <p className="text-[11px] text-[var(--th-text-secondary)] mb-4">Target Date: {activeGoal.targetDate}</p>
      )}

      <div className="mt-auto">
        <div className="h-2 rounded-full bg-[var(--th-bg-secondary)] overflow-hidden mb-2">
          <div className="h-full bg-violet-600 rounded-full" style={{ width: `${activeGoal.progress || 50}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] font-medium text-[var(--th-text-secondary)]">
          <span>{activeGoal.current || 'Start'}</span>
          <span>{activeGoal.target || 'Finish'}</span>
        </div>
      </div>
    </div>
  );
}
