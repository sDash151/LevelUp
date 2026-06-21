import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Briefcase, Search, TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
  MoreVertical, ExternalLink, Eye, Sparkles, Filter, Calendar, Check,
  ChevronDown, ArrowRight, BookOpen, Flame, Target,
} from 'lucide-react';
import { AnimatedPage, PageSkeleton } from '@/design-system/components';
import { useJobs, useJobStats, useCreateJob, useDeleteJob, useUpdateJob, useJob } from '../hooks/useJobs';
import { JobForm } from '../components/JobForm';
import { JobDetailDrawer } from '../components/JobDetailDrawer';
import clsx from 'clsx';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */
const PIPELINE_STAGES = [
  { key: 'SAVED', label: 'Saved', color: '#71717a', icon: '📌' },
  { key: 'APPLIED', label: 'Applied', color: '#E8B94A', icon: '📄' },
  { key: 'INTERVIEW', label: 'Interview', color: '#E8B94A', icon: '🎯' },
  { key: 'OFFER', label: 'Offer', color: '#10b981', icon: '🎉' },
  { key: 'REJECTED', label: 'Rejected', color: '#ef4444', icon: '✕' },
];

const STATUS_BADGE = {
  SAVED: { bg: '#71717a20', color: '#71717a', label: 'Saved' },
  APPLIED: { bg: '#E8B94A20', color: '#E8B94A', label: 'Applied' },
  PHONE_SCREEN: { bg: '#06b6d420', color: '#06b6d4', label: 'Screen' },
  INTERVIEW: { bg: '#E8B94A20', color: '#E8B94A', label: 'Interview' },
  OFFER: { bg: '#10b98120', color: '#10b981', label: 'Offer' },
  REJECTED: { bg: '#ef444420', color: '#ef4444', label: 'Rejected' },
  WITHDRAWN: { bg: '#71717a20', color: '#71717a', label: 'Withdrawn' },
};

function getCompanyInitial(name) {
  return name?.[0]?.toUpperCase() || '?';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DRAG_MIME_JOB = 'application/x-levelup-pipeline-job';

function parseDragPayload(event) {
  try {
    const raw = event.dataTransfer.getData(DRAG_MIME_JOB);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════
   KPI STAT CARD
   ═══════════════════════════════════════════ */
function KpiCard({ icon, label, value, change, changeLabel, color = 'var(--th-primary)' }) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-2xl p-4 flex-1 min-w-[140px]" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-semibold" style={{ color: 'var(--th-text-secondary)' }}>{label}</span>
      </div>
      <p className="text-[28px] font-black leading-none" style={{ color: 'var(--th-text)' }}>{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--th-highlight)' }}>
          <div className="h-full rounded-full" style={{ width: '60%', background: color }} />
        </div>
      </div>
      <p className="text-[10px] mt-1 flex items-center gap-0.5" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
        {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        <span className="font-semibold">{isPositive ? '+' : ''}{change}</span>
        <span style={{ color: 'var(--th-text-dim)' }}>{changeLabel}</span>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PIPELINE CARD (mini job card inside column)
   ═══════════════════════════════════════════ */
function PipelineCard({ job, onClick, onDragStart, isMoving }) {
  const rounds = Array.isArray(job.interviewRounds) ? job.interviewRounds : [];
  const latestRound = rounds[rounds.length - 1];
  return (
    <div 
      draggable={!isMoving}
      onDragStart={onDragStart}
      onClick={() => onClick(job)} 
      className={clsx(
        "relative rounded-xl p-3 mb-2 cursor-pointer transition-all hover:scale-[1.01]",
        isMoving && "opacity-50 pointer-events-none"
      )}
      style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)' }}>
      {isMoving && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/60 dark:bg-black/40">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
          {getCompanyInitial(job.company)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{job.company}</h4>
          <p className="text-[10px] truncate" style={{ color: 'var(--th-text-muted)' }}>{job.role}</p>
        </div>
        {latestRound && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0"
            style={{ background: '#E8B94A20', color: '#E8B94A' }}>Round {latestRound.round}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-[9px]" style={{ color: 'var(--th-text-dim)' }}>
        {job.appliedDate && <span>Applied {formatDate(job.appliedDate).split(',')[0]}</span>}
        {job.salary && <span>• {job.salary}</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PIPELINE COLUMN
   ═══════════════════════════════════════════ */
function PipelineColumn({ stage, jobs, onCardClick, onAddClick, onMoveJob, dragOverStage, setDragOverStage, movingJobId }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    const payload = parseDragPayload(e);
    if (!payload || payload.fromStage === stage.key) return;
    setDragOverStage(stage.key);
  };
  
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(prev => (prev === stage.key ? null : prev));
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverStage(null);
    const payload = parseDragPayload(e);
    if (!payload || payload.fromStage === stage.key) return;
    onMoveJob(payload.jobId, stage.key);
  };

  return (
    <div className="flex-1 min-w-[180px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
        <span className="text-[12px] font-bold" style={{ color: stage.color }}>{stage.label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold ml-auto"
          style={{ background: 'var(--th-highlight)', color: 'var(--th-text-dim)' }}>
          {jobs.length}
        </span>
      </div>
      <div 
        className={clsx(
          "space-y-0 max-h-[320px] overflow-y-auto overflow-x-hidden scrollbar-hide p-1 -mx-1 min-h-[100px] rounded-lg transition-all duration-200",
          dragOverStage === stage.key && "ring-2 border-dashed"
        )}
        style={{
          borderColor: stage.color,
          backgroundColor: dragOverStage === stage.key ? `${stage.color}10` : 'transparent',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {jobs.map(j => (
          <PipelineCard 
            key={j.id} 
            job={j} 
            onClick={onCardClick} 
            isMoving={movingJobId === j.id}
            onDragStart={(e) => {
              const fromStage = j.status === 'PHONE_SCREEN' ? 'INTERVIEW' : j.status;
              e.dataTransfer.setData(DRAG_MIME_JOB, JSON.stringify({ jobId: j.id, fromStage }));
              e.dataTransfer.effectAllowed = 'move';
            }}
          />
        ))}
      </div>
      <button onClick={onAddClick}
        className="flex items-center justify-center gap-1 w-full py-2 mt-2 rounded-xl text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color: 'var(--th-text-dim)', border: '1px dashed var(--th-border)' }}>
        <Plus className="w-3 h-3" /> Add Application
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INTERVIEW CALENDAR (sidebar)
   ═══════════════════════════════════════════ */
function InterviewCalendar({ jobs }) {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Get interview dates
  const interviewDates = new Set();
  const deadlineDates = new Set();
  const offerDates = new Set();
  jobs.forEach(j => {
    (j.interviewRounds || []).forEach(r => {
      if (r.date) interviewDates.add(r.date.split('T')[0]);
    });
    if (j.deadline) deadlineDates.add(new Date(j.deadline).toISOString().split('T')[0]);
    if (j.status === 'OFFER' && j.updatedAt) offerDates.add(new Date(j.updatedAt).toISOString().split('T')[0]);
  });

  const cells = Array(offset).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Interview Calendar</h4>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1 cursor-pointer hover:opacity-80 transition-opacity"><ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} /></button>
          <span className="text-[11px] font-medium" style={{ color: 'var(--th-text-secondary)' }}>{monthName}</span>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1 cursor-pointer hover:opacity-80 transition-opacity"><ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[9px] font-semibold py-1" style={{ color: 'var(--th-text-dim)' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isInterview = interviewDates.has(dateStr);
          const isDeadline = deadlineDates.has(dateStr);
          return (
            <div key={dateStr} className="flex items-center justify-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
                style={{
                  background: isToday ? 'var(--th-primary)' : isInterview ? '#E8B94A20' : isDeadline ? '#ef444420' : 'transparent',
                  color: isToday ? '#08080d' : isInterview ? '#E8B94A' : isDeadline ? '#ef4444' : 'var(--th-text-secondary)',
                  fontWeight: isToday || isInterview ? 700 : 400,
                }}>
                {day}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid var(--th-border)' }}>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#E8B94A' }} /><span className="text-[8px]" style={{ color: 'var(--th-text-dim)' }}>Interview</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} /><span className="text-[8px]" style={{ color: 'var(--th-text-dim)' }}>QA / Test</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} /><span className="text-[8px]" style={{ color: 'var(--th-text-dim)' }}>Deadline</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TODAY'S FOCUS (sidebar)
   ═══════════════════════════════════════════ */
function TodaysFocus({ jobs }) {
  const prepJobs = jobs.filter(j => j.prepStarted && j.aiPrepData);
  const tasks = [];
  prepJobs.forEach(j => {
    const focus = j.aiPrepData?.focusTasks || [];
    focus.filter(t => !t.completed).slice(0, 2).forEach(t => {
      tasks.push({ ...t, company: j.company, jobId: j.id });
    });
  });
  const visibleTasks = tasks.slice(0, 4);

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>Today's Focus</h4>
        <button className="text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-primary)' }}>+ Add Task</button>
      </div>
      {visibleTasks.length === 0 ? (
        <p className="text-[11px] py-4 text-center" style={{ color: 'var(--th-text-dim)' }}>No prep tasks yet. Start preparing!</p>
      ) : (
        <div className="space-y-2.5">
          {visibleTasks.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-3.5 h-3.5 rounded border mt-0.5 shrink-0" style={{ borderColor: 'var(--th-text-dim)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] truncate" style={{ color: 'var(--th-text-secondary)' }}>{t.company}: {t.text}</p>
              </div>
              <span className="text-[9px] font-semibold shrink-0" style={{ color: '#E8B94A' }}>+{15 + i * 5} XP</span>
            </div>
          ))}
        </div>
      )}
      <button className="flex items-center justify-center gap-1 w-full mt-3 pt-2 text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
        style={{ borderTop: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
        View All <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AI CAREER INSIGHTS (sidebar)
   ═══════════════════════════════════════════ */
function AICareerInsights({ stats }) {
  const insights = [
    `Backend roles have ${stats?.responseRate || 40}% higher response rate for you.`,
    'You get more responses on Tuesdays.',
    'Companies prefer your projects in Backend & Cloud.',
  ];
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        <h4 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>AI Career Insights</h4>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ['#E8B94A', '#10b981', '#6366f1'][i] }} />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>{ins}</p>
          </div>
        ))}
      </div>
      <button className="flex items-center justify-center gap-1 w-full mt-3 py-2 rounded-xl text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
        style={{ background: 'rgba(232,185,74,0.1)', color: 'var(--th-primary)' }}>
        View detailed insights <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function JobsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [jobToEdit, setJobToEdit] = useState(null);

  const [movingJobId, setMovingJobId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const { data: allJobs = [], isLoading } = useJobs({ limit: 50 });
  const { data: stats } = useJobStats();
  const { data: selectedJob, refetch: refetchJob } = useJob(selectedJobId);
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const handleMoveJob = async (jobId, newStage) => {
    setMovingJobId(jobId);
    try {
      await updateJob.mutateAsync({ id: jobId, data: { status: newStage } });
    } catch (err) {
      console.error(err);
    } finally {
      setMovingJobId(null);
    }
  };

  const handleAddClick = () => {
    setJobToEdit(null);
    setShowForm(true);
  };

  const handleEditClick = () => {
    setJobToEdit(selectedJob);
    setShowForm(true);
  };

  const s = stats ?? {};
  const byStatus = Array.isArray(s.byStatus) ? s.byStatus : [];
  const getCount = (st) => byStatus.find(b => b.status === st)?._count?.id || 0;
  const interviews = getCount('INTERVIEW') + getCount('PHONE_SCREEN');
  const offers = getCount('OFFER');
  const rejections = getCount('REJECTED');
  const responseRate = s.responseRate ?? (s.total > 0 ? Math.round(((interviews + offers) / Math.max(1, s.total - getCount('SAVED'))) * 100) : 0);

  // Pipeline groups
  const pipelineJobs = useMemo(() => {
    const groups = {};
    PIPELINE_STAGES.forEach(st => { groups[st.key] = []; });
    allJobs.forEach(j => {
      const key = j.status === 'PHONE_SCREEN' ? 'INTERVIEW' : (groups[j.status] ? j.status : 'APPLIED');
      if (groups[key]) groups[key].push(j);
    });
    return groups;
  }, [allJobs]);

  // Table filtering
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    const q = searchQuery.toLowerCase();
    return allJobs.filter(j => j.company?.toLowerCase().includes(q) || j.role?.toLowerCase().includes(q));
  }, [allJobs, searchQuery]);

  const tablePageSize = 5;
  const totalPages = Math.ceil(filteredJobs.length / tablePageSize);
  const pageJobs = filteredJobs.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  const handleCardClick = (job) => {
    setSelectedJobId(job.id);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <AnimatedPage>
      {/* ══════════════════ DESKTOP ══════════════════ */}
      <div className="hidden lg:block">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[26px] font-bold" style={{ color: 'var(--th-text)' }}>Job Tracker</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Track applications, prepare better, get closer to your dream role.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/insights')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              <Sparkles className="w-3.5 h-3.5" /> AI Insights
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-secondary)' }}>
              All Roles <ChevronDown className="w-3 h-3" />
            </button>
            <button onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="flex gap-3 mb-5">
          <KpiCard icon="📋" label="Applications" value={s.total || 0} change={s.thisWeek || 0} changeLabel="this week" color="#E8B94A" />
          <KpiCard icon="📊" label="Response Rate" value={`${responseRate}%`} change={s.monthlyChange?.responseRate ?? 12} changeLabel="this month" color="#10b981" />
          <KpiCard icon="🎯" label="Interviews" value={interviews} change={s.monthlyChange?.interviews ?? 3} changeLabel="this month" color="#E8B94A" />
          <KpiCard icon="🎉" label="Offers" value={offers} change={s.monthlyChange?.offers ?? 1} changeLabel="this month" color="#10b981" />
          <KpiCard icon="❌" label="Rejections" value={rejections} change={s.monthlyChange?.rejections ?? 4} changeLabel="this month" color="#ef4444" />
        </div>

        {/* Main layout: left content + right sidebar */}
        <div className="flex gap-4">
          {/* Left main content */}
          <div className="flex-1 min-w-0">
            {/* Application Pipeline */}
            <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Application Pipeline</h3>
                <span className="text-[10px] hidden sm:block" style={{ color: 'var(--th-text-dim)' }}>Drag and drop to move stages</span>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {PIPELINE_STAGES.map(stage => (
                  <PipelineColumn 
                    key={stage.key} 
                    stage={stage} 
                    jobs={pipelineJobs[stage.key] || []}
                    onCardClick={handleCardClick} 
                    onAddClick={handleAddClick} 
                    onMoveJob={handleMoveJob}
                    dragOverStage={dragOverStage}
                    setDragOverStage={setDragOverStage}
                    movingJobId={movingJobId}
                  />
                ))}
              </div>
            </div>

            {/* All Applications Table */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>All Applications</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px]"
                    style={{ background: 'var(--th-input)', border: '1px solid var(--th-border)' }}>
                    <Search className="w-3 h-3" style={{ color: 'var(--th-text-dim)' }} />
                    <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setTablePage(1); }}
                      placeholder="Search applications..." className="bg-transparent outline-none text-[11px] w-32"
                      style={{ color: 'var(--th-text-secondary)' }} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
                    {['Company', 'Role', 'Status', 'Applied On', 'Salary', 'Source', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold pb-2.5 pr-3" style={{ color: 'var(--th-text-dim)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageJobs.map(j => {
                    const badge = STATUS_BADGE[j.status] || STATUS_BADGE.APPLIED;
                    return (
                      <tr key={j.id} onClick={() => handleCardClick(j)}
                        className="cursor-pointer transition-colors" style={{ borderBottom: '1px solid var(--th-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--th-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                              style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
                              {getCompanyInitial(j.company)}
                            </div>
                            <span className="text-[12px] font-medium" style={{ color: 'var(--th-text)' }}>{j.company}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>{j.role}</td>
                        <td className="py-2.5 pr-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                        </td>
                        <td className="py-2.5 pr-3 text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{formatDate(j.appliedDate)}</td>
                        <td className="py-2.5 pr-3 text-[11px]" style={{ color: 'var(--th-text-secondary)' }}>{j.salary || '—'}</td>
                        <td className="py-2.5 pr-3 text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{j.source || '—'}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <button className="p-1 rounded hover:bg-[var(--th-highlight)] cursor-pointer transition-opacity" onClick={e => { e.stopPropagation(); handleCardClick(j); }}>
                              <Eye className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--th-border)' }}>
                  <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setTablePage(p)}
                        className="w-7 h-7 rounded-lg text-[11px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          background: tablePage === p ? 'var(--th-primary)' : 'transparent',
                          color: tablePage === p ? '#08080d' : 'var(--th-text-muted)',
                        }}>{p}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>
                      Showing {(tablePage - 1) * tablePageSize + 1} to {Math.min(tablePage * tablePageSize, filteredJobs.length)} of {filteredJobs.length}
                    </span>
                    <button onClick={() => setTablePage(p => Math.min(totalPages, p + 1))} disabled={tablePage === totalPages}
                      className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--th-text-dim)' }}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[240px] shrink-0 space-y-4">
            <InterviewCalendar jobs={allJobs} />
            <TodaysFocus jobs={allJobs} />
            <AICareerInsights stats={s} />
          </div>
        </div>
      </div>

      {/* ══════════════════ MOBILE ══════════════════ */}
      <div className="lg:hidden pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: 'var(--th-text)' }}>Job Tracker</h1>
            <p className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>Track applications, prepare better, get closer to your dream role.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', color: 'var(--th-text-muted)' }}>
              <Search className="w-4 h-4" />
            </button>
            <button onClick={handleAddClick}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'var(--th-primary)', color: '#08080d' }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          <div className="shrink-0 min-w-[110px]"><KpiCard icon="📋" label="Applications" value={s.total || 0} change={s.thisWeek || 0} changeLabel="this week" /></div>
          <div className="shrink-0 min-w-[110px]"><KpiCard icon="📊" label="Response Rate" value={`${responseRate}%`} change={12} changeLabel="this mo." /></div>
          <div className="shrink-0 min-w-[110px]"><KpiCard icon="🎯" label="Interviews" value={interviews} change={3} changeLabel="this mo." /></div>
          <div className="shrink-0 min-w-[110px]"><KpiCard icon="🎉" label="Offers" value={offers} change={1} changeLabel="this mo." /></div>
        </div>

        {/* Pipeline (horizontal scroll) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Application Pipeline</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.key} className="min-w-[200px] shrink-0">
                <PipelineColumn 
                  stage={stage} 
                  jobs={pipelineJobs[stage.key] || []}
                  onCardClick={handleCardClick} 
                  onAddClick={handleAddClick} 
                  onMoveJob={handleMoveJob}
                  dragOverStage={dragOverStage}
                  setDragOverStage={setDragOverStage}
                  movingJobId={movingJobId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Today's Focus */}
        <div className="mb-4"><TodaysFocus jobs={allJobs} /></div>

        {/* Simple list */}
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>All Applications</h3>
          {allJobs.slice(0, 5).map(j => {
            const badge = STATUS_BADGE[j.status] || STATUS_BADGE.APPLIED;
            return (
              <div key={j.id} onClick={() => handleCardClick(j)}
                className="flex items-center gap-3 py-2.5 cursor-pointer" style={{ borderBottom: '1px solid var(--th-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: 'var(--th-highlight)', color: 'var(--th-text)' }}>
                  {getCompanyInitial(j.company)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{j.company}</h4>
                  <p className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>{j.role}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-semibold shrink-0" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
              </div>
            );
          })}
          {allJobs.length > 5 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3].map(p => (
                <button key={p} onClick={() => setTablePage(p)}
                  className="w-7 h-7 rounded-lg text-[11px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: tablePage === p ? 'var(--th-primary)' : 'var(--th-highlight)', color: tablePage === p ? '#08080d' : 'var(--th-text-muted)' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      <JobForm isOpen={showForm} onClose={() => setShowForm(false)}
        job={jobToEdit}
        onSubmit={(data) => jobToEdit ? updateJob.mutate({ id: jobToEdit.id, data }) : createJob.mutate(data)} />

      {/* Job Detail Drawer */}
      <JobDetailDrawer job={selectedJob} isOpen={!!selectedJobId && !!selectedJob}
        onClose={() => setSelectedJobId(null)} onEdit={handleEditClick} />
    </AnimatedPage>
  );
}
