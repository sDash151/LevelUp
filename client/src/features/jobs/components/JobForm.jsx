import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'];
const TYPE_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Internship', CONTRACT: 'Contract', FREELANCE: 'Freelance' };
const STATUSES = ['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
const SOURCES = ['LinkedIn', 'Naukri', 'Referral', 'Company Website', 'Indeed', 'AngelList', 'Other'];

export function JobForm({ isOpen, onClose, job = null, onSubmit }) {
  const [form, setForm] = useState({
    company: '', role: '', location: '',
    type: 'FULL_TIME', status: 'SAVED',
    url: '', salary: '', notes: '',
    appliedDate: '', deadline: '',
    contactName: '', contactEmail: '',
    source: '', experience: '',
    workMode: '', description: '',
    companyInfo: '', requiredSkills: [],
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        company: job?.company || '', role: job?.role || '', location: job?.location || '',
        type: job?.type || 'FULL_TIME', status: job?.status || 'SAVED',
        url: job?.url || '', salary: job?.salary || '', notes: job?.notes || '',
        appliedDate: job?.appliedDate ? new Date(job.appliedDate).toISOString().split('T')[0] : '',
        deadline: job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
        contactName: job?.contactName || '', contactEmail: job?.contactEmail || '',
        source: job?.source || '', experience: job?.experience || '',
        workMode: job?.workMode || '', description: job?.description || '',
        companyInfo: job?.companyInfo || '',
        requiredSkills: job?.requiredSkills || [],
      });
      setSkillInput('');
    }
  }, [isOpen, job]);

  const handleSave = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    const data = { ...form };
    if (!data.appliedDate) delete data.appliedDate;
    if (!data.deadline) delete data.deadline;
    if (!data.url) delete data.url;
    if (!data.contactEmail) delete data.contactEmail;
    if (!data.source) delete data.source;
    if (!data.experience) delete data.experience;
    if (!data.workMode) delete data.workMode;
    if (!data.description) delete data.description;
    if (!data.companyInfo) delete data.companyInfo;
    if (data.requiredSkills.length === 0) delete data.requiredSkills;
    onSubmit?.(data);
    onClose();
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (idx) => {
    setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter((_, i) => i !== idx) }));
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[80]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 scrollbar-hide"
        style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>{job ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-dim)' }}><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} />
            <Field label="Role *" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} />
          </div>
          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
            <Field label="Salary Range" value={form.salary} onChange={v => setForm(f => ({ ...f, salary: v }))} placeholder="e.g. ₹18-25 LPA" />
          </div>
          {/* Source + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-[12px] outline-none cursor-pointer"
                style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Experience" value={form.experience} onChange={v => setForm(f => ({ ...f, experience: v }))} placeholder="e.g. 0-2 Years" />
          </div>
          {/* URL + Work Mode */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Job URL" value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} />
            <div>
              <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Work Mode</label>
              <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-[12px] outline-none cursor-pointer"
                style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }}>
                <option value="">Select mode</option>
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          {/* Type selector */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Type</label>
            <div className="flex gap-1 flex-wrap">
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: form.type === t ? 'var(--th-primary)' : 'var(--th-highlight)', color: form.type === t ? '#08080d' : 'var(--th-text-muted)' }}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Status</label>
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: form.status === s ? 'var(--th-primary)' : 'var(--th-highlight)', color: form.status === s ? '#08080d' : 'var(--th-text-muted)' }}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          {/* Required Skills */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Required Skills</label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {form.requiredSkills.map((s, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>
                  {s}
                  <button onClick={() => removeSkill(i)} className="ml-0.5 cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-dim)' }}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add skill..."
                className="flex-1 rounded-xl px-3 py-2 text-[11px] outline-none"
                style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
              <button onClick={addSkill} className="p-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Applied Date</label>
              <input type="date" value={form.appliedDate} onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
            </div>
          </div>
          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Name" value={form.contactName} onChange={v => setForm(f => ({ ...f, contactName: v }))} />
            <Field label="Contact Email" value={form.contactEmail} onChange={v => setForm(f => ({ ...f, contactEmail: v }))} />
          </div>
          {/* Job Description */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Job Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Paste job description here..."
              className="w-full rounded-xl px-3 py-2 text-[11px] outline-none resize-y"
              style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
          </div>

          {/* Company Info */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Company Info</label>
            <textarea value={form.companyInfo} onChange={e => setForm(f => ({ ...f, companyInfo: e.target.value }))}
              rows={2} placeholder="What does this company do? (mission, culture...)"
              className="w-full rounded-xl px-3 py-2 text-[11px] outline-none resize-y"
              style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Interview prep notes, impressions..."
              className="w-full rounded-xl px-3 py-2 text-[11px] outline-none resize-none"
              style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              {job ? 'Update' : 'Add Application'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--th-text-dim)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 text-[12px] outline-none"
        style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
    </div>
  );
}
