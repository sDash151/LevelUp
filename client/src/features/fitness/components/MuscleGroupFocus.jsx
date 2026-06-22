const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EAB308', '#8B5CF6', '#06B6D4', '#EF4444'];

const CustomDonut = ({ data }) => {
  let currentAngle = 0;
  const radius = 40;
  const cx = 50;
  const cy = 50;
  const strokeWidth = 14;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
      {data.map((slice, i) => {
        if (slice.value === 0) return null;
        const percentage = slice.value / 100;
        const dashArray = 2 * Math.PI * radius;
        const dashOffset = dashArray - (dashArray * percentage);
        const angle = currentAngle;
        currentAngle += percentage * 360;
        
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform={`rotate(${angle} ${cx} ${cy})`}
            className="transition-all duration-1000 ease-out"
          />
        );
      })}
    </svg>
  );
};

export default function MuscleGroupFocus({ sessions = [] }) {
  const muscleVolume = {};
  sessions.forEach(s => {
    (s.exercises || []).forEach(ex => {
      const mg = ex.muscleGroup || 'other';
      muscleVolume[mg] = (muscleVolume[mg] || 0) + (ex.totalVolume || 1);
    });
  });
  const totalVol = Object.values(muscleVolume).reduce((s, v) => s + v, 0);
  const chartData = Object.entries(muscleVolume)
    .map(([name, vol]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round((vol / Math.max(totalVol, 1)) * 100) }))
    .sort((a, b) => b.value - a.value);

  const topGroup = chartData.length > 0 ? chartData[0] : null;

  return (
    <div className="rounded-2xl p-6 bg-[var(--th-card)] shadow-sm border border-[var(--th-border)] mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--th-text)]">Muscle Group Focus</h3>
        <button className="text-[var(--th-text-dim)] hover:text-[var(--th-text-secondary)]">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        </button>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[var(--th-text-dim)]">
          <p className="text-xs font-medium">No workout data yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-6 mt-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <CustomDonut data={chartData} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-[var(--th-text)]">{topGroup ? topGroup.value : 0}%</span>
              <span className="text-[9px] font-bold text-[var(--th-text-dim)] mt-0.5 truncate px-2 text-center">{topGroup ? topGroup.name : 'Focus'}</span>
            </div>
          </div>
          
          <div className="space-y-2 flex-1">
            {chartData.slice(0, 6).map((g, i) => (
              <div key={g.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-[var(--th-text-secondary)]">{g.name}</span>
                </div>
                <span className="font-bold text-[var(--th-text)]">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
