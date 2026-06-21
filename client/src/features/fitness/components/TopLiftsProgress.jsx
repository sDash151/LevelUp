export default function TopLiftsProgress({ lifts = [] }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Top Lifts Progress</h3>
      </div>
      {lifts.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--th-text-secondary)' }}>No lift data yet</p>
      ) : (
        <div className="space-y-3">
          {lifts.slice(0, 5).map((lift, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>{lift.exercise}</p>
                <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{lift.lastWeight}kg → {lift.bestWeight}kg</p>
              </div>
              <span className={`text-[10px] font-bold ${lift.improvement?.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                +{lift.improvement?.value || 0} {lift.improvement?.type === 'weight' ? 'kg' : 'reps'}
              </span>
            </div>
          ))}
        </div>
      )}
      <button className="w-full mt-3 py-2 text-[11px] font-medium rounded-lg transition" style={{ background: 'var(--th-bg-secondary)', color: 'var(--th-text-secondary)' }}>
        View Full Progress
      </button>
    </div>
  );
}
