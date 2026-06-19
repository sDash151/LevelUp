export function DsaSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {/* ── KPI Cards Skeleton ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
        ))}
      </div>

      {/* ── Quick Resume Skeleton ── */}
      <div className="h-20 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />

      {/* ── Today's Focus Skeleton ── */}
      <div className="h-64 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />

      {/* ── Row: Your Paths + Company Mode Skeleton ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 h-48 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
        <div className="lg:col-span-4 h-48 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
      </div>

      {/* ── Row: 3 Columns Skeleton ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-64 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
        <div className="h-64 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
        <div className="h-64 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
      </div>
      
      {/* ── Table Skeleton ── */}
      <div className="h-80 rounded-2xl border skeleton-shimmer" style={{ borderColor: 'var(--th-border)' }} />
    </div>
  );
}
