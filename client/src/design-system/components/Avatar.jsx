import { useState } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const STATUS_COLORS = {
  online: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  idle: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  dnd: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
  offline: 'bg-zinc-500',
};

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  className,
  bordered = false,
  glow = false,
  onClick
}) {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = SIZES[size] || SIZES.md;
  
  // Get initials securely
  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const showImage = src && !imageError;

  return (
    <div className={clsx('relative inline-block group', className)}>
      {/* Outer glow ring */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--th-primary)] to-purple-500 blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
      )}
      
      {/* Main Avatar Bubble */}
      {onClick ? (
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            'relative flex items-center justify-center rounded-full overflow-hidden shadow-lg transition-transform',
            sizeClasses,
            bordered && 'ring-2 ring-[var(--th-bg)] ring-offset-2 ring-offset-[var(--th-primary)]/20',
            !showImage && 'bg-gradient-to-br from-[var(--th-primary)] to-purple-600 text-white font-bold',
            'cursor-pointer'
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={name || 'Avatar'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="relative z-10 drop-shadow-md">
              {getInitials(name)}
            </span>
          )}
          
          {/* Subtle inner shadow overlay */}
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
        </motion.button>
      ) : (
        <motion.div
          className={clsx(
            'relative flex items-center justify-center rounded-full overflow-hidden shadow-lg transition-transform',
            sizeClasses,
            bordered && 'ring-2 ring-[var(--th-bg)] ring-offset-2 ring-offset-[var(--th-primary)]/20',
            !showImage && 'bg-gradient-to-br from-[var(--th-primary)] to-purple-600 text-white font-bold',
            'cursor-default'
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={name || 'Avatar'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="relative z-10 drop-shadow-md">
              {getInitials(name)}
            </span>
          )}
          
          {/* Subtle inner shadow overlay */}
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
        </motion.div>
      )}

      {/* Status Dot */}
      {status && (
        <div 
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--th-bg)] z-10',
            STATUS_COLORS[status],
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'xl' ? 'w-6 h-6' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
          )}
        />
      )}
    </div>
  );
}
