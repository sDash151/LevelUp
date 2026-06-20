import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Target, Star, AlertTriangle, Sparkles, BarChart3,
  Award, Briefcase, Code2, Search, Send, ArrowRight, ExternalLink,
  Zap, Lock, Globe, Wifi, Activity, Database, Server,
  ChevronRight, MoreVertical, Layout, Cpu, CheckCircle2,
  Circle, Play, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { useProjects, useIntelligence, useJobSync, useAskAi, useCreateTask } from '../hooks/useProjects';
import clsx from 'clsx';

const PROJECT_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];
function getColor(t = '') {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = t.charCodeAt(i) + ((h << 5) - h);
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
}

// Custom Circular Progress
function CircularProgress({ percent, color, size = 48, strokeWidth = 4, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--th-bg-secondary)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {label && <span className="absolute text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{label}</span>}
    </div>
  );
}

// Golden Sparkline for Portfolio Strength
function GoldenSparkline() {
  return (
    <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 w-full opacity-80 pointer-events-none rounded-b-2xl">
      <path d="M0 40 Q 10 35, 25 38 T 50 25 T 75 15 L 100 5" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 40 Q 10 35, 25 38 T 50 25 T 75 15 L 100 5 L 100 50 L 0 50 Z" fill="url(#gold-gradient)" />
      <defs>
        <linearGradient id="gold-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── 1. KPI Cards Row (Top) ─── */
function IntelligenceKpiCards({ data, projects }) {
  const withIntel = (projects || []).filter(p => p.intelligence);
  const avgPortfolio = withIntel.length ? withIntel.reduce((s, p) => s + (p.intelligence.resumeScore || 0), 0) / withIntel.length : 0;
  const bestProject = withIntel.sort((a, b) => (b.intelligence?.resumeScore || 0) - (a.intelligence?.resumeScore || 0))[0];
  
  const missingCounts = {};
  withIntel.forEach(p => p.intelligence?.missingSkills?.forEach(s => missingCounts[s] = (missingCounts[s] || 0) + 1));
  const biggestGaps = Object.entries(missingCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  if(biggestGaps.length === 0) biggestGaps.push('Testing', 'CI/CD');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
      {/* Portfolio Strength */}
      <div className="rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Portfolio Strength</span>
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-[22px] font-bold leading-none tracking-tight" style={{ color: 'var(--th-text)' }}>{avgPortfolio > 0 ? avgPortfolio.toFixed(1) : 'N/A'}</span>
            <span className="text-[13px] font-medium leading-none mb-0.5" style={{ color: 'var(--th-text-dim)' }}>/ 10</span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Overall build quality</p>
        </div>
        <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 text-amber-500/30 dark:text-amber-500/20" />
      </div>

      {/* Role Match */}
      <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Role Match</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>Backend Engineer</p>
            <p className="text-[22px] font-bold leading-none tracking-tight mb-1" style={{ color: 'var(--th-text)' }}>{Math.round((avgPortfolio / 10) * 100) || 0}%</p>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Simulated</p>
          </div>
          <CircularProgress percent={Math.round((avgPortfolio / 10) * 100) || 0} color="#10b981" size={44} strokeWidth={4} />
        </div>
      </div>

      {/* Strongest Project */}
      <div className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Strongest Project</span>
          </div>
          <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>{bestProject ? bestProject.title : 'None'}</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 inline-block mb-2 border border-amber-100">Best for interviews</span>
        </div>
        <p className="text-[11px] font-medium relative z-10 mt-1" style={{ color: 'var(--th-text-dim)' }}>Score: <span className="font-bold text-blue-500">{bestProject ? bestProject.intelligence?.resumeScore?.toFixed(1) : 0} / 10</span></p>
        <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 text-amber-100 dark:text-amber-500/10 fill-current" />
      </div>

      {/* Biggest Gap */}
      <div className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Biggest Gap</span>
          </div>
          <div className="space-y-0.5">
            {biggestGaps.map(g => <p key={g} className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>{g}</p>)}
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-11 h-11 rounded-full border border-orange-100 dark:border-orange-900 flex items-center justify-center">
             <div className="w-6 h-6 rounded-full border border-orange-200 dark:border-orange-800 flex items-center justify-center relative">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-orange-500" />
             </div>
          </div>
        </div>
      </div>

      {/* Resume Readiness */}
      <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Resume Readiness</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <CircularProgress percent={Math.round((avgPortfolio / 10) * 100) || 0} color="#f59e0b" size={72} strokeWidth={6} label={`${Math.round((avgPortfolio / 10) * 100) || 0}%`} />
          <div className="flex-1">
            <p className="text-[11px] leading-snug mb-2" style={{ color: 'var(--th-text-dim)' }}>Portfolio resume score</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. Left Column Components ─── */

function JobMatchEngine({ projects }) {
  const [jobDesc, setJobDesc] = useState('');
  const [activeTitle, setActiveTitle] = useState('Google Backend Engineer');
  const [syncedMatches, setSyncedMatches] = useState(null);
  const { mutate: syncJob, isPending } = useJobSync();

  const handleSync = () => {
    if (!jobDesc) return;
    
    const cleanDesc = jobDesc.trim();
    const newTitle = cleanDesc.split('\n')[0].slice(0, 25) + (cleanDesc.length > 25 ? '...' : '');
    setActiveTitle(newTitle);
    
    syncJob({ jobDescription: jobDesc }, {
      onSuccess: (res) => {
        setSyncedMatches(res.data?.matches || []);
      }
    });
  };

  const reqSkills = ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis', 'AWS'];
  
  const matches = syncedMatches ? syncedMatches.map(m => {
    const proj = projects.find(p => p.id === m.projectId) || { title: 'Unknown', stack: [], liveUrl: '', repoUrl: '' };
    return {
      title: proj.title,
      match: m.matchScore || 0,
      strengths: proj.stack?.slice(0, 4) || [],
      missing: m.missingSkills?.length ? m.missingSkills.slice(0, 3) : ['None'],
      link: proj.liveUrl || proj.repoUrl || '#',
      color: getColor(proj.title)
    };
  }).sort((a, b) => b.match - a.match).slice(0, 3) : (projects || [])
    .filter(p => p.title)
    .map(p => {
      const pStack = p.stack || [];
      const strengths = reqSkills.filter(s => pStack.includes(s));
      const extra = pStack.filter(s => !reqSkills.includes(s)).slice(0, 2);
      const missing = reqSkills.filter(s => !pStack.includes(s)).slice(0, 3);
      
      let match = p.intelligence?.resumeScore ? Math.round(p.intelligence.resumeScore * 10) : Math.round((strengths.length / reqSkills.length) * 100) || 40;
      
      return {
        title: p.title,
        match,
        strengths: [...strengths, ...extra].slice(0, 4),
        missing: missing.length ? missing : ['None'],
        link: p.liveUrl || p.repoUrl || '#',
        color: getColor(p.title)
      };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  return (
    <div className="rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto flex flex-col gap-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between min-w-[800px] gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>Job Match Engine</h3>
          </div>
          <p className="text-[12px] mb-4" style={{ color: 'var(--th-text-dim)' }}>Paste a job description to see how your portfolio stacks up.</p>
          <div className="flex gap-2">
            <input 
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste job description here..."
              className="flex-1 px-4 py-2 rounded-xl text-[13px] outline-none border"
              style={{ background: 'var(--th-bg)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
            />
            <button 
              onClick={handleSync}
              disabled={isPending || !jobDesc}
              className="px-5 py-2 rounded-xl font-bold text-[13px] text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col pl-6" style={{ borderLeft: '1px solid var(--th-border)' }}>
          <div className="mb-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">Active Job</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {activeTitle.charAt(0)}
            </div>
            <div className="pr-10">
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>{activeTitle}</p>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--th-text-dim)' }}>Analysis Context</p>
            </div>
            <MoreVertical className="w-4 h-4 cursor-pointer absolute right-0 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-dim)' }} />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="min-w-[800px] mb-4 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--th-border)', background: 'transparent' }}>
        {isPending ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <p className="text-[13px] font-bold" style={{ color: 'var(--th-text-dim)' }}>Analyzing portfolio against requirements...</p>
          </div>
        ) : matches.length > 0 ? (
          matches.map((m, i) => (
            <div key={m.title + i} className="flex items-center w-full py-4 relative px-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--th-border)' }}>
              
              {/* Left: Icon & Title */}
              <div className="flex items-center gap-4 w-[240px] shrink-0 pr-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[16px] font-bold shrink-0" style={{ background: m.color }}>
                  {m.title.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold leading-tight mb-0.5 truncate" style={{ color: 'var(--th-text)' }}>{m.title}</h4>
                  <a href={m.link} className="flex items-center gap-1 text-[11px] hover:underline truncate" style={{ color: 'var(--th-text-dim)' }}>
                    {m.link} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Match Bar */}
              <div className="w-[180px] shrink-0 px-4">
                <span className="text-[11px] font-bold mb-1.5 block" style={{ color: m.match >= 80 ? '#10b981' : '#f59e0b' }}>{m.match}% Match</span>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.match}%`, background: m.match >= 80 ? '#10b981' : '#f59e0b' }} />
                </div>
              </div>

              {/* Strengths */}
              <div className="flex-1 min-w-0 px-4">
                <span className="text-[10px] font-medium mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Strengths</span>
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                  {m.strengths.map((s, idx) => (
                    <span key={s + idx} className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--th-text)' }}>
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="w-[200px] shrink-0 px-4">
                <span className="text-[10px] font-medium mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Missing</span>
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                  {m.missing.map((s, idx) => (
                    <span key={s + idx} className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--th-text)' }}>
                      <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow Button */}
              <div className="w-10 shrink-0 flex justify-end">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--th-bg-secondary)] hover:opacity-80 transition-opacity" style={{ border: '1px solid var(--th-border)' }}>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
                </button>
              </div>
              
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-[13px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>
            No matches found.
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectRankingMatrix({ projects }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mappedProjects = (projects || [])
    .filter(p => p.title && p.intelligence)
    .map(p => ({
      name: p.title,
      color: getColor(p.title),
      arch: p.intelligence.architectureScore?.toFixed(1) || 'N/A',
      scale: p.intelligence.scalabilityScore?.toFixed(1) || 'N/A',
      rec: p.intelligence.recruiterScore?.toFixed(1) || 'N/A',
      interview: p.intelligence.interviewScore?.toFixed(1) || 'N/A',
      resume: p.intelligence.resumeScore?.toFixed(1) || 'N/A'
    }))
    .sort((a, b) => (parseFloat(b.resume) || 0) - (parseFloat(a.resume) || 0));

  if (mappedProjects.length === 0) {
    mappedProjects.push({ name: 'Analyze a project to see rankings', color: '#ccc', arch: '-', scale: '-', rec: '-', interview: '-', resume: '-' });
  }

  const displayProjects = isExpanded ? mappedProjects : mappedProjects.slice(0, 4);

  return (
    <div className="rounded-2xl p-6 shadow-sm flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Project Ranking Matrix</h3>
      </div>
      
      <div className={`overflow-x-auto overflow-y-auto pr-2 hide-scrollbar ${isExpanded ? 'max-h-[300px]' : ''}`}>
        <table className="w-full text-[12px] min-w-[500px]">
          <thead className="sticky top-0 z-10" style={{ background: 'var(--th-card-solid)' }}>
            <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
              <th className="text-left pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Project</th>
              <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Architecture</th>
              <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Scalability</th>
              <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Recruiter</th>
              <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Interview</th>
              <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Resume</th>
            </tr>
          </thead>
          <tbody>
            {displayProjects.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--th-border)' }} className="last:border-0">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: r.color }}>
                      {r.name.charAt(0)}
                    </div>
                    <span className="font-bold" style={{ color: 'var(--th-text)' }}>{r.name}</span>
                  </div>
                </td>
                <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.arch}</span></td>
                <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.scale}</span></td>
                <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.rec}</span></td>
                <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.interview}</span></td>
                <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.resume}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {mappedProjects.length > 4 && (
        <div className="mt-4 flex justify-center shrink-0">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[12px] font-bold px-4 py-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--th-text-dim)', border: '1px solid var(--th-border)' }}
          >
            {isExpanded ? 'View Less' : `View All (${mappedProjects.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

function SkillHeatmap({ projects }) {
  const skillData = {};
  (projects || []).filter(p => p.title).forEach(p => {
    const pStack = p.stack || [];
    const commits = p.metrics?.commitCount || 0;
    const prs = p.metrics?.prCount || 0;
    const tasks = p._count?.tasks || p.tasks?.length || 0;
    const estHours = (commits * 1.5) + (prs * 4) + (tasks * 2) + 5; 
    
    pStack.forEach(s => {
      if (!skillData[s]) skillData[s] = { name: s, count: 0, hoursRaw: 0, commits: 0, files: 0 };
      skillData[s].count += 1;
      skillData[s].hoursRaw += estHours;
      skillData[s].commits += commits;
      skillData[s].files += Math.floor(commits * 2.5); // heuristic
    });
  });

  const skills = Object.values(skillData)
    .sort((a, b) => b.hoursRaw - a.hoursRaw)
    .slice(0, 7)
    .map(s => ({
      ...s,
      color: getColor(s.name),
      hours: `${Math.round(s.hoursRaw)}h`,
      commits: s.commits.toString(),
      files: s.files.toString(),
    }));

  if (skills.length === 0) {
    skills.push({ name: 'Code more!', color: '#888', hoursRaw: 0, hours: '0h', commits: '0', files: '0' });
  }

  const totalHours = skills.reduce((sum, s) => sum + s.hoursRaw, 0);

  let currentPct = 0;
  const gradientStops = totalHours > 0 ? skills.map(s => {
    const pct = (s.hoursRaw / totalHours) * 100;
    const start = currentPct;
    currentPct += pct;
    return `${s.color} ${start}% ${currentPct}%`;
  }).join(', ') : '#e5e7eb 0% 100%';

  return (
    <div className="rounded-2xl p-6 shadow-sm flex flex-col overflow-x-auto" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-[14px] font-bold shrink-0" style={{ color: 'var(--th-text)' }}>Skill Heatmap</h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: 'var(--th-text)' }}><span className="w-2 h-2 rounded-full bg-emerald-500"/> High</span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: 'var(--th-text)' }}><span className="w-2 h-2 rounded-full bg-amber-500"/> Medium</span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: 'var(--th-text)' }}><span className="w-2 h-2 rounded-full bg-red-500"/> Low</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-10 lg:gap-14 min-w-[400px]">
        {/* Dynamic Donut Chart */}
        <div className="w-[180px] h-[180px] shrink-0 relative rounded-full flex items-center justify-center shadow-sm" style={{ background: `conic-gradient(${gradientStops})` }}>
          <div className="w-[140px] h-[140px] rounded-full flex flex-col items-center justify-center shadow-sm" style={{ background: 'var(--th-card-solid)' }}>
            <p className="text-[12px] font-bold" style={{ color: 'var(--th-text-dim)' }}>Total</p>
            <p className="text-[24px] font-bold" style={{ color: 'var(--th-text)' }}>{totalHours.toLocaleString()}</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--th-text-dim)' }}>Hours</p>
          </div>
        </div>

        {/* Legend / Table */}
        <div className="flex-1 w-full">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left" style={{ color: 'var(--th-text-dim)' }}>
                <th className="pb-3 font-semibold">Skill</th>
                <th className="pb-3 font-semibold text-right">Hours</th>
                <th className="pb-3 font-semibold text-right">Commits</th>
                <th className="pb-3 font-semibold text-right">Files Changed</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(s => (
                <tr key={s.name}>
                  <td className="py-2 flex items-center gap-2.5 font-bold" style={{ color: 'var(--th-text)' }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} /> {s.name}
                  </td>
                  <td className="py-2 text-right font-medium" style={{ color: 'var(--th-text)' }}>{s.hours}</td>
                  <td className="py-2 text-right font-medium" style={{ color: 'var(--th-text)' }}>{s.commits}</td>
                  <td className="py-2 text-right font-medium" style={{ color: 'var(--th-text)' }}>{s.files}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AskAISection() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { mutate: askAi, isPending } = useAskAi();

  const pills = [
    'Which project fits Google backend best?',
    'What should I improve for SDE-1?',
    'Which projects should go in my resume?',
    'What backend gaps do I have?',
    'Which project proves scalability?'
  ];

  const handleAsk = (q) => {
    const query = q || question;
    if (!query) return;
    setQuestion(query);
    setAnswer('');
    askAi({ question: query }, {
      onSuccess: (res) => {
        setAnswer(res.data?.answer || "No answer received.");
      }
    });
  };

  return (
    <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>Ask AI about your projects...</h3>
      </div>
      <div className="relative mb-5">
        <input 
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything..." 
          className="w-full pl-5 pr-32 py-4 rounded-xl text-[14px] font-medium outline-none disabled:opacity-50"
          disabled={isPending}
          style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
        />
        {isPending ? (
          <div className="absolute right-[110px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-amber-300 border-t-amber-500 animate-spin pointer-events-none" />
        ) : (
          <Sparkles className="absolute right-[110px] top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300 pointer-events-none" />
        )}
        <button 
          onClick={() => handleAsk()}
          disabled={isPending || !question}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-lg font-bold text-white flex items-center gap-2 text-[13px] hover:opacity-90 transition-opacity bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Analyzing...' : 'Analyze'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {answer && (
        <div className="mb-5 p-4 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text)' }}>
          {answer.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-amber-600 dark:text-amber-400">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {pills.map(p => (
          <button 
            key={p} 
            onClick={() => handleAsk(p)}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50" 
            style={{ border: '1px solid var(--th-border)', color: 'var(--th-text-dim)', background: 'var(--th-bg)' }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. Right Sidebar Components ─── */

function SuggestedUpgrades({ projects }) {
  const createTask = useCreateTask();
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const upgrades = (projects || [])
    .filter(p => p.title && p.intelligence?.missingSkills?.length > 0)
    .map(p => {
      const missing = p.intelligence.missingSkills[0];
      return {
        projectId: p.id,
        project: p.title,
        action: `Add ${missing}`,
        impact: missing.toLowerCase().includes('test') ? 'Medium' : 'High',
        color: getColor(p.title)
      };
    }).slice(0, 3);
  if (upgrades.length === 0) upgrades.push({ projectId: null, project: 'None', action: 'Build something new!', impact: 'High', color: '#888' });

  const handleApply = async () => {
    if (applied) return;
    setIsApplying(true);
    try {
      for (const u of upgrades) {
        if (u.projectId) {
          await createTask.mutateAsync({ projectId: u.projectId, data: { title: u.action } });
        }
      }
      setApplied(true);
    } catch (e) {
      console.error('Failed to apply suggestions', e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>AI Suggested Next Upgrade</h3>
      </div>
      <div className="space-y-2 mb-4">
        {upgrades.map((u, i) => (
          <div key={`${u.project}-${i}`} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" style={{ background: 'var(--th-bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${u.color}15` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: u.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>{u.action}</span>
                <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{u.project}</span>
              </div>
            </div>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--th-text-dim)' }} />
          </div>
        ))}
      </div>
      <button 
        onClick={handleApply}
        disabled={isApplying || applied || upgrades.every(u => !u.projectId)}
        className="w-full py-2.5 rounded-xl font-bold text-white text-[13px] hover:opacity-90 transition-opacity bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isApplying ? 'Creating Tasks...' : applied ? 'Tasks Created!' : 'Apply Suggestions'}
      </button>
    </div>
  );
}

function GrowthGapAnalyzer({ projects }) {
  const allStack = (projects || []).flatMap(p => p.stack || []);
  const standardSkills = [
    { label: 'Cloud Infra', keywords: ['AWS', 'GCP', 'Azure', 'Terraform', 'Docker'], icon: Server },
    { label: 'System Design', keywords: ['Kafka', 'Redis', 'Microservices', 'GraphQL'], icon: Database },
    { label: 'Security', keywords: ['OAuth', 'JWT', 'Auth0', 'CORS'], icon: Shield }
  ];
  const totalProjects = projects.length || 1;
  const gaps = standardSkills.map(skill => {
    const projectsWithSkill = (projects || []).filter(p => (p.stack || []).some(k => skill.keywords.includes(k))).length;
    const pct = Math.round(((totalProjects - projectsWithSkill) / totalProjects) * 100);
    return {
      label: skill.label,
      pct,
      color: pct > 70 ? '#ef4444' : (pct > 40 ? '#f59e0b' : '#10b981'),
      icon: skill.icon
    };
  }).sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <div className="rounded-2xl p-5 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>Growth Gap Analyzer</h3>
        <span className="text-[10px] font-bold cursor-pointer hover:underline" style={{ color: 'var(--th-text-dim)' }}>View All</span>
      </div>
      <div className="space-y-4">
        {gaps.map(g => (
          <div key={g.label} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-20 shrink-0">
              <g.icon className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
              <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>{g.label}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
              <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
            </div>
            <span className="text-[11px] font-bold w-6 text-right" style={{ color: 'var(--th-text-dim)' }}>{g.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResumeIntelligence({ projects }) {
  const ranks = (projects || [])
    .filter(p => p.intelligence?.resumeScore)
    .sort((a, b) => b.intelligence.resumeScore - a.intelligence.resumeScore)
    .slice(0, 3)
    .map(p => ({
      name: p.title,
      score: `${p.intelligence.resumeScore.toFixed(1)}/10`
    }));

  if (ranks.length === 0) {
    ranks.push(...(projects || []).slice(0, 3).map(p => ({ name: p.title, score: 'N/A' })));
  }

  return (
    <div className="rounded-2xl p-5 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>Resume Intelligence</h3>
        <span className="text-[10px] font-bold cursor-pointer hover:underline" style={{ color: 'var(--th-text-dim)' }}>View All</span>
      </div>
      <div className="space-y-3">
        {ranks.map((r, i) => (
          <div key={r.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-5 text-[11px] font-bold text-center" style={{ color: 'var(--th-text-dim)' }}>{i + 1}</span>
              <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{r.name}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-500">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternIntelligence({ projects }) {
  const allPatterns = (projects || []).flatMap(p => p.stack || []);
  const patternCounts = {};
  allPatterns.forEach(p => { patternCounts[p] = (patternCounts[p] || 0) + 1; });
  const patterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(e => e[0]);
  
  if (patterns.length === 0) patterns.push('No patterns yet');

  return (
    <div className="rounded-2xl p-5 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[13px] font-bold mb-4" style={{ color: 'var(--th-text)' }}>Pattern Intelligence</h3>
      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <span key={p} className="text-[10px] px-2.5 py-1 rounded-full font-bold transition-all hover:scale-105 cursor-pointer"
            style={{ 
              background: i < 3 ? '#fffbeb' : 'var(--th-bg-secondary)', 
              color: i < 3 ? '#d97706' : 'var(--th-text-dim)',
              border: i < 3 ? '1px solid #fde68a' : '1px solid var(--th-border)' 
            }}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function InterviewReadiness({ projects }) {
  const tracks = [
    { label: 'Backend', keywords: ['Node.js', 'PostgreSQL', 'Redis', 'Python', 'Go', 'Express', 'Prisma', 'MongoDB'], color: '#10b981' },
    { label: 'Frontend', keywords: ['React', 'Vue', 'Tailwind', 'CSS', 'HTML', 'Next.js', 'Svelte'], color: '#3b82f6' },
    { label: 'Fullstack', keywords: ['TypeScript', 'JavaScript', 'GraphQL', 'Docker', 'AWS'], color: '#8b5cf6' },
  ].map(track => {
    const relevantProjects = (projects || []).filter(p => p.stack?.some(s => track.keywords.includes(s)));
    let avgScore = 0;
    if (relevantProjects.length > 0) {
      const scores = relevantProjects.map(p => p.intelligence?.interviewScore || 0).filter(s => s > 0);
      avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;
    }
    return { label: track.label, pct: Math.round(avgScore * 10), color: track.color };
  });

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[13px] font-bold mb-5" style={{ color: 'var(--th-text)' }}>Interview Readiness</h3>
      <div className="space-y-4">
        {tracks.map(t => (
          <div key={t.label} className="flex items-center gap-4">
            <span className="text-[11px] font-bold w-16" style={{ color: 'var(--th-text)' }}>{t.label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
              <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
            </div>
            <span className="text-[11px] font-bold w-6 text-right" style={{ color: 'var(--th-text-dim)' }}>{t.pct}%</span>
          </div>
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
    <div className="flex flex-col">
      {/* 1. Top KPI Row */}
      <IntelligenceKpiCards data={intelligence} projects={projects} />

      {/* 2. Main Content Layout */}
      <div className="flex flex-col gap-6">
        
        {/* Full Width Job Match Engine */}
        <JobMatchEngine projects={projects} />

        {/* Ranking Matrix & Suggested Upgrades Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <ProjectRankingMatrix projects={projects} />
          <div className="[&>div]:mb-0 h-full"><SuggestedUpgrades projects={projects} /></div>
        </div>

        {/* Remaining Side Panel Widgets - Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="[&>div]:mb-0 h-full"><GrowthGapAnalyzer projects={projects} /></div>
          <div className="[&>div]:mb-0 h-full"><ResumeIntelligence projects={projects} /></div>
          <div className="[&>div]:mb-0 h-full"><InterviewReadiness projects={projects} /></div>
        </div>

        {/* Heatmap & Pattern Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <SkillHeatmap projects={projects} />
          <div className="[&>div]:mb-0 h-full"><PatternIntelligence projects={projects} /></div>
        </div>

        <AskAISection />
      </div>
    </div>
  );
}
