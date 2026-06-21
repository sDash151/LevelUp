import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const STATUS_COLORS = {
  trained: '#10B981',
  rest: '#93C5FD',
  missed: '#EF4444',
  planned: '#F59E0B',
};

const STATUS_DOT = {
  trained: 'bg-emerald-500',
  rest: 'bg-blue-300',
  missed: 'bg-red-500',
  planned: 'bg-amber-500',
};

export default function WorkoutCalendar({ sessions = [], plan = {} }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const calendarMap = {};

  // Provide a continuous base layer for the calendar
  for (let d = 1; d <= daysInMonth; d++) {
    calendarMap[d] = 'rest';
  }

  const weekPlan = plan.weekPlan || [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const scheduledDaysOfWeek = weekPlan
    .filter(d => !d.isRest && d.day)
    .map(d => dayNames.findIndex(n => n.toLowerCase() === d.day.toLowerCase()))
    .filter(i => i !== -1);

  if (scheduledDaysOfWeek.length > 0) {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      
      const currentMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isPast = date < currentMidnight;
      const isToday = date.getTime() === currentMidnight.getTime();
      
      if (scheduledDaysOfWeek.includes(dayOfWeek)) {
        calendarMap[d] = isPast && !isToday ? 'missed' : 'planned';
      } else {
        calendarMap[d] = 'rest';
      }
    }
  }

  if (sessions && sessions.length) {
    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        calendarMap[d.getDate()] = 'trained';
      }
    });
  }

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="rounded-2xl p-6 flex flex-col bg-white shadow-sm border border-zinc-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900">Workout Calendar</h3>
        <button className="text-zinc-400 hover:text-zinc-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        </button>
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-bold text-zinc-800">{monthName} {year}</span>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={next} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-zinc-400">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 flex-1 content-start">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = calendarMap[day];
          const isToday = isCurrentMonth && day === today;
          return (
            <div
              key={day}
              className="relative flex flex-col items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-bold transition-colors cursor-pointer hover:bg-zinc-100"
              style={{
                color: isToday ? '#fff' : '#3f3f46',
                background: isToday ? '#F59E0B' : 'transparent',
              }}
            >
              {day}
              {status && !isToday && (
                <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-zinc-100">
        {Object.entries(STATUS_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] font-bold text-zinc-500">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
