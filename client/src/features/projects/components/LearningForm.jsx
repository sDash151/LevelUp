import { useState } from 'react';
import { Modal, Select } from '../../../design-system/components';
import { useProjects, useCreateLearning } from '../hooks/useProjects';
import { Loader2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'learning', label: 'Learning / Insight' },
  { value: 'bug', label: 'Bug / Issue' },
  { value: 'architecture', label: 'Architecture Decision' },
  { value: 'pattern', label: 'Design Pattern' },
];

export function LearningForm({ isOpen, onClose }) {
  const { data: projectsData } = useProjects({});
  const projects = projectsData?.data || [];
  
  const createLearning = useCreateLearning();

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    type: 'learning',
    description: '',
    tags: '',
    impactScore: 5,
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        type: formData.type,
        description: formData.description.trim(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        impactScore: Number(formData.impactScore),
      };

      await createLearning.mutateAsync({ projectId: formData.projectId, data: payload });
      
      // Reset form on success
      setFormData({
        projectId: '',
        title: '',
        type: 'learning',
        description: '',
        tags: '',
        impactScore: 5,
      });
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create learning');
    }
  };

  const projectOptions = projects.map(p => ({ value: p.id, label: p.title }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500/30";
  const inputStyle = { background: 'var(--th-input)', color: 'var(--th-text)', border: '1px solid var(--th-border)' };
  const labelCls = "text-[12px] font-medium mb-1.5 block";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Capture Learning" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Project *</label>
            <Select
              options={[{ value: '', label: 'Select a project...' }, ...projectOptions]}
              value={formData.projectId}
              onChange={(val) => setFormData(f => ({ ...f, projectId: val }))}
              className="w-full h-[42px]"
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Type</label>
            <Select
              options={TYPE_OPTIONS}
              value={formData.type}
              onChange={(val) => setFormData(f => ({ ...f, type: val }))}
              className="w-full h-[42px]"
            />
          </div>
        </div>

        <div>
          <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Title *</label>
          <input
            placeholder="What did you learn or solve?"
            value={formData.title}
            onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Description</label>
          <textarea
            className={inputCls + ' resize-none'}
            style={{ ...inputStyle, minHeight: '96px' }}
            placeholder="Provide more context, links, or code snippets..."
            value={formData.description}
            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Tags (comma separated)</label>
            <input
              placeholder="e.g. react, performance"
              value={formData.tags}
              onChange={(e) => setFormData(f => ({ ...f, tags: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>
              Impact Score (1-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.impactScore}
                onChange={(e) => setFormData(f => ({ ...f, impactScore: e.target.value }))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-sm font-bold w-6 text-center tabular-nums" style={{ color: 'var(--th-text)' }}>
                {formData.impactScore}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ color: 'var(--th-text-dim)' }}>
            Cancel
          </button>
          <button type="submit" disabled={createLearning.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--th-primary)' }}>
            {createLearning.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Learning
          </button>
        </div>
      </form>
    </Modal>
  );
}
