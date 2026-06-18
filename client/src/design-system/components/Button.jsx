import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-glow-accent hover:shadow-lg hover:brightness-110',
  secondary: 'glass text-white/90 hover:bg-surface-hover',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.06]',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  className,
  ...rest
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      className={clsx(
        'relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      ) : null}
      {children}
    </motion.button>
  );
}
