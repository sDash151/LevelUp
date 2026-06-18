import { useEffect } from 'react';
import { Providers } from './Providers';
import { AppRouter } from './Router';
import { ErrorBoundary } from './ErrorBoundary';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineBanner } from './OfflineBanner';
import { useThemeStore } from '@/shared/stores/themeStore';

export function App() {
  const theme = useThemeStore((s) => s.theme);

  // Ensure data-theme attr is synced on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <Providers>
        <OfflineBanner />
        <AppRouter />
        <PWAInstallPrompt />
      </Providers>
    </ErrorBoundary>
  );
}
