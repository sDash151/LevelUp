import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckCircle2, Target, BarChart3, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: CheckCircle2, label: 'Habits' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/analytics', icon: BarChart3, label: 'Track' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIndex = tabs.findIndex((t) => location.pathname.startsWith(t.to));

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom transition-colors duration-300"
      style={{ background: 'var(--th-nav-bg)', backdropFilter: 'blur(20px) saturate(180%)', borderTop: '1px solid var(--th-border)' }}
    >

      <div className="flex items-center justify-around h-14 px-2 relative">
        {/* Animated background pill */}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-1 h-[calc(100%-8px)] rounded-2xl"
            style={{ width: `${100 / tabs.length}%`, background: 'rgba(232, 185, 74, 0.08)' }}
            animate={{ left: `${(activeIndex / tabs.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 z-10 transition-colors"
              style={{ color: isActive ? 'var(--th-primary)' : 'var(--th-text-muted)' }}
            >
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <tab.icon className="w-5 h-5" style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(var(--th-primary-rgb), ))' } : undefined} />
              </motion.div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileNavDot"
                  className="absolute -top-0.5 w-1 h-1 rounded-full"
                  style={{ background: 'var(--th-primary)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
