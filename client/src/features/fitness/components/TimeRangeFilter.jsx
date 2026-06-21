const RANGES = ['7D', '1M', '3M', '6M', '1Y', 'All'];

export default function TimeRangeFilter({ range, onRangeChange }) {
  return (
    <div className="flex items-center gap-2">
      {RANGES.map(r => (
        <button key={r} onClick={() => onRangeChange(r)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition"
          style={{
            background: range === r ? 'var(--th-primary)' : 'var(--th-card)',
            color: range === r ? '#fff' : 'var(--th-text-secondary)',
            border: `1px solid ${range === r ? 'var(--th-primary)' : 'var(--th-border)'}`,
          }}>
          {r}
        </button>
      ))}
    </div>
  );
}
