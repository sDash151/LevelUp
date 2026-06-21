import { Trophy, Circle, CheckCircle2, Plus } from 'lucide-react';
import { useCreateMilestone } from '../hooks/useFitness';
import { useState } from 'react';

export default function MilestonesCard({ milestones = [] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('weight');
  const [targetValue, setTargetValue] = useState('');
  const createMut = useCreateMilestone();

  const handleAdd = () => {
    if (!title) return;
    createMut.mutate({ title, type, targetValue: parseFloat(targetValue) || null }, {
      onSuccess: () => { setShowAdd(false); setTitle(''); setTargetValue(''); },
    });
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Milestones</h3>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1 rounded-lg hover:bg-black/5">
          <Plus className="w-4 h-4" style={{ color: 'var(--th-text-secondary)' }} />
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 p-3 rounded-xl space-y-2" style={{ background: 'var(--th-bg-secondary)' }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bench Press 100kg"
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
          <div className="flex gap-2">
            <select value={type} onChange={e => setType(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none appearance-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}>
              <option value="weight">Weight</option><option value="lift">Lift</option><option value="body_fat">Body Fat</option><option value="endurance">Endurance</option>
            </select>
            <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="Target" className="w-20 px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }} />
          </div>
          <button onClick={handleAdd} className="w-full py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--th-primary)' }}>Add Milestone</button>
        </div>
      )}

      {milestones.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No milestones set. Create your first goal!</p>
      ) : (
        <div className="space-y-2.5">
          {milestones.slice(0, 5).map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              {m.isAchieved ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--th-text-dim)' }} />}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${m.isAchieved ? 'line-through opacity-60' : ''}`} style={{ color: 'var(--th-text)' }}>{m.title}</p>
                {m.targetValue && <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Target: {m.targetValue}</p>}
              </div>
              {m.isAchieved && <span className="text-[9px] text-emerald-500">Achieved!</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
