import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckCircle2, Dumbbell, Wallet, LayoutGrid } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: CheckCircle2, label: 'Habits' },
  { to: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/menu', icon: LayoutGrid, label: 'Menu' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIndex = tabs.findIndex((t) => location.pathname.startsWith(t.to));

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300"
      style={{ background: 'var(--th-nav-bg)', backdropFilter: 'blur(20px) saturate(180%)', borderTop: '1px solid var(--th-border)' }}
    >

      <div className="flex items-center justify-around h-14 px-2 relative">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full z-10 transition-colors"
              style={{ color: isActive ? 'var(--th-primary)' : 'var(--th-text-muted)' }}
            >
              {/* Animated background pill perfectly scoped to the button */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavBg"
                  className="absolute inset-1 rounded-2xl -z-10"
                  style={{ background: 'rgba(232, 185, 74, 0.08)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <tab.icon className="w-5 h-5" style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(var(--th-primary-rgb), ))' } : undefined} />
              </motion.div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
