import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SideNav } from './SideNav';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import { PageSkeleton } from '@/design-system/components/PageSkeleton';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen page-bg">
      {/* Desktop Sidebar */}
      <SideNav collapsed={collapsed} onToggleCollapse={() => setCollapsed((p) => !p)} />

      {/* Mobile floating theme toggle — fixed top-right, every page */}
      <div className="lg:hidden fixed top-7 right-4 z-50">
        <ThemeToggle size="small" />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
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
