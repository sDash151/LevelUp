import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Pencil, MoreVertical, MapPin, DollarSign, Linkedin, ExternalLink,
  Calendar, Clock, ChevronDown, CheckCircle2, Circle, Plus, Trash2,
  Sparkles, Brain, Target, BookOpen, MessageSquare, ChevronRight,
  Loader2, RefreshCw, Lock, Award, Flame, TrendingUp, Check,
} from 'lucide-react';
import clsx from 'clsx';
import { useUpdateJob, useGenerateAIPrep, useStartPreparation } from '../hooks/useJobs';

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const STAGES = ['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
const STAGE_LABELS = { SAVED: 'Saved', APPLIED: 'Applied', PHONE_SCREEN: 'Phone Screen', INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn' };
const STAGE_COLORS = { SAVED: 'var(--th-text-dim)', APPLIED: '#E8B94A', PHONE_SCREEN: '#06b6d4', INTERVIEW: '#E8B94A', OFFER: '#10b981', REJECTED: '#ef4444', WITHDRAWN: '#71717a' };

const CHECKLIST_ICONS = {
  resume: '📄', research: '🔍', dsa: '💻', system_design: '🏗️',
  mock_interview: '🎤', behavioral: '🧠',
};

const SKILL_COLORS = ['#E8B94A', '#10b981', '#6366f1', '#06b6d4', '#f97316', '#ef4444'];
const DIFF_COLORS = { Easy: '#10b981', Medium: '#E8B94A', Hard: '#ef4444' };

function ProgressRing({ pct = 0, size = 80, stroke = 7, color = '#E8B94A', trackColor = 'var(--th-highlight)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={trackColor} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        stroke={color} strokeLinecap="round"
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }} strokeDasharray={circ} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */
function OverviewTab({ job }) {
  const history = Array.isArray(job.stageHistory) ? job.stageHistory : [];
  const rounds = Array.isArray(job.interviewRounds) ? job.interviewRounds : [];
  const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const [showAllSkills, setShowAllSkills] = useState(false);
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 6);

  return (
    <div className="space-y-5 pb-4">
      {/* Application Timeline + Match Score */}
      <div className="flex gap-3 md:gap-4">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Application Timeline</h4>
          <div className="space-y-0">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full mt-0.5" style={{ background: i === history.length - 1 ? '#E8B94A' : '#10b981' }} />
                  {i < history.length - 1 && <div className="w-0.5 h-6" style={{ background: 'var(--th-border)' }} />}
                </div>
                <div className="flex-1 flex justify-between items-center pb-3">
                  <span className="text-[12px]" style={{ color: 'var(--th-text-secondary)' }}>
                    {h.stage === 'SAVED' ? 'Added to Saved' : h.stage === 'APPLIED' ? 'Applied' : `Interview Round ${rounds.filter(r2 => r2.round <= (i - 1)).length || i - 1}`}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>
                    {h.date ? new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                  </span>
                </div>
              </div>
            ))}
            {/* Next step */}
            <div className="flex items-start gap-3">
              <Circle className="w-3 h-3 mt-0.5" style={{ color: 'var(--th-text-dim)' }} />
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>Next: {STAGE_LABELS[STAGES[STAGES.indexOf(job.status) + 1]] || 'Complete'}</span>
                <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>TBD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="w-[140px] md:w-[200px] shrink-0 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[12px] md:text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Match Score</h4>
          <div className="relative transform scale-75 md:scale-100 origin-center">
            <ProgressRing pct={job.matchScore || 0} size={100} stroke={8} color="#E8B94A" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[24px] font-black" style={{ color: 'var(--th-text)' }}>{job.matchScore || '—'}%</span>
            </div>
          </div>
          {job.matchScore >= 70 && (
            <p className="text-[10px] md:text-[11px] mt-0 md:mt-2 font-semibold" style={{ color: '#10b981' }}>Great Match! 🎉</p>
          )}
          <p className="text-[9px] md:text-[10px] mt-1 text-center" style={{ color: 'var(--th-text-dim)' }}>
            Your skills match well with the job requirements.
          </p>
        </div>
      </div>

      {/* Important Dates + Required Skills */}
      <div className="flex gap-3 md:gap-4">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Important Dates</h4>
          <div className="space-y-2.5">
            {rounds.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} />
                <span className="text-[12px] flex-1" style={{ color: 'var(--th-text-secondary)' }}>Interview Round {r.round}</span>
                <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>
                  {r.date ? new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                </span>
              </div>
            ))}
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
                <span className="text-[12px] flex-1" style={{ color: 'var(--th-text-secondary)' }}>Application Deadline</span>
                <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Required Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>{s}</span>
            ))}
            {skills.length > 6 && !showAllSkills && (
              <button onClick={() => setShowAllSkills(true)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ background: 'var(--th-highlight)', color: 'var(--th-primary)' }}>+{skills.length - 6} more</button>
            )}
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Job Details</h4>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
          {[['Experience', job.experience], ['Job Type', job.type?.replace(/_/g, ' ')], ['Work Mode', job.workMode], ['Posted On', job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—']].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>{k}</span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Job Description + About Company */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Job Description</h4>
          <p className="text-[11px] leading-relaxed line-clamp-4" style={{ color: 'var(--th-text-secondary)' }}>
            {job.description || 'No description added yet.'}
          </p>
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 text-[11px] font-medium" style={{ color: 'var(--th-primary)' }}>
              View Full Description <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
              {job.company?.[0]}
            </div>
            <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>About Company</h4>
          </div>
          <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: 'var(--th-text-secondary)' }}>
            {job.companyInfo || `${job.company} is a technology company.`}
          </p>
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-2 text-[11px] font-medium" style={{ color: 'var(--th-primary)' }}>
              View Company <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NOTES TAB
   ═══════════════════════════════════════════════════ */
function NotesTab({ job, onUpdate }) {
  const [recruiterNotes, setRecruiterNotes] = useState(job.recruiterNotes || '');
  const [interviewNotes, setInterviewNotes] = useState(job.interviewNotes || '');
  const [companyResearch, setCompanyResearch] = useState(job.companyResearch || '');
  const [personalNotes, setPersonalNotes] = useState(job.personalNotes || '');
  const [checklist, setChecklist] = useState(Array.isArray(job.checklist) ? job.checklist : []);
  const [newTask, setNewTask] = useState('');

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setChecklist(prev => [...prev, { id: `c${Date.now()}`, type: 'research', text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const saveNotes = () => {
    onUpdate({ recruiterNotes, interviewNotes, companyResearch, personalNotes, checklist });
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Recruiter + Interview Notes side by side */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Recruiter Notes</h4>
            <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add</button>
          </div>
          <textarea value={recruiterNotes} onChange={e => setRecruiterNotes(e.target.value)} rows={4}
            placeholder="Notes about the recruiter, calls, messages..."
            className="w-full text-[11px] leading-relaxed outline-none resize-none rounded-lg p-2"
            style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Interview Notes</h4>
            <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add</button>
          </div>
          <textarea value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)} rows={4}
            placeholder="Round details, questions asked, experience..."
            className="w-full text-[11px] leading-relaxed outline-none resize-none rounded-lg p-2"
            style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
        </div>
      </div>

      {/* Company Research */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Company Research</h4>
          <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add</button>
        </div>
        <textarea value={companyResearch} onChange={e => setCompanyResearch(e.target.value)} rows={3}
          placeholder="Company products, culture, tech stack, values..."
          className="w-full text-[11px] leading-relaxed outline-none resize-none rounded-lg p-2"
          style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
      </div>

      {/* Checklist */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Checklist</h4>
          <button onClick={addTask} className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add Task</button>
        </div>
        <div className="space-y-2">
          {checklist.map(c => (
            <div key={c.id} className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => toggleChecklist(c.id)}>
              {c.completed ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
              ) : (
                <Circle className="w-4 h-4 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
              )}
              <span className="text-[12px]" style={{ color: c.completed ? 'var(--th-text-dim)' : 'var(--th-text-secondary)', textDecoration: c.completed ? 'line-through' : 'none' }}>
                {CHECKLIST_ICONS[c.type] || '📋'} {c.text}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <input value={newTask} onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add new task..." className="flex-1 text-[11px] rounded-lg px-3 py-1.5 outline-none"
              style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
          </div>
        </div>
      </div>

      {/* Personal Notes */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Personal Notes</h4>
          <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add</button>
        </div>
        <textarea value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} rows={3}
          placeholder="Your thoughts, motivation, goals for this role..."
          className="w-full text-[11px] leading-relaxed outline-none resize-none rounded-lg p-2"
          style={{ background: 'var(--th-input)', color: 'var(--th-text-secondary)', border: '1px solid var(--th-border)' }} />
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3">
        <button onClick={saveNotes} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>
          Save Notes
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AI PREP TAB
   ═══════════════════════════════════════════════════ */
function AIPrepTab({ job, onGenerate, onStartPrep, isGenerating }) {
  const prep = job.aiPrepData || null;
  const status = job.aiPrepStatus || 'idle';
  const [qCat, setQCat] = useState('All');
  const [showAllTopics, setShowAllTopics] = useState(false);

  if (status === 'idle' || (!prep && status !== 'generating')) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Sparkles className="w-12 h-12 mb-4" style={{ color: 'var(--th-primary)' }} />
        <h3 className="text-[16px] font-bold mb-2" style={{ color: 'var(--th-text)' }}>AI Interview Preparation</h3>
        <p className="text-[12px] text-center mb-6 max-w-[280px]" style={{ color: 'var(--th-text-muted)' }}>
          Generate a personalized preparation plan powered by AI based on this role's requirements.
        </p>
        <button onClick={onGenerate} disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--th-primary)', color: '#08080d' }}>
          <Sparkles className="w-4 h-4" /> Generate AI Prep
        </button>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 mb-4 animate-spin" style={{ color: 'var(--th-primary)' }} />
        <h3 className="text-[14px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>Generating Prep Plan...</h3>
        <p className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>AI is analyzing the role and creating your roadmap.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <RefreshCw className="w-10 h-10 mb-4" style={{ color: '#ef4444' }} />
        <h3 className="text-[14px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>Generation Failed</h3>
        <p className="text-[12px] mb-4" style={{ color: 'var(--th-text-muted)' }}>AI service was temporarily unavailable.</p>
        <button onClick={onGenerate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: 'var(--th-primary)', color: '#08080d' }}>
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // completed — show full content
  const skills = prep?.skillBreakdown || [];
  const roadmap = prep?.roadmap || [];
  const dsaTopics = prep?.dsaTopics || [];
  const visibleTopics = showAllTopics ? dsaTopics : dsaTopics.slice(0, 6);
  const questions = prep?.questions || [];
  const categories = ['All', ...new Set(questions.map(q => q.category))];
  const filteredQ = qCat === 'All' ? questions : questions.filter(q => q.category === qCat);

  return (
    <div className="space-y-4 pb-4">
      {/* AI Prep Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Left Column: 7 Day Preparation Plan */}
        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>7 Day Preparation Plan</h4>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
            {roadmap.slice(0, 7).map((d, i) => (
              <div key={i}>
                <p className="text-[10px] font-semibold mb-0.5 mt-1" style={{ color: 'var(--th-primary)' }}>Day {d.day} • {d.date}</p>
                {(d.topics || []).map((t, j) => (
                  <p key={j} className="text-[11px] pl-3 flex items-start gap-1" style={{ color: 'var(--th-text-secondary)' }}>
                    <span className="text-[8px] mt-[3px] shrink-0">•</span> <span className="flex-1">{t.name}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Skills & DSA Topics */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Skill Breakdown */}
          <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Skill Breakdown</h4>
            <div className="space-y-2">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SKILL_COLORS[i % SKILL_COLORS.length] }} />
                  <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--th-text-secondary)' }}>{s.name}</span>
                  <span className="text-[11px] font-semibold shrink-0" style={{ color: 'var(--th-text-dim)' }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Asked DSA Topics */}
          <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Most Asked DSA Topics</h4>
            <div className="flex flex-wrap gap-1.5">
              {visibleTopics.map((t, i) => (
                <span key={i} className="px-2 py-1 rounded-lg text-[10px] font-medium"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text-secondary)' }}>{t.name}</span>
              ))}
            </div>
            {dsaTopics.length > 6 && (
              <button onClick={() => setShowAllTopics(!showAllTopics)} className="flex items-center gap-1 mt-3 text-[10px] font-semibold w-max cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>
                {showAllTopics ? 'Show Less' : 'View All Topics'} 
                <ChevronRight className={clsx("w-3 h-3 transition-transform", showAllTopics && "-rotate-90")} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Common Interview Questions */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Common Interview Questions</h4>
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button key={c} onClick={() => setQCat(c)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: qCat === c ? 'var(--th-primary)' : 'var(--th-highlight)', color: qCat === c ? '#08080d' : 'var(--th-text-muted)' }}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
          {filteredQ.slice(0, 10).map((q, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>
              <span className="text-[9px]" style={{ color: 'var(--th-primary)' }}>{i + 1}.</span>
              <span className="flex-1 truncate">{q.question}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0"
                style={{ background: `${DIFF_COLORS[q.difficulty] || '#71717a'}20`, color: DIFF_COLORS[q.difficulty] || '#71717a' }}>
                {q.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Preparation CTA */}
      {!job.prepStarted && (
        <button onClick={onStartPrep}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: '#ef4444', color: '#fff' }}>
          <Flame className="w-4 h-4" /> Start Preparation
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PREP TRACKER TAB
   ═══════════════════════════════════════════════════ */
function PrepTrackerTab({ job, onUpdate }) {
  const prep = job.aiPrepData || {};
  const roadmap = prep.roadmap || [];
  const dsaTopics = prep.dsaTopics || [];
  const questions = prep.questions || [];
  const focusTasks = prep.focusTasks || [];
  const [qCat, setQCat] = useState('All');

  // Calculate days since start
  const startDate = job.prepStartedAt ? new Date(job.prepStartedAt) : new Date();
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / 86400000) + 1;
  const totalDays = job.prepDaysTotal || 7;
  const daysCompleted = Math.min(daysSinceStart, totalDays);
  const daysLeft = Math.max(0, totalDays - daysCompleted);

  // Calculate progress from roadmap topics
  const allTopics = roadmap.flatMap(d => d.topics || []);
  const completedTopics = allTopics.filter(t => t.completed).length;
  const progress = allTopics.length > 0 ? Math.round((completedTopics / allTopics.length) * 100) : job.prepProgress || 0;
  const confidence = job.prepConfidence || 0;

  const toggleTopic = (dayIdx, topicIdx) => {
    const newRoadmap = roadmap.map((d, di) => ({
      ...d,
      topics: (d.topics || []).map((t, ti) => di === dayIdx && ti === topicIdx ? { ...t, completed: !t.completed } : t),
    }));
    const newPrep = { ...prep, roadmap: newRoadmap };
    const newCompleted = newRoadmap.flatMap(d => d.topics || []).filter(t => t.completed).length;
    const newProgress = allTopics.length > 0 ? Math.round((newCompleted / allTopics.length) * 100) : 0;
    onUpdate({ aiPrepData: newPrep, prepProgress: newProgress, prepConfidence: Math.min(100, newProgress + 10) });
  };

  const toggleQuestion = (qIdx) => {
    const newQ = questions.map((q, i) => i === qIdx ? { ...q, practiced: !q.practiced } : q);
    const newPrep = { ...prep, questions: newQ };
    onUpdate({ aiPrepData: newPrep });
  };

  const toggleFocusTask = (tIdx) => {
    const newTasks = focusTasks.map((t, i) => i === tIdx ? { ...t, completed: !t.completed } : t);
    const newPrep = { ...prep, focusTasks: newTasks };
    onUpdate({ aiPrepData: newPrep });
  };

  const categories = ['All', ...new Set(questions.map(q => q.category))];
  const filteredQ = qCat === 'All' ? questions : questions.filter(q => q.category === qCat);

  // Interview date from rounds
  const nextInterview = (job.interviewRounds || []).find(r => r.date && new Date(r.date) > new Date());

  // Prep stats
  const problemsSolved = dsaTopics.reduce((a, t) => a + (t.completed || 0), 0);
  const questionsPracticed = questions.filter(q => q.practiced).length;

  return (
    <div className="space-y-4 pb-4">
      {/* Progress Header + Confidence */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Interview Preparation Progress</h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ProgressRing pct={progress} size={90} stroke={8} color="#10b981" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[20px] font-black" style={{ color: 'var(--th-text)' }}>{progress}%</span>
                <span className="text-[8px]" style={{ color: 'var(--th-text-dim)' }}>Overall Progress</span>
              </div>
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: 'var(--th-text)' }}>{daysCompleted} / {totalDays}</p>
              <p className="text-[11px]" style={{ color: 'var(--th-text-muted)' }}>Days Completed</p>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--th-text-dim)' }}>
                <Clock className="w-3 h-3" /> {daysLeft} Days Left
              </p>
              {nextInterview && (
                <p className="text-[10px] mt-0.5" style={{ color: '#E8B94A' }}>
                  Interview on {new Date(nextInterview.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-[200px] shrink-0 rounded-2xl p-4 flex flex-col items-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Interview Confidence</h4>
          <div className="relative">
            <ProgressRing pct={confidence} size={80} stroke={7} color={confidence >= 70 ? '#10b981' : confidence >= 40 ? '#E8B94A' : '#ef4444'} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[18px] font-black" style={{ color: 'var(--th-text)' }}>{confidence}%</span>
            </div>
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--th-text-dim)' }}>
            {confidence >= 70 ? "You're doing great! Keep going strong." : confidence >= 40 ? 'Getting there! Keep practicing.' : 'Keep pushing! Practice makes perfect.'}
          </p>
        </div>
      </div>

      {/* Daily Roadmap + DSA Topics + Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Daily Roadmap */}
        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Daily Roadmap</h4>
          <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-hide">
            {roadmap.map((d, di) => (
              <div key={di}>
                <p className="text-[10px] font-bold flex items-center gap-1" style={{ color: di < daysSinceStart ? '#E8B94A' : 'var(--th-text-dim)' }}>
                  {di < daysSinceStart ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  Day {d.day} • {d.date}
                </p>
                {(d.topics || []).map((t, ti) => (
                  <div key={ti} onClick={() => toggleTopic(di, ti)}
                    className="flex items-center gap-2 pl-5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity">
                    {t.completed ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#10b981' }} /> : <Circle className="w-3 h-3 shrink-0" style={{ color: 'var(--th-text-dim)' }} />}
                    <span className="text-[11px]" style={{ color: t.completed ? 'var(--th-text-dim)' : 'var(--th-text-secondary)', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* DSA Topic Progress */}
        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>DSA Topic Progress</h4>
            <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-muted)' }}>View All</button>
          </div>
          <div className="space-y-2.5">
            {dsaTopics.map((t, i) => {
              const pct = t.questions > 0 ? Math.round((t.completed / t.questions) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: `${DIFF_COLORS[t.difficulty] || '#71717a'}20`, color: DIFF_COLORS[t.difficulty] || '#71717a' }}>
                        {t.difficulty}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{t.completed}/{t.questions}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      style={{ background: DIFF_COLORS[t.difficulty] || '#E8B94A' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Focus */}
        <div className="md:col-span-2 rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Focus</h4>
            <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{focusTasks.length} Tasks</span>
          </div>
          <div className="space-y-2">
            {focusTasks.map((t, i) => (
              <div key={i} onClick={() => toggleFocusTask(i)} className="flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                {t.completed ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#10b981' }} /> : <div className="w-3.5 h-3.5 rounded border mt-0.5 shrink-0" style={{ borderColor: 'var(--th-text-dim)' }} />}
                <span className="text-[11px]" style={{ color: t.completed ? 'var(--th-text-dim)' : 'var(--th-text-secondary)' }}>{t.text}</span>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 mt-3 text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>
            <Plus className="w-3 h-3" /> Add Task
          </button>
        </div>
      </div>

      {/* Interview Question Bank */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Interview Question Bank</h4>
        <div className="flex gap-1 mb-3">
          {categories.map(c => (
            <button key={c} onClick={() => setQCat(c)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: qCat === c ? 'var(--th-primary)' : 'var(--th-highlight)', color: qCat === c ? '#08080d' : 'var(--th-text-muted)' }}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide">
          {filteredQ.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: 'var(--th-primary)' }}>{i + 1}.</span>
              <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--th-text-secondary)' }}>{q.question}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0"
                style={{ background: `${DIFF_COLORS[q.difficulty] || '#71717a'}20`, color: DIFF_COLORS[q.difficulty] || '#71717a' }}>
                {q.difficulty}
              </span>
              <button onClick={() => toggleQuestion(i)}
                className="text-[9px] px-2 py-0.5 rounded font-semibold shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  background: q.practiced ? '#10b98120' : 'var(--th-highlight)',
                  color: q.practiced ? '#10b981' : 'var(--th-text-muted)',
                }}>
                {q.practiced ? 'Practiced' : 'Practice'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Stats */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
        <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Preparation Stats</h4>
        <div className="grid grid-cols-2 gap-2">
          {[['Problems Solved', problemsSolved], ['Questions Practiced', questionsPracticed], ['Mock Interviews', 0], ['Days Consistent', daysCompleted]].map(([label, value]) => (
            <div key={label} className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5" style={{ color: 'var(--th-primary)' }} />
              <span className="text-[11px] flex-1" style={{ color: 'var(--th-text-secondary)' }}>{label}</span>
              <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: '#10b98110' }}>
          <Flame className="w-4 h-4" style={{ color: '#10b981' }} />
          <div>
            <p className="text-[11px] font-semibold" style={{ color: '#10b981' }}>Keep the momentum!</p>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Consistency is the key to success.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN DRAWER
   ═══════════════════════════════════════════════════ */
export function JobDetailDrawer({ job, isOpen, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stageDropdown, setStageDropdown] = useState(false);
  const updateJob = useUpdateJob();
  const generateAI = useGenerateAIPrep();
  const startPrep = useStartPreparation();

  if (!job) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: 'Notes' },
    { id: 'ai-prep', label: 'AI Prep', icon: <Sparkles className="w-3 h-3" /> },
    ...(job.prepStarted ? [{ id: 'prep-tracker', label: 'Prep Tracker', icon: <span className="text-[10px]">★</span> }] : []),
  ];

  const handleStageChange = (newStatus) => {
    updateJob.mutate({ id: job.id, data: { status: newStatus } });
    setStageDropdown(false);
  };

  const handleUpdate = (data) => {
    updateJob.mutate({ id: job.id, data });
  };

  const handleGenerate = () => {
    generateAI.mutate(job.id);
  };

  const handleStartPrep = () => {
    startPrep.mutate(job.id);
  };

  const statusColor = STAGE_COLORS[job.status] || '#E8B94A';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-[70] flex flex-col"
            style={{ width: 'min(580px, 90vw)', background: 'var(--th-bg)', borderLeft: '1px solid var(--th-border)' }}>

            {/* Header */}
            <div className="px-5 pt-5 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--th-border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold"
                    style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
                    {job.company?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-bold" style={{ color: 'var(--th-text)' }}>{job.company}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: `${statusColor}20`, color: statusColor }}>
                        {STAGE_LABELS[job.status]}
                      </span>
                    </div>
                    <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>{job.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={onEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: 'var(--th-text-dim)' }}>
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                {job.salary && <span>• {job.salary}</span>}
                {job.source && <span>• {job.source}</span>}
              </div>

              {/* Tabs */}
              <div className="flex gap-0" style={{ borderBottom: '1px solid var(--th-border)' }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-1 px-4 py-2.5 text-[12px] font-semibold -mb-px relative cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      color: activeTab === t.id ? 'var(--th-primary)' : 'var(--th-text-muted)',
                      borderBottom: activeTab === t.id ? '2px solid var(--th-primary)' : '2px solid transparent',
                    }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 scrollbar-hide">
              {activeTab === 'overview' && <OverviewTab job={job} />}
              {activeTab === 'notes' && <NotesTab job={job} onUpdate={handleUpdate} />}
              {activeTab === 'ai-prep' && <AIPrepTab job={job} onGenerate={handleGenerate} onStartPrep={handleStartPrep} isGenerating={generateAI.isPending} />}
              {activeTab === 'prep-tracker' && <PrepTrackerTab job={job} onUpdate={handleUpdate} />}
            </div>

            {/* Bottom Bar */}
            <div className="px-5 py-3 shrink-0 flex flex-wrap md:flex-nowrap items-center gap-3" style={{ borderTop: '1px solid var(--th-border)', background: 'var(--th-bg)' }}>
              {/* Move Stage */}
              <div className="relative flex-1 md:flex-none">
                <button onClick={() => setStageDropdown(!stageDropdown)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
                  Move Stage <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {stageDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setStageDropdown(false)} />
                    <div className="absolute bottom-12 left-0 z-40 rounded-xl p-1.5 min-w-[160px] shadow-xl"
                      style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}>
                      {STAGES.map(s => (
                        <button key={s} onClick={() => handleStageChange(s)}
                          className={clsx('w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity')}
                          style={{
                            color: job.status === s ? 'var(--th-primary)' : 'var(--th-text-secondary)',
                            background: job.status === s ? 'rgba(232,185,74,0.1)' : 'transparent',
                          }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[s] }} />
                          {STAGE_LABELS[s]}
                          {job.status === s && <Check className="w-3 h-3 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => setActiveTab('notes')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
                <MessageSquare className="w-3.5 h-3.5" /> Add Note
              </button>

              <button onClick={job.prepStarted ? () => setActiveTab('prep-tracker') : handleGenerate}
                disabled={generateAI.isPending}
                className="min-w-full md:min-w-0 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold md:ml-auto cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: job.prepStarted ? '#ef4444' : 'var(--th-primary)', color: job.prepStarted ? '#fff' : '#08080d' }}>
                {generateAI.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : job.prepStarted ? (
                  <><Brain className="w-4 h-4" /> Start Mock Interview</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate AI Prep →</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
