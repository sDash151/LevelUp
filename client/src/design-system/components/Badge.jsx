import clsx from 'clsx';

const colorMap = {
  default: 'bg-zinc-800 text-zinc-300',
  accent: 'bg-accent-dim text-accent',
  success: 'bg-success-dim text-success',
  warning: 'bg-warning-dim text-warning',
  danger: 'bg-danger-dim text-danger',
  info: 'bg-info-dim text-info',
};

export function Badge({ variant = 'default', children, pulse = false, size = 'sm', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        colorMap[variant],
        pulse && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </span>
  );
}
