import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, CheckCircle2, Target, BookOpen,
  BriefcaseBusiness, Code2, FolderKanban, BarChart3,
  Lightbulb, Dumbbell, Wallet, PanelLeftClose, PanelLeft,
  ChevronRight, Workflow,
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/authStore';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Life',
    items: [
      { to: '/habits', icon: CheckCircle2, label: 'Habits' },
      { to: '/goals', icon: Target, label: 'Goals' },
      { to: '/reflections', icon: BookOpen, label: 'Reflections' },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/jobs', icon: BriefcaseBusiness, label: 'Job Tracker' },
      { to: '/dsa', icon: Code2, label: 'DSA Tracker' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/insights', icon: Lightbulb, label: 'Insights' },
    ],
  },
  {
    label: 'Body',
    items: [{ to: '/fitness', icon: Dumbbell, label: 'Fitness' }],
  },
  {
    label: 'Money',
    items: [{ to: '/finance', icon: Wallet, label: 'Finance' }],
  },
];

function GoldLogo({ collapsed }) {
  return (
    <div className={clsx('flex items-center gap-2.5', collapsed && 'justify-center')}>
      <img src="/MainLogo.png" alt="LevelUp" className="w-12 h-12 shrink-0 object-contain drop-shadow-md" />
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-lg tracking-tight"
          style={{ color: 'var(--th-primary)' }}
        >
          LevelUp
        </motion.span>
      )}
    </div>
  );
}

export function SideNav({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-screen sticky top-0 z-50 overflow-hidden"
      style={{ background: 'var(--th-nav-bg)', backdropFilter: 'blur(20px) saturate(180%)', borderRight: '1px solid var(--th-border)' }}
    >
      {/* Logo + Theme Toggle */}
      <div className={clsx('flex items-center gap-3 px-5 py-5 transition-colors duration-300', collapsed && 'justify-center px-0')} style={{ borderBottom: '1px solid var(--th-border)' }}>
        <GoldLogo collapsed={collapsed} />
        {!collapsed && (
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle size="small" />
            <button onClick={onToggleCollapse} className="transition-colors" style={{ color: 'var(--th-text-dim)' }}>
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--th-text-dim)' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <NavLink key={item.to} to={item.to} className="block relative">
                    <div
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group',
                        collapsed && 'justify-center px-0 py-2.5',
                      )}
                      style={isActive
                        ? { color: 'var(--th-primary)', background: 'rgba(232, 185, 74, 0.08)' }
                        : { color: 'var(--th-text-muted)' }
                      }
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidenavIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: 'var(--th-primary)', boxShadow: '0 0 12px rgba(var(--th-primary-rgb), )' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className={clsx('w-[18px] h-[18px] shrink-0', collapsed && 'w-5 h-5')} />
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium whitespace-nowrap">
                          {item.label}
                        </motion.span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <NavLink to="/profile" className={clsx("mb-2", collapsed ? "mx-auto" : "mx-3")}>
        <div className={clsx("flex items-center gap-3 py-2.5 rounded-xl transition-colors group", collapsed ? "justify-center" : "px-3")} style={{ '--hover-bg': 'var(--th-highlight)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, var(--th-primary), var(--th-primary-dark))', color: '#08080d' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--th-text)' }}>{user?.name || 'User'}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--th-text-dim)' }}>Keep leveling up! 🚀</p>
              </div>
              <ChevronRight className="w-4 h-4 transition-colors" style={{ color: 'var(--th-text-dim)' }} />
            </>
          )}
        </div>
      </NavLink>

      {/* Collapse toggle */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 py-3" style={{ borderTop: '1px solid var(--th-border)' }}>
          <ThemeToggle size="small" />
          <button onClick={onToggleCollapse} className="transition-colors" style={{ color: 'var(--th-text-dim)' }}>
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}
      {!collapsed && (
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center gap-2 px-4 py-3 transition-colors"
          style={{ borderTop: '1px solid var(--th-border)', color: 'var(--th-text-dim)' }}
        >
          <PanelLeftClose className="w-4 h-4" />
          <span className="text-xs">Collapse</span>
        </button>
      )}
    </motion.aside>
  );
}
