import { useMemo } from 'react';
import { motion } from 'motion/react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function getIntensity(count) {
  if (!count || count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const INTENSITY_COLORS = {
  0: 'var(--th-border)',
  1: 'rgba(var(--th-primary-rgb), 0.2)',
  2: 'rgba(var(--th-primary-rgb), 0.4)',
  3: 'rgba(var(--th-primary-rgb), 0.65)',
  4: 'var(--th-primary)',
};

export function DsaHeatmap({ data = [] }) {
  const grid = useMemo(() => {
    // Build 52 weeks x 7 days grid
    const dataMap = {};
    data.forEach(d => {
      const key = new Date(d.date).toISOString().split('T')[0];
      dataMap[key] = d.count;
    });

    const today = new Date();
    const weeks = [];
    let currentDate = new Date(today);
    // Go back to fill 52 weeks
    currentDate.setDate(currentDate.getDate() - (52 * 7) + (7 - currentDate.getDay()));

    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        week.push({
          date: dateStr,
          count: dataMap[dateStr] || 0,
          intensity: getIntensity(dataMap[dateStr] || 0),
          isFuture: currentDate > today,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const monthIdx = new Date(week[0].date).getMonth();
      if (monthIdx !== lastMonth) {
        monthLabels.push({ index: i, label: MONTHS[monthIdx] });
        lastMonth = monthIdx;
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Consistency Heatmap</h3>

      <div className="overflow-x-auto hide-scrollbar">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8 mb-2">
            {grid.monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[11px]"
                style={{
                  color: 'var(--th-text-dim)',
                  position: 'relative',
                  left: `${m.index * 16}px`,
                  width: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-2 mt-0">
              {DAYS.map((d, i) => (
                <span key={i} className="text-[10px] h-[14px] leading-[14px]" style={{ color: 'var(--th-text-dim)' }}>{d}</span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[2px]">
              {grid.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="w-[14px] h-[14px] rounded-[2px] transition-colors"
                      style={{
                        background: day.isFuture ? 'transparent' : INTENSITY_COLORS[day.intensity],
                        opacity: day.isFuture ? 0.2 : 1,
                      }}
                      title={`${day.date}: ${day.count} problems`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Less</span>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-[14px] h-[14px] rounded-[2px]" style={{ background: INTENSITY_COLORS[i] }} />
            ))}
            <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
