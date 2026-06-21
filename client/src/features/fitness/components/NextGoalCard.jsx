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
          <Target className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-violet-950">Next Goal</h3>
        </div>
      </div>
      
      <p className="text-sm font-bold text-gray-900 mb-1">{activeGoal.title}</p>
      {activeGoal.targetDate && (
        <p className="text-[11px] text-gray-500 mb-4">Target Date: {activeGoal.targetDate}</p>
      )}

      <div className="mt-auto">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
          <div className="h-full bg-violet-600 rounded-full" style={{ width: `${activeGoal.progress || 50}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
          <span>{activeGoal.current || 'Start'}</span>
          <span>{activeGoal.target || 'Finish'}</span>
        </div>
      </div>
    </div>
  );
}
