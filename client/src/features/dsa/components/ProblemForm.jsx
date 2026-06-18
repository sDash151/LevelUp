import { useState } from 'react';
import { Modal, Input, Button } from '@/design-system/components';
import clsx from 'clsx';

const PLATFORMS = ['LeetCode', 'HackerRank', 'Codeforces', 'CodeChef', 'GeeksforGeeks'];
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Stack', 'Queue', 'Heap', 'Backtracking', 'Greedy', 'Math', 'Bit Manipulation'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const STATUSES = ['TODO', 'ATTEMPTED', 'SOLVED', 'REVISIT'];

export function ProblemForm({ isOpen, onClose, problem = null, onSubmit }) {
  const [form, setForm] = useState({
    title: problem?.title || '', platform: problem?.platform || 'LeetCode',
    difficulty: problem?.difficulty || 'MEDIUM', topic: problem?.topic || 'Arrays',
    status: problem?.status || 'TODO', url: problem?.url || '', notes: problem?.notes || '',
    timeSpent: problem?.timeSpent || 0, rating: problem?.rating || 0,
  });

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSubmit?.(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={problem ? 'Edit Problem' : 'Log Problem'} size="md">
      <div className="space-y-4">
        <Input label="Problem Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <Input label="URL (optional)" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Platform</label>
            <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent">
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Topic</label>
            <select value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent">
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setForm((f) => ({ ...f, difficulty: d }))} className={clsx(
                'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                form.difficulty === d
                  ? d === 'EASY' ? 'bg-success/20 text-success ring-1 ring-success/30' : d === 'MEDIUM' ? 'bg-warning/20 text-warning ring-1 ring-warning/30' : 'bg-danger/20 text-danger ring-1 ring-danger/30'
                  : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
              )}>{d}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Status</label>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))} className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                form.status === s ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]'
              )}>{s.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Time Spent (min)</label>
            <input type="number" min="0" value={form.timeSpent} onChange={(e) => setForm((f) => ({ ...f, timeSpent: parseInt(e.target.value) || 0 }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Confidence (1-5)</label>
            <input type="number" min="1" max="5" value={form.rating || ''} onChange={(e) => setForm((f) => ({ ...f, rating: parseInt(e.target.value) || 0 }))} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Approach, key insight, complexity..." className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:border-accent resize-none placeholder:text-zinc-600" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>{problem ? 'Update' : 'Log Problem'}</Button>
        </div>
      </div>
    </Modal>
  );
}
