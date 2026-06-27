import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckCircle2, Target, BookOpen,
  BriefcaseBusiness, Code2, FolderKanban, BarChart3,
  Lightbulb, Dumbbell, Wallet, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import { AnimatedPage, Avatar } from '@/design-system/components';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#f5c95a' }],
  },
  {
    label: 'Life',
    items: [
      { to: '/habits', icon: CheckCircle2, label: 'Habits', color: '#10b981' },
      { to: '/goals', icon: Target, label: 'Goals', color: '#f59e0b' },
      { to: '/reflections', icon: BookOpen, label: 'Reflections', color: '#8b5cf6' },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/jobs', icon: BriefcaseBusiness, label: 'Job Tracker', color: '#3b82f6' },
      { to: '/dsa', icon: Code2, label: 'DSA Tracker', color: '#ec4899' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'Projects', color: '#f97316' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics', color: '#06b6d4' },
      { to: '/insights', icon: Lightbulb, label: 'Insights', color: '#eab308' },
    ],
  },
  {
    label: 'Body & Money',
    items: [
      { to: '/fitness', icon: Dumbbell, label: 'Fitness', color: '#ef4444' },
      { to: '/finance', icon: Wallet, label: 'Finance', color: '#14b8a6' },
    ],
  },
];

export default function MobileMenuPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <AnimatedPage>
      {/* Hide this entire page on desktop, just in case someone manually navigates to /menu on desktop */}
      <div className="pb-8 lg:hidden">
        {/* Header Title */}
        <h1 className="text-2xl font-bold mb-6 px-1 tracking-tight" style={{ color: 'var(--th-text)' }}>Menu</h1>

        {/* Profile Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/profile')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl mb-8 transition-transform active:scale-[0.98] text-left shadow-sm cursor-pointer select-none"
          style={{ background: 'var(--th-card-solid)', border: '1px solid var(--th-border)' }}
        >
          <Avatar src={user?.avatar} alt={user?.name} size="lg" bordered={true} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate" style={{ color: 'var(--th-text)' }}>
              {user?.name || 'User'}
            </h2>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--th-text-dim)' }}>
              Level {Math.floor((user?.totalXp || 0) / 1000) + 1} • {user?.totalXp || 0} XP
            </p>
          </div>
          <ChevronRight className="w-5 h-5 opacity-40" style={{ color: 'var(--th-text)' }} />
        </div>

        {/* Navigation Grid */}
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--th-text-dim)' }}>
                {group.label}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className="flex flex-col p-4 rounded-2xl transition-transform active:scale-[0.98] shadow-sm text-left relative overflow-hidden group"
                    style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-active:opacity-10 transition-opacity">
                      <item.icon className="w-16 h-16" style={{ color: item.color || 'var(--th-primary)' }} />
                    </div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ background: 'var(--th-card-solid)' }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color || 'var(--th-primary)' }} />
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 space-y-3" style={{ borderTop: '1px solid var(--th-border)' }}>
          <button
            onClick={() => navigate('/profile?tab=settings')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-transform active:scale-[0.98] shadow-sm"
            style={{ background: 'var(--th-bg-secondary)', border: '1px solid var(--th-border)' }}
          >
            <Settings className="w-5 h-5" style={{ color: 'var(--th-text-dim)' }} />
            <span className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>Settings</span>
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-transform active:scale-[0.98] shadow-sm"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-[13px] font-bold text-red-500">Log Out</span>
          </button>
        </div>
      </div>
      
      {/* Desktop warning if accessed directly */}
      <div className="hidden lg:flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--th-text)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--th-text)' }}>Mobile Menu</h2>
          <p className="text-sm max-w-md" style={{ color: 'var(--th-text-secondary)' }}>This page is designed for mobile navigation. Please use the sidebar on desktop.</p>
        </div>
      </div>
    </AnimatedPage>
  );
}
