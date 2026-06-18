import clsx from 'clsx';

export function GlassPanel({ children, className, blur = 'md', intensity = 'medium', ...rest }) {
  const blurMap = { sm: 'backdrop-blur-sm', md: 'backdrop-blur-md', lg: 'backdrop-blur-xl' };
  const intensityMap = {
    low: 'bg-white/[0.02] border-white/[0.04]',
    medium: 'bg-white/[0.04] border-white/[0.07]',
    high: 'bg-white/[0.08] border-white/[0.1]',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border', blurMap[blur], intensityMap[intensity],
        '-webkit-backdrop-filter: blur(16px)',
        className
      )}
      style={{ WebkitBackdropFilter: blur === 'lg' ? 'blur(24px)' : blur === 'sm' ? 'blur(8px)' : 'blur(16px)' }}
      {...rest}
    >
      {children}
    </div>
  );
}
