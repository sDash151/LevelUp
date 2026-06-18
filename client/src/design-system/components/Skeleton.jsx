import clsx from 'clsx';

export function Skeleton({ variant = 'text', width, height, className, count = 1 }) {
  const base = 'animate-shimmer bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] rounded-lg';

  if (variant === 'circle') {
    return <div className={clsx(base, 'rounded-full', className)} style={{ width: width || 40, height: height || 40 }} />;
  }

  if (variant === 'card') {
    return <div className={clsx(base, 'rounded-2xl', className)} style={{ width: width || '100%', height: height || 160 }} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(base, className)}
          style={{
            width: width || (i === count - 1 && count > 1 ? '70%' : '100%'),
            height: height || 14,
          }}
        />
      ))}
    </div>
  );
}
