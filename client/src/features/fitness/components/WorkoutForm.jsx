import { useState } from 'react';
import { Modal, Input, Button } from '@/design-system/components';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

const TYPES = ['STRENGTH', 'CARDIO', 'HIIT', 'YOGA', 'FLEXIBILITY', 'SPORTS', 'OTHER'];

export function WorkoutForm({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'STRENGTH', name: '', duration: 45, caloriesBurned: 0, notes: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }], date: new Date().toISOString().split('T')[0] });

  const addExercise = () => setForm((f) => ({ ...f, exercises: [...f.exercises, { name: '', sets: 3, reps: 10, weight: 0 }] }));
  const removeExercise = (i) => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));
  const updateExercise = (i, field, value) => setForm((f) => ({ ...f, exercises: f.exercises.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = { ...form, duration: parseInt(form.duration) || 45, caloriesBurned: parseInt(form.caloriesBurned) || 0, exercises: form.exercises.filter((e) => e.name.trim()).map((e) => ({ ...e, sets: parseInt(e.sets) || 0, reps: parseInt(e.reps) || 0, weight: parseFloat(e.weight) || 0 })) };
    onSubmit?.(data);
    onClose();
    setForm({ type: 'STRENGTH', name: '', duration: 45, caloriesBurned: 0, notes: '', exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }], date: new Date().toISOString().split('T')[0] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Workout" size="lg">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Type</label>
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} className={clsx('px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all', form.type === t ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{t}</button>
            ))}
          </div>
        </div>

        <Input label="Workout Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Duration (min)</label>
            <input type="number" min="1" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Calories</label>
            <input type="number" min="0" value={form.caloriesBurned} onChange={(e) => setForm((f) => ({ ...f, caloriesBurned: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
        </div>

        {/* Exercises */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Exercises</label>
          <div className="space-y-2">
            {form.exercises.map((ex, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input placeholder="Exercise name" value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)} className="flex-1 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-accent placeholder:text-zinc-600" />
                <input type="number" placeholder="Sets" value={ex.sets || ''} onChange={(e) => updateExercise(i, 'sets', e.target.value)} className="w-14 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-2 py-2 text-sm text-white/90 outline-none focus:border-accent text-center" />
                <span className="text-zinc-600 text-xs">×</span>
                <input type="number" placeholder="Reps" value={ex.reps || ''} onChange={(e) => updateExercise(i, 'reps', e.target.value)} className="w-14 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-2 py-2 text-sm text-white/90 outline-none focus:border-accent text-center" />
                <input type="number" placeholder="kg" value={ex.weight || ''} onChange={(e) => updateExercise(i, 'weight', e.target.value)} className="w-16 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-2 py-2 text-sm text-white/90 outline-none focus:border-accent text-center" />
                {form.exercises.length > 1 && <button onClick={() => removeExercise(i)} className="p-1 text-zinc-600 hover:text-danger"><X className="w-4 h-4" /></button>}
              </div>
            ))}
          </div>
          <button onClick={addExercise} className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"><Plus className="w-3.5 h-3.5" /> Add exercise</button>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="PRs, how you felt..." className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent resize-none placeholder:text-zinc-600" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Log Workout</Button>
        </div>
      </div>
    </Modal>
  );
}
