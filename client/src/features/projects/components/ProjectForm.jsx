import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, PenTool, ArrowLeft, X, Loader2 } from 'lucide-react';
import { Modal } from '@/design-system/components';
import { useCreateProject, useUpdateProject, useGithubRepos } from '../hooks/useProjects';
import { getGithubLoginUrl } from '../api';
import { useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'IDEA', label: 'Idea' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'BUILDING', label: 'Building' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'SHIPPED', label: 'Shipped' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function ProjectForm({ isOpen, onClose, initialData }) {
  const isEditMode = !!initialData;
  const [step, setStep] = useState(isEditMode ? 'manual' : 'choose');
  const [form, setForm] = useState({
    title: '', description: '', stack: '', status: 'IDEA', priority: 'MEDIUM',
    repoUrl: '', liveUrl: '', deadline: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setStep('manual');
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        stack: initialData.stack ? initialData.stack.join(', ') : '',
        status: initialData.status || 'IDEA',
        priority: initialData.priority || 'MEDIUM',
        repoUrl: initialData.repoUrl || '',
        liveUrl: initialData.liveUrl || '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
      });
    } else if (isOpen && !initialData) {
      setStep('choose');
      setForm({ title: '', description: '', stack: '', status: 'IDEA', priority: 'MEDIUM', repoUrl: '', liveUrl: '', deadline: '' });
    }
  }, [isOpen, initialData]);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: githubData } = useGithubRepos();
  const repos = githubData?.data?.repos || githubData?.repos || [];
  const isConnected = repos.length > 0;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
      deadline: form.deadline || undefined,
    };
    
    if (isEditMode) {
      updateProject.mutate({ id: initialData.id, data: payload }, { onSuccess: handleClose });
    } else {
      createProject.mutate(payload, { onSuccess: handleClose });
    }
  };

  const handleGithubImport = (repo) => {
    setForm({
      ...form,
      title: repo.name,
      description: repo.description || '',
      stack: repo.language ? repo.language : '',
      repoUrl: repo.url,
      liveUrl: '',
      githubRepoId: String(repo.id),
      status: 'BUILDING',
      priority: 'MEDIUM',
    });
    setStep('manual');
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500/30";
  const inputStyle = { background: 'var(--th-input)', color: 'var(--th-text)', border: '1px solid var(--th-border)' };
  const labelCls = "text-[12px] font-medium mb-1.5 block";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" maxWidth="max-w-lg">
      <AnimatePresence mode="wait">
        {step === 'choose' && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--th-text)' }}>New Project</h2>
            <p className="text-[13px] mb-6" style={{ color: 'var(--th-text-secondary)' }}>Choose how you want to start building something amazing.</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => isConnected ? setStep('github') : (window.location.href = getGithubLoginUrl())}
                className="p-6 rounded-2xl text-left transition-all hover:-translate-y-1"
                style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
              >
                <Github className="w-8 h-8 mb-3" style={{ color: 'var(--th-text)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--th-text)' }}>Connect GitHub Repo</p>
                <p className="text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>Import from your existing repositories.</p>
              </button>

              <button
                onClick={() => setStep('manual')}
                className="p-6 rounded-2xl text-left transition-all hover:-translate-y-1"
                style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
              >
                <PenTool className="w-8 h-8 mb-3" style={{ color: 'var(--th-text)' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--th-text)' }}>Create Manually</p>
                <p className="text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>Add project details manually.</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'github' && (
          <motion.div key="github" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep('choose')} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--th-text-dim)' }}><ArrowLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>Select Repository</h2>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto hide-scrollbar">
              {repos.length === 0 && <p className="text-sm italic py-8 text-center" style={{ color: 'var(--th-text-dim)' }}>No repositories found.</p>}
              {repos.map(repo => (
                <button key={repo.id} onClick={() => handleGithubImport(repo)}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}>
                  <Github className="w-5 h-5 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{repo.full_name || repo.name}</p>
                    {repo.description && <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--th-text-dim)' }}>{repo.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      {repo.language && <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--th-primary)' }}>{repo.language}</span>}
                      {repo.stargazers_count > 0 && <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>⭐ {repo.stargazers_count}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              {!isEditMode && <button onClick={() => setStep('choose')} className="p-1 rounded-lg" style={{ color: 'var(--th-text-dim)' }}><ArrowLeft className="w-5 h-5" /></button>}
              <h2 className="text-lg font-bold" style={{ color: 'var(--th-text)' }}>{isEditMode ? 'Edit Project' : 'Create Project'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Project Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className={inputCls} placeholder="My Awesome Project" style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' resize-none'} placeholder="Brief description..." style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Tech Stack (comma separated)</label>
                <input value={form.stack} onChange={e => setForm(p => ({ ...p, stack: e.target.value }))} className={inputCls} placeholder="React, Node.js, PostgreSQL" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls} style={inputStyle}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={inputCls} style={inputStyle}>
                    {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Repo URL</label>
                  <input value={form.repoUrl} onChange={e => setForm(p => ({ ...p, repoUrl: e.target.value }))} className={inputCls} placeholder="https://github.com/..." style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Live URL</label>
                  <input value={form.liveUrl} onChange={e => setForm(p => ({ ...p, liveUrl: e.target.value }))} className={inputCls} placeholder="https://myapp.vercel.app" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--th-text-secondary)' }}>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>

              <button type="submit" disabled={(isEditMode ? updateProject.isPending : createProject.isPending) || !form.title}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--th-primary)' }}>
                {(isEditMode ? updateProject.isPending : createProject.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Create Project'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
