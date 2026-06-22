import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { AppLayout } from '@/design-system/layouts/AppLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const OnboardingPage = lazy(() => import('@/features/auth/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const HabitsPage = lazy(() => import('@/features/habits/pages/HabitsPage'));
const GoalsPage = lazy(() => import('@/features/goals/pages/GoalsPage'));
const ReflectionsPage = lazy(() => import('@/features/reflections/pages/ReflectionsPage'));
const DsaPage = lazy(() => import('@/features/dsa/pages/DsaPage'));
const JobsPage = lazy(() => import('@/features/jobs/pages/JobsPage'));
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage'));
const FinancePage = lazy(() => import('@/features/finance/pages/FinancePage'));
const FitnessPage = lazy(() => import('@/features/fitness/pages/FitnessPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const InsightsPage = lazy(() => import('@/features/insights/pages/InsightsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const MobileMenuPage = lazy(() => import('@/features/dashboard/pages/MobileMenuPage'));
const NotFoundPage = lazy(() => import('@/app/NotFoundPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full page-bg flex items-center justify-center">
      {/* Invisible loader to prevent layout shifts while lazy loading chunks */}
    </div>
  );
}

function ProtectedRoute({ children, allowUnonboarded = false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // If they are authenticated but not onboarded, and trying to access a protected route (not onboarding)
  if (!allowUnonboarded && user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If they ARE onboarded and try to access onboarding page
  if (allowUnonboarded && user && user.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Semi-protected onboarding route */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute allowUnonboarded={true}>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected routes inside AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reflections" element={<ReflectionsPage />} />
          <Route path="/dsa" element={<DsaPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
        </Route>

        {/* Redirects & 404 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
