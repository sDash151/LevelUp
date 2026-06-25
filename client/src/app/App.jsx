import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            style: {
              background: 'var(--th-bg-secondary)',
              color: 'var(--th-text)',
              border: '1px solid var(--th-border)',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: 'var(--th-primary)',
                secondary: 'var(--th-bg-secondary)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'var(--th-bg-secondary)',
              },
            },
          }}
        />
      </Providers>
    </ErrorBoundary>
  );
}
