import { useState, useEffect } from 'react';
import { Modal, Button } from '@/design-system/components';
import clsx from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];
const CATEGORIES = ['general', 'mindfulness', 'fitness', 'learning', 'career', 'health'];
const CATEGORY_ICONS = {
  general: '✦', mindfulness: '🧘', fitness: '💪', learning: '📚', career: '💼', health: '❤️',
};

export function HabitForm({ isOpen, onClose, habit = null, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'general',
    color: COLORS[0],
    icon: 'check-circle',
    frequency: 'DAILY',
  });

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name || '',
        description: habit.description || '',
        category: habit.category || 'general',
        color: habit.color || COLORS[0],
        icon: habit.icon || 'check-circle',
        frequency: habit.frequency || 'DAILY',
      });
    } else {
      setForm({ name: '', description: '', category: 'general', color: COLORS[0], icon: 'check-circle', frequency: 'DAILY' });
    }
  }, [habit, isOpen]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSubmit?.(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={habit ? 'Edit Habit' : 'New Habit'} size="md">
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-secondary)' }}>Habit Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Morning Meditation"
            className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={{
              background: 'var(--th-input)',
              border: '1px solid var(--th-border)',
              color: 'var(--th-text)',
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-secondary)' }}>Description (optional)</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Why is this habit important?"
            className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-secondary)' }}>Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: form.category === c ? 'rgba(var(--th-primary-rgb), 0.15)' : 'var(--th-highlight)',
                  border: form.category === c ? '1px solid rgba(var(--th-primary-rgb), 0.4)' : '1px solid var(--th-border)',
                  color: form.category === c ? 'var(--th-primary)' : 'var(--th-text-muted)',
                }}>
                <span>{CATEGORY_ICONS[c]}</span>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-secondary)' }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={clsx('w-8 h-8 rounded-full transition-all', form.color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105')}
                style={{ backgroundColor: c, ringColor: c, '--tw-ring-offset-color': 'var(--th-bg)' }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-secondary)' }}>Frequency</label>
          <div className="flex gap-2">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((f) => (
              <button key={f} onClick={() => setForm((s) => ({ ...s, frequency: f }))}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: form.frequency === f ? 'var(--th-primary)' : 'var(--th-highlight)',
                  color: form.frequency === f ? '#08080d' : 'var(--th-text-muted)',
                }}>
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'var(--th-primary)', color: '#08080d' }}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
