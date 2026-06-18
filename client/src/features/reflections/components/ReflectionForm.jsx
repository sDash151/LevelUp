import { useState, useEffect } from 'react';
import { Modal, Button } from '@/design-system/components';
import { X } from 'lucide-react';
import clsx from 'clsx';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
];

const SUGGESTED_TAGS = [
  'Productivity', 'Health', 'Gratitude', 'Family', 'Learning',
  'Work', 'Self Improvement', 'Mental Health', 'Fitness', 'Career',
];

export function ReflectionForm({ isOpen, onClose, onSubmit, reflection }) {
  const isEditing = !!reflection;

  const [form, setForm] = useState({
    type: 'DAILY', title: '', content: '', mood: 4, tags: [],
    gratitude: '', improvements: '', date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (reflection) {
      setForm({
        type: reflection.type || 'DAILY',
        title: reflection.title || '',
        content: reflection.content || '',
        mood: reflection.mood || 4,
        tags: reflection.tags || [],
        gratitude: reflection.gratitude || '',
        improvements: reflection.improvements || '',
        date: reflection.date ? new Date(reflection.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setForm({
        type: 'DAILY', title: '', content: '', mood: 4, tags: [],
        gratitude: '', improvements: '', date: new Date().toISOString().split('T')[0],
      });
    }
  }, [reflection, isOpen]);

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleSave = () => {
    if (!form.content.trim()) return;
    onSubmit?.(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Reflection' : 'New Reflection'} size="lg">
      <div className="space-y-5">
        {/* Type */}
        <div className="flex gap-2">
          {['DAILY', 'WEEKLY', 'MONTHLY'].map((t) => (
            <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-all')}
              style={{
                background: form.type === t ? 'var(--th-primary)' : 'var(--th-highlight)',
                color: form.type === t ? '#08080d' : 'var(--th-text-muted)',
              }}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>Title (optional)</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Give your reflection a title..."
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              background: 'var(--th-input)',
              border: '1px solid var(--th-border)',
              color: 'var(--th-text)',
            }}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="text-xs font-medium mb-3 block" style={{ color: 'var(--th-text-muted)' }}>How are you feeling?</label>
          <div className="flex justify-between gap-2">
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => setForm((f) => ({ ...f, mood: m.value }))}
                className="flex flex-col items-center gap-1 flex-1 py-3 rounded-xl transition-all"
                style={{
                  background: form.mood === m.value ? 'rgba(232,185,74,0.15)' : 'var(--th-highlight)',
                  border: form.mood === m.value ? '1px solid var(--th-primary)' : '1px solid transparent',
                  transform: form.mood === m.value ? 'scale(1.05)' : 'scale(1)',
                }}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>Reflection</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={4}
            placeholder="How was your day? What did you accomplish? What challenged you?"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: 'var(--th-input)',
              border: '1px solid var(--th-border)',
              color: 'var(--th-text)',
            }}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--th-text-muted)' }}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: form.tags.includes(tag) ? 'var(--th-primary)' : 'var(--th-highlight)',
                  color: form.tags.includes(tag) ? '#08080d' : 'var(--th-text-muted)',
                }}>
                {tag}
                {form.tags.includes(tag) && <span className="ml-1">✕</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Gratitude & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>Gratitude ✨</label>
            <textarea
              value={form.gratitude}
              onChange={(e) => setForm((f) => ({ ...f, gratitude: e.target.value }))}
              rows={2}
              placeholder="What are you grateful for?"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--th-text-muted)' }}>Improvements 🎯</label>
            <textarea
              value={form.improvements}
              onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))}
              rows={2}
              placeholder="What could you improve?"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 py-2.5 rounded-xl text-sm font-medium" onClick={onClose}
            style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>Cancel</button>
          <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold" onClick={handleSave}
            style={{ background: 'var(--th-primary)', color: '#08080d' }}>
            {isEditing ? 'Update Reflection' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
