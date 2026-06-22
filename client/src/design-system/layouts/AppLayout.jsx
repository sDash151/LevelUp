import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SideNav } from './SideNav';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import { PageSkeleton } from '@/design-system/components/PageSkeleton';
import { useUser } from '@/features/auth/hooks/useAuth';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useUser(); // Fetches full profile & syncs with Zustand

  return (
    <div className="flex min-h-screen page-bg">
      {/* Desktop Sidebar */}
      <SideNav collapsed={collapsed} onToggleCollapse={() => setCollapsed((p) => !p)} />

      {/* Mobile floating theme toggle — fixed top-right, every page */}
      <div className="lg:hidden fixed right-4 z-50 transition-all duration-300" style={{ top: 'calc(env(safe-area-inset-top) + 1.25rem)' }}>
        <ThemeToggle size="small" />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-[100dvh] pb-24 lg:pb-0 overflow-x-hidden pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
