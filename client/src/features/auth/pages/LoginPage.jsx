import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Github } from 'lucide-react';
import { ThemeToggle } from '@/design-system/components/ThemeToggle';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUser } from '../hooks/useAuth';

// ... (Logo and MobileArcs)

function Logo({ size = 'default' }) {
  const isLarge = size === 'large';
  return (
    <div className={clsx('flex items-center', isLarge ? 'gap-3' : 'gap-2.5')}>
      <div className={clsx('flex items-center justify-center', isLarge ? 'w-16 h-16' : 'w-12 h-12')}>
        <img src="/MainLogo.png" alt="LevelUp Logo" className={clsx('shrink-0 object-contain drop-shadow-md', isLarge ? 'w-16 h-16' : 'w-12 h-12')} />
      </div>
      <span className={clsx('font-bold tracking-tight', isLarge ? 'text-xl' : 'text-lg')} style={{ color: 'var(--th-primary)' }}>LevelUp</span>
    </div>
  );
}

function MobileArcs() {
  return (
    <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none lg:hidden overflow-hidden">
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
        <motion.path d="M300,0 Q200,80 180,200" stroke="url(#arc1)" strokeWidth="1.5" opacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeOut' }} />
        <motion.path d="M300,20 Q220,100 200,230" stroke="url(#arc2)" strokeWidth="1" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }} />
        <defs>
          <linearGradient id="arc1" x1="300" y1="0" x2="180" y2="200"><stop stopColor="#F5A623"/><stop offset="1" stopColor="#9333ea" stopOpacity="0.3"/></linearGradient>
          <linearGradient id="arc2" x1="300" y1="20" x2="200" y2="230"><stop stopColor="var(--th-primary)" stopOpacity="0.8"/><stop offset="1" stopColor="#7c3aed" stopOpacity="0.2"/></linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore(s => s.setAccessToken);
  const setAuth = useAuthStore(s => s.setAuth);

  useEffect(() => {
    // Check if we just redirected back from GitHub with a token
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const onboarded = searchParams.get('onboarded');
    
    if (token) {
      setAuth({ isOnboarded: onboarded === 'true' }, token); // Temporary mock user until fetch
      if (onboarded === 'true') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [location, navigate, setAuth]);

  const handleGithubLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api/v1`;
    window.location.href = `${apiUrl}/auth/github`;
  };

  return (
    <div className="min-h-[100dvh] flex" style={{ backgroundColor: 'var(--th-bg)' }}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col relative overflow-hidden">
        <MobileArcs />
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-[400px] w-full mx-auto">
            <div className="mb-10">
              <Logo />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--th-text)' }}>
              Level up your life.
            </h1>
            <p className="text-[15px] mb-10 leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
              Sign in with GitHub to sync your coding stats, track your fitness, and manage your finances.
            </p>

            <motion.button
              onClick={handleGithubLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl font-semibold text-[15px] shadow-lg shadow-[var(--th-primary)]/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              style={{ background: 'var(--th-primary)', color: 'white' }}
            >
              <Github className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Continue with GitHub</span>
            </motion.button>

          </motion.div>
        </div>
      </div>

      {/* Desktop Right Side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[var(--th-bg-secondary)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--th-primary-rgb),0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 w-full flex flex-col items-center justify-center p-20 text-center">
          <div className="mb-10 p-6 rounded-3xl bg-[var(--th-bg)]/50 backdrop-blur-sm border border-[var(--th-border)] shadow-2xl">
            <Logo size="large" />
          </div>
          <h2 className="text-4xl font-bold mb-6 tracking-tight" style={{ color: 'var(--th-text)' }}>
            The Operating System for You
          </h2>
          <p className="text-lg max-w-md mx-auto leading-relaxed" style={{ color: 'var(--th-text-secondary)' }}>
            Track your fitness, manage your finances, and level up your career all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
