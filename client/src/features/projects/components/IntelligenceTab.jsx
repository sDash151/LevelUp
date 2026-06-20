import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Target, Star, AlertTriangle, Sparkles, BarChart3,
  Award, Briefcase, Code2, Search, Send, ArrowRight, ExternalLink,
  Zap, Lock, Globe, Wifi, Activity, Database, Server,
  ChevronRight, MoreVertical, Layout, Cpu, CheckCircle2,
  Circle, Play, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { useProjects, useIntelligence, useJobSync } from '../hooks/useProjects';
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
function IntelligenceKpiCards({ data }) {
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
            <span className="text-[22px] font-bold leading-none tracking-tight" style={{ color: 'var(--th-text)' }}>8.4</span>
            <span className="text-[13px] font-medium leading-none mb-0.5" style={{ color: 'var(--th-text-dim)' }}>/ 10</span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Overall build quality</p>
        </div>
        <div className="flex items-end justify-between mt-3 relative z-10">
          <span className="text-[9px] font-bold text-emerald-500 flex items-center">↑ 0.6 this month</span>
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
            <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>Google Backend</p>
            <p className="text-[22px] font-bold leading-none tracking-tight mb-1" style={{ color: 'var(--th-text)' }}>81%</p>
            <p className="text-[10px] mb-2" style={{ color: 'var(--th-text-dim)' }}>Based on active job</p>
            <span className="text-[9px] font-bold text-emerald-500 flex items-center">↑ 9% vs last week</span>
          </div>
          <CircularProgress percent={81} color="#10b981" size={44} strokeWidth={4} />
        </div>
      </div>

      {/* Strongest Project */}
      <div className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--th-card)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold" style={{ color: 'var(--th-text)' }}>Strongest Project</span>
          </div>
          <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--th-text)' }}>Eventria</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 inline-block mb-2 border border-amber-100">Best for interviews</span>
        </div>
        <p className="text-[11px] font-medium relative z-10 mt-1" style={{ color: 'var(--th-text-dim)' }}>Score: <span className="font-bold text-blue-500">9.1 / 10</span></p>
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
            <p className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>Caching</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>Testing</p>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--th-text)' }}>System Design</p>
          </div>
        </div>
        <p className="text-[9px] font-bold text-orange-500 mt-2 relative z-10">Focus area</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {/* Radar abstract icon */}
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
          <CircularProgress percent={74} color="#f59e0b" size={72} strokeWidth={6} label="74%" />
          <div className="flex-1">
            <p className="text-[11px] leading-snug mb-2" style={{ color: 'var(--th-text-dim)' }}>Portfolio resume score</p>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center">↑ 8% this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. Left Column Components ─── */

function JobMatchEngine({ projects }) {
  const reqSkills = ['Node.js', 'Redis', 'Queues', 'Scalability', 'System Design', 'REST APIs', 'PostgreSQL'];
  const matches = [
    { title: 'Eventria', match: 91, strengths: ['Payments', 'Queues', 'Webhooks', 'Prisma'], missing: ['Caching', 'Rate limiting'], link: 'eventria.vercel.app', color: '#8b5cf6' },
    { title: 'LevelUp', match: 82, strengths: ['AI Systems', 'Analytics', 'Architecture'], missing: ['Infra', 'Workers'], link: 'levelup.dev', color: '#14b8a6' },
    { title: 'Portfolio', match: 51, strengths: ['UI/UX', 'Performance'], missing: ['Backend depth', 'System Design'], link: 'souravdash.dev', color: '#f59e0b' },
  ];

  return (
    <div className="rounded-2xl p-6 shadow-sm mb-6 overflow-x-auto" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between min-w-[800px] gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--th-text)' }}>Job Match Engine</h3>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>Match your projects against active job requirements.</p>
        </div>
        <div className="flex flex-col pl-6" style={{ borderLeft: '1px solid var(--th-border)' }}>
          <div className="mb-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">Active Job</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="pr-10">
              <p className="text-[15px] font-bold leading-tight" style={{ color: 'var(--th-text)' }}>Google</p>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--th-text-dim)' }}>Backend Engineer</p>
            </div>
            <MoreVertical className="w-4 h-4 cursor-pointer absolute right-0 top-1/2 -translate-y-1/2" style={{ color: 'var(--th-text-dim)' }} />
          </div>
        </div>
      </div>

      {/* Required Skills */}
      <div className="mb-6 min-w-[800px]">
        <h4 className="text-[12px] font-bold mb-3" style={{ color: 'var(--th-text)' }}>Required Skills</h4>
        <div className="flex flex-wrap gap-2.5">
          {reqSkills.map(s => (
            <span key={s} className="text-[11px] px-3.5 py-1.5 rounded-lg font-semibold bg-[#fffbeb] border border-[#fde68a] dark:bg-amber-500/10 dark:border-amber-500/20" style={{ color: 'var(--th-text)' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="min-w-[800px] mb-4 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--th-border)', background: 'transparent' }}>
        {matches.map((m, i) => (
          <div key={m.title} className="flex items-center w-full py-4 relative px-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--th-border)' }}>
            
            {/* Left: Icon & Title */}
            <div className="flex items-center gap-4 w-[240px] shrink-0 pr-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[16px] font-bold shrink-0" style={{ background: m.color }}>
                {m.title.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold leading-tight mb-0.5 truncate" style={{ color: 'var(--th-text)' }}>{m.title}</h4>
                <a href="#" className="flex items-center gap-1 text-[11px] hover:underline truncate" style={{ color: 'var(--th-text-dim)' }}>
                  {m.link} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Match Bar */}
            <div className="w-[180px] shrink-0 px-4">
              <span className="text-[11px] font-bold mb-1.5 block" style={{ color: m.match >= 80 ? '#10b981' : '#f59e0b' }}>{m.match}% Match</span>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--th-bg-secondary)' }}>
                <div className="h-full rounded-full" style={{ width: `${m.match}%`, background: m.match >= 80 ? '#10b981' : '#f59e0b' }} />
              </div>
            </div>

            {/* Strengths */}
            <div className="flex-1 min-w-0 px-4">
              <span className="text-[10px] font-medium mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Strengths</span>
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                {m.strengths.map(s => (
                  <span key={s} className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--th-text)' }}>
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" /> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div className="w-[200px] shrink-0 px-4">
              <span className="text-[10px] font-medium mb-1.5 block" style={{ color: 'var(--th-text-dim)' }}>Missing</span>
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                {m.missing.map(s => (
                  <span key={s} className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--th-text)' }}>
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
        ))}
      </div>

      <div className="flex justify-end pt-2 min-w-[800px]">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors dark:bg-amber-500/10 dark:text-amber-500 dark:hover:bg-amber-500/20">
          View Full Role Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProjectRankingMatrix() {
  const rows = [
    { name: 'Eventria', color: '#8b5cf6', arch: '9.2', scale: '9.1', rec: '9.3', comp: '9.0', demo: '9.2' },
    { name: 'LevelUp', color: '#14b8a6', arch: '8.6', scale: '8.3', rec: '8.7', comp: '8.4', demo: '8.5' },
    { name: 'FitSense', color: '#ec4899', arch: '7.8', scale: '7.2', rec: '7.6', comp: '7.3', demo: '7.4' },
    { name: 'Portfolio', color: '#f59e0b', arch: '6.1', scale: '5.3', rec: '5.8', comp: '5.5', demo: '6.0' },
    { name: 'VehicleHelp', color: '#3b82f6', arch: '6.8', scale: '6.2', rec: '6.5', comp: '6.4', demo: '6.6' },
  ];

  return (
    <div className="rounded-2xl p-6 shadow-sm overflow-x-auto" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        <h3 className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>Project Ranking Matrix</h3>
      </div>
      <table className="w-full text-[12px] min-w-[500px]">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--th-border)' }}>
            <th className="text-left pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Project</th>
            <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Architecture</th>
            <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Scalability</th>
            <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Recruiter Value</th>
            <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Complexity</th>
            <th className="text-center pb-3 font-semibold" style={{ color: 'var(--th-text-dim)' }}>Demo Strength</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
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
              <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.comp}</span></td>
              <td className="py-3.5 text-center"><span className="font-bold text-emerald-500">{r.demo}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkillHeatmap() {
  const skills = [
    { name: 'Node.js', color: '#10b981', hours: '320h', commits: '1,247', files: '3,842' },
    { name: 'React', color: '#3b82f6', hours: '210h', commits: '842', files: '2,203' },
    { name: 'PostgreSQL', color: '#8b5cf6', hours: '180h', commits: '621', files: '1,732' },
    { name: 'Prisma', color: '#f97316', hours: '150h', commits: '512', files: '1,421' },
    { name: 'Docker', color: '#14b8a6', hours: '120h', commits: '421', files: '1,203' },
    { name: 'Redis', color: '#ef4444', hours: '98h', commits: '312', files: '912' },
    { name: 'Firebase', color: '#f59e0b', hours: '70h', commits: '201', files: '721' },
  ];

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
        {/* Donut Chart Mock */}
        <div className="w-[180px] h-[180px] shrink-0 relative rounded-full border-[20px] border-emerald-500 border-t-amber-500 border-l-blue-500 border-r-purple-500 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[12px] font-bold" style={{ color: 'var(--th-text-dim)' }}>Total</p>
            <p className="text-[24px] font-bold" style={{ color: 'var(--th-text)' }}>1,248</p>
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
  const pills = [
    'Which project fits Google backend best?',
    'What should I improve for SDE-1?',
    'Which projects should go in my resume?',
    'What backend gaps do I have?',
    'Which project proves scalability?'
  ];

  return (
    <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>Ask AI about your projects...</h3>
      </div>
      <div className="relative mb-5">
        <input 
          placeholder="Ask anything..." 
          className="w-full pl-5 pr-32 py-4 rounded-xl text-[14px] font-medium outline-none"
          style={{ background: 'var(--th-bg)', border: '1px solid var(--th-border)', color: 'var(--th-text)' }}
        />
        <Sparkles className="absolute right-[110px] top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300 pointer-events-none" />
        <button className="absolute right-2 top-2 bottom-2 px-6 rounded-lg font-bold text-white flex items-center gap-2 text-[13px] hover:opacity-90 transition-opacity bg-amber-500">
          Analyze <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {pills.map(p => (
          <button key={p} className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02]" style={{ border: '1px solid var(--th-border)', color: 'var(--th-text-dim)', background: 'var(--th-bg)' }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. Right Sidebar Components ─── */

function SuggestedUpgrades() {
  const upgrades = [
    { title: 'Add Redis caching to Eventria', icon: Database, color: '#10b981' },
    { title: 'Implement rate limiting', icon: Shield, color: '#3b82f6' },
    { title: 'Add queue failure dashboard', icon: Activity, color: '#f59e0b' },
  ];

  return (
    <div className="rounded-2xl p-5 shadow-sm mb-6" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>AI Suggested Next Upgrade</h3>
      </div>
      <div className="space-y-2 mb-4">
        {upgrades.map(u => (
          <div key={u.title} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors" style={{ background: 'var(--th-bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${u.color}15` }}>
                <u.icon className="w-3 h-3" style={{ color: u.color }} />
              </div>
              <span className="text-[12px] font-bold" style={{ color: 'var(--th-text)' }}>{u.title}</span>
            </div>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--th-text-dim)' }} />
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-xl font-bold text-white text-[13px] hover:opacity-90 transition-opacity bg-amber-500">
        Apply Suggestions
      </button>
    </div>
  );
}

function GrowthGapAnalyzer() {
  const gaps = [
    { label: 'Testing', pct: 38, color: '#ef4444', icon: Shield },
    { label: 'Infra', pct: 41, color: '#f59e0b', icon: Server },
    { label: 'Caching', pct: 49, color: '#f59e0b', icon: Database },
    { label: 'Monitoring', pct: 28, color: '#ef4444', icon: Activity },
  ];

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

function ResumeIntelligence() {
  const ranks = [
    { name: 'Eventria', score: '9.1/10' },
    { name: 'LevelUp', score: '8.4/10' },
    { name: 'FitSense', score: '7.8/10' },
  ];

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

function PatternIntelligence() {
  const patterns = ['Auth', 'Queues', 'Caching', 'WebSockets', 'Cron', 'Rate Limiting', 'Analytics', 'Payments', 'Real-time', 'File Upload', 'Search', 'AI'];

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

function InterviewReadiness() {
  const tracks = [
    { label: 'Backend', pct: 82, color: '#10b981' },
    { label: 'Frontend', pct: 74, color: '#3b82f6' },
    { label: 'Fullstack', pct: 79, color: '#8b5cf6' },
  ];

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
      <IntelligenceKpiCards data={intelligence} />

      {/* 2. Main Content Layout */}
      <div className="flex flex-col gap-6">
        
        {/* Full Width Job Match Engine */}
        <JobMatchEngine projects={projects} />

        {/* Ranking Matrix & Suggested Upgrades Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <ProjectRankingMatrix />
          <div className="[&>div]:mb-0 h-full"><SuggestedUpgrades /></div>
        </div>

        {/* Remaining Side Panel Widgets - Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="[&>div]:mb-0 h-full"><GrowthGapAnalyzer /></div>
          <div className="[&>div]:mb-0 h-full"><ResumeIntelligence /></div>
          <div className="[&>div]:mb-0 h-full"><InterviewReadiness /></div>
        </div>

        {/* Heatmap & Pattern Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <SkillHeatmap />
          <div className="[&>div]:mb-0 h-full"><PatternIntelligence /></div>
        </div>

        <AskAISection />
      </div>
    </div>
  );
}
