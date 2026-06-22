import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Box, ArrowRight, TrendingUp, Cpu } from 'lucide-react';
import { DCard, ProgressRing, StatCard } from './DashboardShared';
import { useProjectStats } from '../../projects/hooks/useProjects';

export default function GrowthTab() {
  const navigate = useNavigate();
  const { data: rawData, isLoading } = useProjectStats();

  if (isLoading) return null;

  const projectStats = rawData?.data?.stats || rawData?.stats || rawData || {};

  const activeProjects = projectStats?.byStatus?.filter(s => ['BUILDING', 'TESTING', 'PLANNING'].includes(s.status))
    .reduce((acc, curr) => acc + curr._count.id, 0) || 0;
  const completedProjects = projectStats?.byStatus?.find(s => s.status === 'SHIPPED')?._count?.id || 0;
  const totalProjects = projectStats?.total || 0;
  const totalCommits = projectStats?.github?.totalCommits || 0;
  
  const completionPct = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* ─── High Level Growth Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <StatCard title="Active Projects" icon={Rocket} iconColor="#a855f7" delay={0.1}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{activeProjects}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Currently building</p>
          <div className="mt-3 h-2 rounded-full" style={{ background: 'var(--th-highlight)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} transition={{ duration: 1 }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a855f7, #c084fc)' }} />
          </div>
        </StatCard>

        <StatCard title="Completed" icon={Box} iconColor="#10b981" delay={0.15}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ProgressRing percent={completionPct} size={100} stroke={7} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--th-text)' }}>{completedProjects}</span>
              </div>
            </div>
            <span className="text-[12px] mt-1" style={{ color: 'var(--th-text-muted)' }}>Shipped</span>
          </div>
        </StatCard>

        <StatCard title="Total Builders" icon={TrendingUp} iconColor="#3b82f6" delay={0.2}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{totalProjects}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Projects tracked</p>
        </StatCard>

        <StatCard title="Git Activity" icon={Cpu} iconColor="#f97316" delay={0.25}>
          <p className="text-3xl font-bold" style={{ color: 'var(--th-text)' }}>{totalCommits}</p>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>Recent Commits</p>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Projects CTA ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <DCard className="h-full flex flex-col md:flex-row items-center justify-between p-8 gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <Rocket className="w-6 h-6" style={{ color: '#a855f7' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>Project HQ</h3>
              </div>
              <p className="text-[14px] leading-relaxed max-w-lg mb-6" style={{ color: 'var(--th-text-secondary)' }}>
                Your engineering portfolio starts here. Build faster, track your GitHub progress automatically, and let our AI coach guide your architecture decisions.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/projects')} className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                  style={{ background: '#a855f7', color: '#fff' }}>
                  Open Projects <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex w-48 h-48 rounded-full items-center justify-center relative shrink-0">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <Box className="w-24 h-24 text-purple-400 relative z-10" />
            </div>
          </DCard>
        </motion.div>
      </div>
    </div>
  );
}
