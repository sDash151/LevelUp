import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/design-system/components';
import { Plus, X, Heart, Dumbbell, BookOpen, Briefcase, Star } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
  { key: 'HEALTH', label: 'Health', emoji: '❤️', icon: Heart, color: '#ef4444' },
  { key: 'FITNESS', label: 'Fitness', emoji: '💪', icon: Dumbbell, color: '#10b981' },
  { key: 'LEARNING', label: 'Learning', emoji: '📚', icon: BookOpen, color: '#f59e0b' },
  { key: 'CAREER', label: 'Career', emoji: '💼', icon: Briefcase, color: '#6366f1' },
  { key: 'PERSONAL', label: 'Personal', emoji: '⭐', icon: Star, color: '#E8B94A' },
];

const defaultForm = () => ({
  title: '', description: '', type: 'WEEKLY', category: 'PERSONAL',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  milestones: [{ title: '' }],
});

export function GoalForm({ isOpen, onClose, onSubmit, goal }) {
  const [form, setForm] = useState(defaultForm());

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title ?? '',
        description: goal.description ?? '',
        type: goal.type ?? 'WEEKLY',
        category: goal.category ?? 'PERSONAL',
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        milestones: goal.milestones?.length ? goal.milestones.map(m => ({ title: m.title })) : [{ title: '' }],
      });
    } else {
      setForm(defaultForm());
    }
  }, [goal, isOpen]);

  const addMilestone = () => setForm((f) => ({ ...f, milestones: [...f.milestones, { title: '' }] }));

  const removeMilestone = (i) =>
    setForm((f) => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));

  const updateMilestone = (i, value) =>
    setForm((f) => ({ ...f, milestones: f.milestones.map((m, idx) => (idx === i ? { title: value } : m)) }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      ...form,
      milestones: form.milestones.filter((m) => m.title.trim()),
    };
    onSubmit?.(data);
    onClose();
    setForm(defaultForm());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'} size="md">
      <div className="space-y-5">
        <Input label="Goal Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-muted)' }}>Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition-colors"
            style={{
              background: 'var(--th-input)',
              border: '1px solid var(--th-border)',
              color: 'var(--th-text)',
            }}
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-muted)' }}>Category</label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setForm((f) => ({ ...f, category: cat.key }))}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-all"
                style={{
                  background: form.category === cat.key ? cat.color + '18' : 'var(--th-highlight)',
                  border: `1.5px solid ${form.category === cat.key ? cat.color : 'transparent'}`,
                  color: form.category === cat.key ? cat.color : 'var(--th-text-muted)',
                }}>
                <span className="text-base">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Toggle */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-muted)' }}>Type</label>
          <div className="flex gap-2">
            {['WEEKLY', 'MONTHLY'].map((t) => (
              <button key={t} onClick={() => {
                  const days = t === 'WEEKLY' ? 7 : 30;
                  setForm((f) => ({ ...f, type: t, endDate: new Date(Date.now() + days * 86400000).toISOString().split('T')[0] }));
                }}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: form.type === t ? 'var(--th-primary)' : 'var(--th-highlight)',
                  color: form.type === t ? '#08080d' : 'var(--th-text-muted)',
                }}>
                {t === 'WEEKLY' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>Start Date</label>
            <input type="date" value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>End Date</label>
            <input type="date" value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-muted)' }}>Milestones</label>
          <div className="space-y-2">
            {form.milestones.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={`Milestone ${i + 1}`} value={m.title}
                  onChange={(e) => updateMilestone(i, e.target.value)}
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
                />
                {form.milestones.length > 1 && (
                  <button onClick={() => removeMilestone(i)} className="p-2 transition-colors" style={{ color: 'var(--th-text-dim)' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addMilestone} className="mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--th-primary)' }}>
            <Plus className="w-3.5 h-3.5" /> Add milestone
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>{goal ? 'Save Changes' : 'Create Goal'}</Button>
        </div>
      </div>
    </Modal>
  );
}
