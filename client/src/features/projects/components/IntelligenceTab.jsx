import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Target, Star, AlertTriangle, TrendingUp, Sparkles, BarChart3,
  Award, Briefcase, Code2, Search, Send, ArrowRight, ExternalLink,
  Zap, Lock, Globe, Wifi, Activity, Database, Server,
} from 'lucide-react';
import { useProjects, useIntelligence, useAnalyzeProject, useJobSync } from '../hooks/useProjects';
import clsx from 'clsx';

const PROJECT_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
function getColor(t = '') {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = t.charCodeAt(i) + ((h << 5) - h);
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
}

/* ─── Intelligence KPI Cards ─── */
function IntelligenceKpiCards({ data }) {
  const kpis = [
    { label: 'Portfolio Strength', value: data?.portfolioStrength || 78, icon: Shield, color: '#10b981', suffix: '/100' },
    { label: 'Role Match', value: data?.roleMatch || 72, icon: Target, color: '#3b82f6', suffix: '%' },
    { label: 'Strongest Project', value: data?.strongestProject || 'LevelUp', icon: Star, color: '#f59e0b', suffix: '' },
    { label: 'Biggest Gap', value: data?.biggestGap || 'Testing', icon: AlertTriangle, color: '#ef4444', suffix: '' },
    { label: 'Resume Readiness', value: data?.resumeReadiness || 85, icon: Award, color: '#8b5cf6', suffix: '%' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="rounded-xl p-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <k.icon className="w-4 h-4" style={{ color: k.color }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--th-text-dim)' }}>{k.label}</span>
          </div>
          <p className="text-[20px] font-bold" style={{ color: 'var(--th-text)' }}>
            {typeof k.value === 'number' ? k.value : <span className="text-[15px]">{k.value}</span>}
            <span className="text-[11px] font-normal" style={{ color: 'var(--th-text-dim)' }}>{k.suffix}</span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Job Match Engine ─── */
function JobMatchEngine({ projects }) {
  const jobSync = useJobSync();
  const matches = projects.slice(0, 3).map((p, i) => ({
    project: p,
    matchPct: Math.round(65 + Math.random() * 30),
    strengths: (p.stack || []).slice(0, 3),
    missing: ['CI/CD', 'Testing'].slice(0, 1 + Math.floor(Math.random() * 2)),
  }));

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
          <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Job Match Engine</h3>
        </div>
        <button onClick={() => jobSync.mutate({})}
          className="text-[10px] px-3 py-1 rounded-lg font-medium transition-all hover:scale-105"
          style={{ background: 'var(--th-primary)', color: 'white' }}>
          {jobSync.isPending ? 'Syncing...' : 'Sync Jobs'}
        </button>
      </div>

      <div className="space-y-3">
        {matches.map((m, i) => (
          <div key={m.project.id || i} className="p-3 rounded-xl flex items-start gap-3" style={{ background: 'var(--th-bg-secondary)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: getColor(m.project.title) }}>
              {m.project.title?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--th-text)' }}>{m.project.title}</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{
                  background: m.matchPct >= 80 ? '#10b98115' : '#f59e0b15',
                  color: m.matchPct >= 80 ? '#10b981' : '#f59e0b',
                }}>{m.matchPct}% match</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {m.strengths.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">{s}</span>)}
                {m.missing.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-medium">⚠ {s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Growth Gap Analyzer ─── */
function GrowthGapAnalyzer() {
  const gaps = [
    { area: 'Testing', pct: 35, color: '#ef4444' },
    { area: 'Infrastructure', pct: 45, color: '#f59e0b' },
    { area: 'Caching', pct: 50, color: '#f97316' },
    { area: 'Monitoring', pct: 40, color: '#8b5cf6' },
    { area: 'Security', pct: 55, color: '#3b82f6' },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Growth Gaps</h3>
      </div>
      <div className="space-y-3">
        {gaps.map(g => (
          <div key={g.area}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text)' }}>{g.area}</span>
              <span className="text-[11px] font-bold" style={{ color: g.color }}>{g.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${g.pct}%`, background: g.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Resume Intelligence ─── */
function ResumeIntelligence({ projects }) {
  const sorted = [...projects].sort((a, b) => (b.metrics?.portfolioScore || 0) - (a.metrics?.portfolioScore || 0));

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4" style={{ color: '#8b5cf6' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Resume Intelligence</h3>
      </div>
      <p className="text-[11px] mb-3" style={{ color: 'var(--th-text-dim)' }}>Projects ranked by resume impact</p>
      <div className="space-y-2">
        {sorted.slice(0, 5).map((p, i) => {
          const score = (p.metrics?.portfolioScore || 5).toFixed(1);
          return (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--th-bg-secondary)' }}>
              <span className="text-[11px] font-bold w-5 text-center" style={{ color: 'var(--th-primary)' }}>#{i + 1}</span>
              <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: getColor(p.title) }}>
                {p.title?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-[12px] font-medium flex-1 truncate" style={{ color: 'var(--th-text)' }}>{p.title}</span>
              <span className="text-[11px] font-bold" style={{ color: parseFloat(score) >= 7 ? '#10b981' : '#f59e0b' }}>{score}/10</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Project Ranking Matrix ─── */
function ProjectRankingMatrix({ projects }) {
  const headers = ['Project', 'Architecture', 'Scalability', 'Recruiter', 'Complexity', 'Demo'];
  const rows = projects.slice(0, 5).map(p => {
    const intel = p.intelligence || {};
    return {
      name: p.title,
      color: getColor(p.title),
      scores: [
        intel.architectureScore || (3 + Math.random() * 7),
        intel.scalabilityScore || (3 + Math.random() * 7),
        intel.recruiterScore || (3 + Math.random() * 7),
        (p.stack?.length || 2) + Math.random() * 4,
        intel.resumeScore || (3 + Math.random() * 7),
      ].map(s => Math.min(10, s).toFixed(1)),
    };
  });

  return (
    <div className="rounded-2xl p-5 overflow-x-auto" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Project Ranking Matrix</h3>
      </div>
      <table className="w-full text-[11px]">
        <thead>
          <tr>
            {headers.map(h => <th key={h} className="text-left py-2 pr-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ background: r.color }}>
                    {r.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="font-medium truncate max-w-[100px]" style={{ color: 'var(--th-text)' }}>{r.name}</span>
                </div>
              </td>
              {r.scores.map((s, j) => (
                <td key={j} className="py-2 pr-3">
                  <span className="font-bold" style={{ color: parseFloat(s) >= 7 ? '#10b981' : parseFloat(s) >= 5 ? '#f59e0b' : '#ef4444' }}>{s}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Pattern Intelligence ─── */
function PatternIntelligence() {
  const patterns = [
    { name: 'Authentication', icon: Lock, detected: true },
    { name: 'Message Queues', icon: Activity, detected: true },
    { name: 'Caching', icon: Database, detected: false },
    { name: 'WebSockets', icon: Wifi, detected: true },
    { name: 'CI/CD', icon: Server, detected: false },
    { name: 'API Gateway', icon: Globe, detected: true },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-4 h-4" style={{ color: '#10b981' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Pattern Intelligence</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {patterns.map(p => (
          <div key={p.name} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: p.detected ? '#10b98108' : 'var(--th-bg-secondary)', border: p.detected ? '1px solid #10b98130' : '1px solid var(--th-border)' }}>
            <p.icon className="w-3.5 h-3.5" style={{ color: p.detected ? '#10b981' : 'var(--th-text-dim)' }} />
            <span className="text-[11px] font-medium" style={{ color: p.detected ? '#10b981' : 'var(--th-text-dim)' }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Interview Readiness ─── */
function InterviewReadiness() {
  const tracks = [
    { label: 'Backend', pct: 82, color: '#10b981' },
    { label: 'Frontend', pct: 75, color: '#3b82f6' },
    { label: 'Fullstack', pct: 78, color: '#8b5cf6' },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4" style={{ color: '#3b82f6' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Interview Readiness</h3>
      </div>
      <div className="space-y-3">
        {tracks.map(t => (
          <div key={t.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--th-text)' }}>{t.label}</span>
              <span className="text-[11px] font-bold" style={{ color: t.color }}>{t.pct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--th-border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, background: t.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Ask AI Section ─── */
function AskAISection() {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Ask AI</h3>
      </div>
      <p className="text-[11px] mb-3" style={{ color: 'var(--th-text-dim)' }}>Ask anything about your projects, portfolio, or career growth.</p>
      <div className="flex gap-2">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Which project should I focus on for FAANG interviews?"
          className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
          style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)', border: '1px solid var(--th-border)' }} />
        <button className="p-2 rounded-xl" style={{ background: 'var(--th-primary)' }}>
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {['Best project for resume?', 'What skills am I missing?', 'Rate my portfolio'].map(q => (
          <button key={q} onClick={() => setPrompt(q)}
            className="text-[9px] px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-dim)', border: '1px solid var(--th-border)' }}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Intelligence Tab ─── */
export default function IntelligenceTab() {
  const { data: projectsData } = useProjects({});
  const { data: intelligenceData } = useIntelligence();
  const projects = projectsData?.data || [];
  const intelligence = intelligenceData?.data || {};

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <IntelligenceKpiCards data={intelligence} />

      {/* Row 1: Job Match + Growth Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <JobMatchEngine projects={projects} />
        <GrowthGapAnalyzer />
      </div>

      {/* Row 2: Resume Intelligence + AI Suggested Upgrades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ResumeIntelligence projects={projects} />
        <InterviewReadiness />
      </div>

      {/* Row 3: Ranking Matrix */}
      <ProjectRankingMatrix projects={projects} />

      {/* Row 4: Pattern Intelligence */}
      <PatternIntelligence />

      {/* Row 5: Ask AI */}
      <AskAISection />
    </div>
  );
}
