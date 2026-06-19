import { AnimatedPage } from './AnimatedPage';

export function PageSkeleton() {
  return (
    <AnimatedPage>
      <div className="space-y-6 w-full">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-xl skeleton-shimmer" />
            <div className="h-4 w-32 rounded-lg skeleton-shimmer" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 rounded-xl skeleton-shimmer" />
            <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Content Blocks Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-40 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
            <div className="h-64 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
          </div>
          <div className="space-y-5">
            <div className="h-28 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
            <div className="h-28 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
            <div className="h-48 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
