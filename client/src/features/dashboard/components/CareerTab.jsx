import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Code2, ArrowRight, BrainCircuit, Target, CheckCircle2, TrendingUp, Search } from 'lucide-react';
import { DCard, ProgressRing, StatCard } from './DashboardShared';
import { useJobStats } from '../../jobs/hooks/useJobs';
import { useDsaDashboard } from '../../dsa/hooks/useDsa';

export default function CareerTab() {
  const navigate = useNavigate();
  const { data: jobStats, isLoading: isJobStatsLoading } = useJobStats();
  const { data: dsaStats, isLoading: isDsaStatsLoading } = useDsaDashboard();

  if (isJobStatsLoading || isDsaStatsLoading) return null;

  // Safe Job Stats
  const totalApplications = jobStats?.total || 0;
  const interviews = jobStats?.interviews || 0;
  const offers = jobStats?.offers || 0;
  const rejections = jobStats?.rejections || 0;
  const saved = jobStats?.byStatus?.find(s => s.status === 'SAVED')?._count?.id || 0;
  
  const activeApplications = Math.max(0, totalApplications - rejections - offers - saved);
  const activeAppsPct = totalApplications > 0 ? Math.round((activeApplications / totalApplications) * 100) : 0;

  // Safe DSA Stats
  const problemsSolved = dsaStats?.totalSolved || 0;
  const dsaStreak = dsaStats?.streak || 0;
  const easySolved = dsaStats?.easySolved || 0;
  const mediumSolved = dsaStats?.mediumSolved || 0;
  const hardSolved = dsaStats?.hardSolved || 0;
  const targetProblems = 500; // arbitrary target for visualization
  const dsaProgress = Math.min(Math.round((problemsSolved / targetProblems) * 100), 100);

  return (
    <div className="space-y-4">
      {/* ─── High Level Job / DSA Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard title="Active Applications" icon={Briefcase} iconColor="#3b82f6" delay={0.1}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing percent={activeAppsPct} size={100} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{activeApplications}</span>
              </div>
            </div>
            <span className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>Keep applying!</span>
          </div>
        </StatCard>

        <StatCard title="Interviews" icon={Target} iconColor="#f97316" delay={0.15}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{interviews}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Scheduled / In Progress</p>
          <div className="mt-3 flex gap-2">
            <span className="text-[12px] px-2 py-1 rounded-md" style={{ background: 'rgba(var(--th-primary-rgb), 0.1)', color: 'var(--th-primary)' }}>{offers} Offers</span>
          </div>
        </StatCard>

        <StatCard title="DSA Solved" icon={Code2} iconColor="#10b981" delay={0.2}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing percent={dsaProgress} size={100} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{problemsSolved}</span>
              </div>
            </div>
            <span className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>of {targetProblems} Target</span>
          </div>
        </StatCard>

        <StatCard title="DSA Streak" icon={TrendingUp} iconColor="#ef4444" delay={0.25}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{dsaStreak}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>days</p>
          <p className="text-[12px] mt-3" style={{ color: 'var(--th-text-dim)' }}>Consistency is key</p>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Jobs Section ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DCard className="h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>Job Tracker</h3>
            </div>
            <p className="text-[13px] mb-6" style={{ color: 'var(--th-text-secondary)' }}>
              Track your applications, manage interviews, and land your dream role.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--th-text-muted)' }}>Total Applications</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{totalApplications}</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--th-text-muted)' }}>Interviews</p>
                <p className="text-2xl font-bold text-orange-500">{interviews}</p>
              </div>
            </div>

            <button onClick={() => navigate('/jobs')} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ background: '#3b82f6', color: '#fff' }}>
              Open Job Tracker <ArrowRight className="w-4 h-4" />
            </button>
          </DCard>
        </motion.div>

        {/* ─── DSA Section ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <DCard className="h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <Code2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>DSA Tracker</h3>
            </div>
            <p className="text-[13px] mb-6" style={{ color: 'var(--th-text-secondary)' }}>
              Master Data Structures & Algorithms and crush your technical interviews.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                <span className="text-[13px] font-medium text-emerald-500">Easy</span>
                <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{easySolved}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                <span className="text-[13px] font-medium text-yellow-500">Medium</span>
                <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{mediumSolved}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>
                <span className="text-[13px] font-medium text-red-500">Hard</span>
                <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>{hardSolved}</span>
              </div>
            </div>

            <button onClick={() => navigate('/dsa')} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ background: '#10b981', color: '#fff' }}>
              Solve Problem <ArrowRight className="w-4 h-4" />
            </button>
          </DCard>
        </motion.div>
      </div>
    </div>
  );
}
