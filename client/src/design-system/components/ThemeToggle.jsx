import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/shared/stores/themeStore';

export function ThemeToggle({ size = 'default' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const isSmall = size === 'small';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        width: isSmall ? 36 : 42,
        height: isSmall ? 36 : 42,
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {isDark ? (
          <Sun className="w-4 h-4" style={{ color: 'var(--th-primary)' }} />
        ) : (
          <Moon className="w-4 h-4" style={{ color: '#6B6560' }} />
        )}
      </motion.div>
    </button>
  );
}
