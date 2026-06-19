import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { AppLayout } from '@/design-system/layouts/AppLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
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
const NotFoundPage = lazy(() => import('@/app/NotFoundPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full page-bg flex items-center justify-center">
      {/* Invisible loader to prevent layout shifts while lazy loading chunks */}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

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
        </Route>

        {/* Redirects & 404 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
