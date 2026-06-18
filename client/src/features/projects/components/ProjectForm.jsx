import { useState } from 'react';
import { Modal, Input, Button } from '@/design-system/components';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

const STATUSES = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PRIORITY_COLORS = { LOW: 'text-zinc-400', MEDIUM: 'text-info', HIGH: 'text-warning', CRITICAL: 'text-danger' };

export function ProjectForm({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANNING', priority: 'MEDIUM', techStack: [], githubUrl: '', liveUrl: '', startDate: '', endDate: '' });
  const [techInput, setTechInput] = useState('');

  const addTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      setForm((f) => ({ ...f, techStack: [...f.techStack, techInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTech = (t) => setForm((f) => ({ ...f, techStack: f.techStack.filter((s) => s !== t) }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const data = { ...form };
    if (!data.startDate) delete data.startDate;
    if (!data.endDate) delete data.endDate;
    if (!data.githubUrl) delete data.githubUrl;
    if (!data.liveUrl) delete data.liveUrl;
    onSubmit?.(data);
    onClose();
    setForm({ name: '', description: '', status: 'PLANNING', priority: 'MEDIUM', techStack: [], githubUrl: '', liveUrl: '', startDate: '', endDate: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project" size="lg">
      <div className="space-y-4">
        <Input label="Project Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-accent resize-none placeholder:text-zinc-600" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-2 block">Status</label>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setForm((f) => ({ ...f, status: s }))} className={clsx('px-2 py-1 rounded-lg text-[10px] font-medium transition-all', form.status === s ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]')}>{s.replace(/_/g, ' ')}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-2 block">Priority</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setForm((f) => ({ ...f, priority: p }))} className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all', form.priority === p ? 'bg-accent text-white' : 'bg-white/[0.04] hover:bg-white/[0.08]', form.priority === p ? '' : PRIORITY_COLORS[p])}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Tech Stack</label>
          <div className="flex gap-2">
            <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} placeholder="Type and press Enter" className="flex-1 bg-zinc-900/60 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-accent placeholder:text-zinc-600" />
            <button onClick={addTech} className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"><Plus className="w-4 h-4" /></button>
          </div>
          {form.techStack.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {form.techStack.map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-accent-dim text-accent font-medium">
                  {t}<button onClick={() => removeTech(t)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="GitHub URL" value={form.githubUrl} onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))} />
          <Input label="Live URL" value={form.liveUrl} onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
}
