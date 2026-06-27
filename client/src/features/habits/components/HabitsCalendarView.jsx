import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Zap, Star, Calendar, TrendingUp,
  CheckCircle2, XCircle, Clock, Activity, Smile,
  MoreHorizontal, ArrowRight, Heart, Trophy, Info,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useHabitCalendarStats, useToggleHabit } from '../hooks/useHabits';
import { useQueryClient } from '@tanstack/react-query';

/* ─── Helpers ─── */
const CAT_EMOJI = {
  fitness: '\u{1F3CB}\uFE0F', health: '\uD83D\uDC8A', mindfulness: '\uD83E\uDDD8',
  learning: '\uD83D\uDCDA', career: '\uD83D\uDCBC', finance: '\uD83D\uDCB0',
  social: '\uD83E\uDD1D', creativity: '\uD83C\uDFA8', nutrition: '\uD83E\uDD57',
  sleep: '\uD83D\uDE34', general: '\u2705',
};
function catEmoji(cat) {
  return CAT_EMOJI[cat?.toLowerCase()] ?? '\u2705';
}

function moodLabel(score) {
  if (!score) return null;
  if (score >= 4) return { label: 'Great \uD83D\uDE0A', color: '#10b981' };
  if (score >= 3) return { label: 'Good \uD83D\uDE42', color: '#E8B94A' };
  if (score >= 2) return { label: 'Okay \uD83D\uDE10', color: '#94a3b8' };
  return { label: 'Tough \uD83D\uDE14', color: '#f97316' };
}

function fmtFocus(mins) {
  if (!mins) return '0 min';
  if (mins < 60) return mins + ' min';
  return Math.floor(mins / 60) + 'h ' + (mins % 60 > 0 ? (mins % 60) + 'm' : '');
}

/* ─── Sub-components ─── */
function RingChart({ pct = 0, size = 100, stroke = 8, color = '#E8B94A' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(148,163,184,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      {/* Small gold dot at the top (12 o'clock) when there is a percentage */}
      <circle cx={size / 2} cy={stroke / 2} r={3} fill={color} />
    </svg>
  );
}

function Skeleton({ className = '' }) {
  return <div className={'rounded animate-pulse ' + className} style={{ background: 'var(--th-highlight)' }} />;
}

function MomentumIcon({ type, animated = false }) {
  if (type === 'streak' || type === 'milestone') {
    if (animated) {
      return <DotLottieReact src="/MomentumFlame.lottie" autoplay loop style={{ width: 28, height: 28 }} />;
    }
    return <span style={{ fontSize: 20 }}>{'\uD83D\uDD25'}</span>;
  }
  if (type === 'high-perf') return <Zap className="w-4 h-4" style={{ color: '#E8B94A' }} />;
  if (type === 'partial') return <span style={{ fontSize: 14 }}>{'\uD83D\uDD38'}</span>;
  return <div className="w-4 h-4 rounded-full" style={{ background: 'rgba(148,163,184,0.3)' }} />;
}

function HabitRow({ habit, onToggle, compact = false }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-xl transition-all hover:bg-[var(--th-highlight)]">
      <button onClick={onToggle} className="shrink-0 transition-transform active:scale-90">
        {habit.completed
          ? <CheckCircle2 className={compact ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: '#10b981' }} />
          : <XCircle className={compact ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: '#ef4444' }} />}
      </button>
      <span style={{ fontSize: compact ? 14 : 16 }}>{catEmoji(habit.category)}</span>
      <div className="flex-1 min-w-0">
        <p className={'font-medium truncate ' + (compact ? 'text-[11px]' : 'text-[13px]')}
          style={{ color: 'var(--th-text)' }}>{habit.name}</p>
        {!compact && (
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>
            {habit.frequency === 'DAILY' ? 'Daily' : habit.frequency === 'WEEKLY' ? 'Weekly' : 'Monthly'}
          </p>
        )}
      </div>
      {!compact && (
        <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--th-text-dim)' }} />
      )}
    </div>
  );
}

/* ─── Calendar Grid (small dots matching design) ─── */
function CalendarGrid({ calendarDays, mondayOffset, selectedDate, onDayClick, compact = false, view = 'month' }) {
  const cells = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (const d of calendarDays) cells.push(d);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const displayRows = view === 'week' 
    ? (rows.filter(row => row.some(cell => cell?.date === selectedDate)).length > 0
        ? rows.filter(row => row.some(cell => cell?.date === selectedDate))
        : [rows[0]])
    : rows;

  return (
    <div className={compact ? 'space-y-0' : 'space-y-1'}>
      {displayRows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, ci) => {
            const cell = row[ci];
            if (!cell) return <div key={ci} />;

            const dayNum = parseInt(cell.date.split('-')[2], 10);
            const isSel = cell.date === selectedDate;
            const isFuture = cell.status === 'future';
            const isNoData = cell.status === 'no-data';
            const isCompleted = cell.status === 'completed';
            const isPartial = cell.status === 'partial';
            const isMissed = cell.status === 'missed';

            // Dot styles matching design exactly
            let dotBg = 'rgba(148,163,184,0.35)'; // missed
            let dotBorder = 'none';
            let dotW = 7;
            if (isCompleted) { dotBg = '#E8B94A'; dotW = 7; }
            else if (isPartial) { dotBg = 'transparent'; dotBorder = '1.5px solid #E8B94A'; dotW = 7; }
            else if (isNoData) { dotBg = '#ef4444'; dotW = 6; }

            // Today gets a filled green circle. Selected day gets a subtle gold ring.
            const todayBg = cell.isToday
              ? { background: '#10b981', borderRadius: '50%', width: compact ? 26 : 32, height: compact ? 26 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }
              : isSel
                ? { background: 'rgba(232,185,74,0.15)', border: '1px solid rgba(232,185,74,0.4)', borderRadius: '50%', width: compact ? 26 : 32, height: compact ? 26 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                : { width: compact ? 26 : 32, height: compact ? 26 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center' };

            return (
              <div key={cell.date}
                className={'flex flex-col items-center gap-1 rounded-lg transition-all '
                  + (compact ? 'py-1' : 'py-2 ') + ' '
                  + (!isFuture ? 'cursor-pointer hover:bg-[var(--th-highlight)]' : 'cursor-default')}
                onClick={() => !isFuture && onDayClick(cell.date, cell.status)}>

                {/* Date number — today gets a green circle bg, selected gets a gold ring */}
                <div style={todayBg}>
                  <span style={{
                    fontSize: compact ? 12 : 14,
                    fontWeight: cell.isToday ? 700 : isSel ? 700 : 400,
                    color: cell.isToday ? '#fff' : isSel ? '#E8B94A' : 'var(--th-text-secondary)',
                  }}>
                    {dayNum}
                  </span>
                </div>

                {/* Small dot indicator */}
                {!isFuture && (
                  <div style={{
                    width: dotW, height: dotW, borderRadius: '50%',
                    background: dotBg, border: dotBorder,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CalLegend() {
  return (
    <div className="flex items-center flex-wrap gap-5 mt-4 pt-4" style={{ borderTop: '1px solid var(--th-border)' }}>
      {[
        { bg: '#E8B94A', label: 'Completed' },
        { bg: 'transparent', border: '1.5px solid #E8B94A', label: 'Partial' },
        { bg: 'rgba(148,163,184,0.35)', label: 'Missed' },
        { bg: '#ef4444', label: 'No Data', small: true },
      ].map(({ bg, border, label, small }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div style={{ width: small ? 6 : 7, height: small ? 6 : 7, borderRadius: '50%', background: bg, border: border || 'none' }} />
          <span className="text-[11px]" style={{ color: 'var(--th-text-dim)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Day Overview Card (separate from Day Panel, as per design) ─── */
function DayOverviewCard({ selData, mood }) {
  return (
    <div className="rounded-2xl p-5 h-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <h3 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--th-text)' }}>Day Overview</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Clock className="w-4 h-4" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Focus Time</p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{fmtFocus(selData?.focusMinutes)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Habits Completed</p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{selData?.completedCount ?? 0} / {selData?.totalCount ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,185,74,0.12)' }}>
            <Activity className="w-4 h-4" style={{ color: '#E8B94A' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Productivity Score</p>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{selData?.productivity ?? 0}%</p>
              {(selData?.productivityChange ?? 0) !== 0 && (
                <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#10b981' }}>
                  <TrendingUp className="w-2.5 h-2.5" /> {selData?.productivityChange > 0 ? '+' : ''}{selData?.productivityChange}%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,185,74,0.12)' }}>
            <Smile className="w-4 h-4" style={{ color: '#E8B94A' }} />
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Mood</p>
            <p className="text-[15px] font-bold" style={{ color: mood?.color ?? 'var(--th-text)' }}>{mood?.label ?? '\u2014'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Momentum Section ─── */
function MomentumSection({ momentum, isLoading, streakMessage, mobile = false }) {
  return (
    <div className="rounded-2xl p-6 h-full flex flex-col justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-[16px] font-semibold" style={{ color: 'var(--th-text)' }}>Your Momentum</h3>
        <Info className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
      </div>
      {isLoading ? <Skeleton className="h-20 w-full" /> : (
        <>
          {/* Timeline with flame icons and connecting line */}
          <div className="relative mb-4">
            {/* Connecting horizontal line */}
            <div className="absolute left-0 right-0" style={{ top: 24, height: 2, background: '#E8B94A', opacity: 0.4 }} />
            <div className={'flex items-start ' + (mobile ? 'overflow-x-auto gap-3 pb-2' : 'justify-between')}>
              {momentum.map((m) => (
                <div key={m.date} className={'flex flex-col items-center gap-2 relative z-10 ' + (mobile ? 'min-w-[56px]' : '')}>
                  <div className={'w-12 h-12 rounded-full flex items-center justify-center '
                    + (m.isToday ? 'ring-2 ring-[#E8B94A] ring-offset-4' : '')}
                    style={{
                      background: m.type === 'missed' ? 'var(--th-highlight)' : 'rgba(232,185,74,0.1)',
                      ringOffsetColor: 'var(--th-card)',
                      ['--tw-ring-offset-color']: 'var(--th-card)',
                    }}>
                    <MomentumIcon type={m.type} animated={m.isToday} />
                  </div>
                  {/* Dot on the line */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8B94A' }} />
                  <span className="text-[11px] text-center whitespace-nowrap" style={{ color: m.isToday ? '#E8B94A' : 'var(--th-text-dim)' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak encouragement message */}
          {streakMessage && (
            <p className="text-[12px] mt-6 pt-4" style={{ color: 'var(--th-text-muted)', borderTop: '1px solid var(--th-border)' }}>
              {streakMessage}
            </p>
          )}

          {/* Legend */}
          <div className="flex items-center flex-wrap gap-5 mt-6 pt-4" style={{ borderTop: streakMessage ? 'none' : '1px solid var(--th-border)' }}>
            {[
              { icon: '\uD83D\uDD25', label: 'Streak' },
              { icon: '\u2B50', label: 'Milestone' },
              { icon: 'zap', label: 'High Perf.' },
              { icon: 'circle', label: 'Missed' },
              { icon: '\uD83D\uDD38', label: 'Partial' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1">
                {icon === 'zap'
                  ? <Zap className="w-3 h-3" style={{ color: '#E8B94A' }} />
                  : icon === 'circle'
                    ? <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(148,163,184,0.3)' }} />
                    : <span className="text-[11px]">{icon}</span>}
                <span className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Consistency Trend ─── */
function ConsistencyTrend({ data, isLoading }) {
  const maxPct = data.length ? Math.max(...data.map((d) => d.pct)) : 0;
  return (
    <div className="rounded-2xl p-5 min-w-0 w-full" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>Consistency Trend</h3>
        <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'var(--th-highlight)', color: 'var(--th-text-muted)' }}>This Month</span>
      </div>
      {isLoading ? <Skeleton className="h-36 w-full" /> : (
        <>
          <div style={{ height: 140, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--th-text-dim)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--th-text-dim)' }} tickFormatter={(v) => v + '%'} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', borderRadius: 8, fontSize: 11 }} formatter={(v) => [v + '%', 'Consistency']} />
                <Line type="monotone" dataKey="pct" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E8B94A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-[11px] font-bold" style={{ color: '#f97316' }}>{maxPct}%</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Habit Performance Card ─── */
function HabitPerformanceCard({ title, habit, color, icon, cta }) {
  if (!habit) return (
    <div className="rounded-2xl p-5 flex items-center justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 180 }}>
      <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>No data yet</p>
    </div>
  );
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[12px] font-semibold" style={{ color: 'var(--th-text-muted)' }}>{title}</h3>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: 'var(--th-highlight)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: color + '20' }}>
          {catEmoji(habit.category)}
        </div>
        <p className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{habit.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Completed</p>
          <p className="text-[15px] font-bold" style={{ color: 'var(--th-text)' }}>{habit.completedCount} times</p>
        </div>
        <div>
          <p className="text-[10px]" style={{ color: 'var(--th-text-dim)' }}>Success Rate</p>
          <p className="text-[15px] font-bold" style={{ color }}>{habit.successRate}%</p>
        </div>
      </div>
      <p className="text-[11px] mt-3" style={{ color }}>{cta}</p>
    </div>
  );
}

/* ─── Pro Tip ─── */
const PRO_TIPS = [
  "You've been most consistent in the mornings. Try scheduling important habits early!",
  "Your streak is building momentum. Keep it going for 7 more days for a record!",
  "Perfect days boost your XP by 2x. Try to complete all habits today!",
  "Habits done at the same time each day stick better. Build a morning routine!",
];

function ProTip({ onNavigate }) {
  const tip = PRO_TIPS[new Date().getDate() % PRO_TIPS.length];
  return (
    <div className="mt-4 flex items-center justify-between p-4 rounded-2xl"
      style={{ background: 'rgba(232,185,74,0.08)', border: '1px solid rgba(232,185,74,0.2)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <Star className="w-4 h-4 shrink-0" style={{ color: '#E8B94A' }} />
        <span className="min-w-0">
          <span className="text-[12px] font-semibold" style={{ color: '#E8B94A' }}>Pro Tip: </span>
          <span className="text-[12px]" style={{ color: 'var(--th-text-secondary)' }}>{tip}</span>
        </span>
      </div>
      <button onClick={() => onNavigate?.('/analytics')}
        className="shrink-0 flex items-center gap-1 ml-4 text-[12px] font-medium" style={{ color: '#E8B94A' }}>
        View Insights <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function HabitsCalendarView({ onNavigate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);
  const [calView, setCalView] = useState('month');
  const queryClient = useQueryClient();
  const toggleHabit = useToggleHabit();
  const { data, isLoading } = useHabitCalendarStats(year, month, selectedDate);

  const prevMonth = useCallback(() => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    const nm = now.getMonth() + 1, ny = now.getFullYear();
    if (year > ny || (year === ny && month >= nm)) return;
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }, [month, year]);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const mondayOffset = ((new Date(year, month - 1, 1).getDay()) + 6) % 7;
  const calendarDays = data?.calendarDays ?? [];
  const selData = data?.selectedDay;
  const mood = moodLabel(selData?.moodScore);
  const formattedSelDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const handleDayClick = (dateStr, status) => { if (status !== 'future') setSelectedDate(dateStr); };
  const handleToggle = (habitId) => {
    toggleHabit.mutate({ id: habitId, date: selectedDate }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', 'calendar-stats'] }),
    });
  };

  const streakText = (() => {
    const best = data?.streak?.best ?? 0;
    const cur = data?.streak?.current ?? 0;
    if (best > cur) return `${best - cur} days away from your best streak of ${best} days`;
    if (cur > 0) return "You're at your best streak! \uD83C\uDFC6";
    return 'Start your streak today!';
  })();

  const streakMessage = (() => {
    const cur = data?.streak?.current ?? 0;
    if (cur >= 7) return `You're on a roll! Keep going to beat your best streak! \uD83C\uDF89`;
    if (cur >= 3) return `Great momentum! ${7 - cur} more days to hit a week streak!`;
    return null;
  })();

  /* Shared blocks */
  const dayHabitsBlock = (compact = false) => (
    isLoading ? (
      <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
    ) : selData?.habits?.length ? (
      <div className="space-y-1">
        {selData.habits.map((h) => (
          <HabitRow key={h.id} habit={h} onToggle={() => handleToggle(h.id)} compact={compact} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center py-8 gap-2">
        <Calendar className="w-8 h-8" style={{ color: 'var(--th-text-dim)' }} />
        <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>No habits for this day</p>
      </div>
    )
  );

  const calGridBlock = (compact = false) => (
    <>
      <div className="grid grid-cols-7 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center font-semibold py-1"
            style={{ fontSize: compact ? 10 : 12, color: 'var(--th-text-dim)' }}>{d}</div>
        ))}
      </div>
      <CalendarGrid calendarDays={calendarDays} mondayOffset={mondayOffset}
        selectedDate={selectedDate} onDayClick={handleDayClick} compact={compact} view={calView} />
      <CalLegend />
    </>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div key="cal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

        {/* ══════════════════════════════════════════════════════════════
            DESKTOP LAYOUT
            ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">

          {/* Sub-header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[13px]" style={{ color: 'var(--th-text-muted)' }}>
              Track your habits and see your progress over time.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg transition-all hover:bg-[var(--th-highlight)]">
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
              </button>
              <span className="text-[14px] font-semibold px-1" style={{ color: 'var(--th-text)' }}>
                {monthName} {year}
              </span>
              <button onClick={nextMonth} disabled={isCurrentMonth}
                className="p-1.5 rounded-lg transition-all hover:bg-[var(--th-highlight)] disabled:opacity-40">
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
              </button>
            </div>
          </div>

          {/* ─── ROW 1: 4 Stat Cards ─── */}
          <div className="grid gap-4 mb-5 grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_0.8fr]">

            {/* Current Streak — wider card with large flame on right */}
            <div className="relative rounded-2xl p-5 overflow-hidden"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 170 }}>
              {/* Left: text content */}
              <div className="relative z-10" style={{ maxWidth: '55%' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Current Streak</p>
                  <span style={{ fontSize: 14 }}>{'\uD83D\uDD25'}</span>
                </div>
                {isLoading ? <Skeleton className="h-10 w-24 mt-2" /> : (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-[42px] font-black leading-none" style={{ color: 'var(--th-text)' }}>
                        {data?.streak?.current ?? 0}
                      </span>
                      <span className="text-[15px] font-medium mb-1.5" style={{ color: 'var(--th-text-muted)' }}>days</span>
                    </div>
                    <p className="text-[10px] mt-2 leading-snug" style={{ color: 'var(--th-text-dim)' }}>{streakText}</p>
                    <div className="mt-3">
                      <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(148,163,184,0.15)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${data?.streak?.pctToRecord ?? 0}%`, background: '#E8B94A' }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--th-text-dim)' }}>
                        {data?.streak?.pctToRecord ?? 0}%
                      </p>
                    </div>
                  </>
                )}
              </div>
              {/* Right: BigStreakFlame — large, center-right, matching design */}
              <img
                src="/BigStreakFlame.webp" alt=""
                className="absolute pointer-events-none select-none"
                style={{
                  right: -80,
                  top: '60%',
                  transform: 'translateY(-50%)',
                  width: 300,
                  height: 300,
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Completion Rate */}
            <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--th-text-muted)' }}>Completion Rate</p>
              {isLoading ? <Skeleton className="h-24 w-24 mx-auto rounded-full" /> : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative">
                    <RingChart pct={data?.completionRate ?? 0} size={96} stroke={9} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[22px] font-black" style={{ color: 'var(--th-text)' }}>
                        {data?.completionRate ?? 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] mt-3 flex items-center gap-1"
                    style={{ color: (data?.completionRateChangePct ?? 0) >= 0 ? '#10b981' : '#f97316' }}>
                    <TrendingUp className="w-3 h-3" />
                    {(data?.completionRateChangePct ?? 0) >= 0 ? '+' : ''}{data?.completionRateChangePct ?? 0}% vs last month
                  </p>
                </div>
              )}
            </div>

            {/* Total XP */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4" style={{ color: '#E8B94A' }} />
                <p className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Total XP</p>
              </div>
              {isLoading ? <Skeleton className="h-10 w-28 mt-2" /> : (
                <>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-[36px] font-black leading-none" style={{ color: 'var(--th-text)' }}>
                      {(data?.totalXP ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[14px] font-medium" style={{ color: 'var(--th-text-muted)' }}>XP</span>
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: '#10b981' }}>
                    +{data?.xpThisMonth ?? 0} this month
                  </p>
                </>
              )}
            </div>

            {/* Perfect Days */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-4 h-4" style={{ color: '#E8B94A' }} />
                <p className="text-[12px] font-medium" style={{ color: 'var(--th-text-muted)' }}>Perfect Days</p>
              </div>
              {isLoading ? <Skeleton className="h-10 w-20 mt-2" /> : (
                <>
                  <div className="flex items-baseline gap-1.5 mt-3">
                    <span className="text-[36px] font-black leading-none" style={{ color: 'var(--th-text)' }}>
                      {data?.perfectDays ?? 0}
                    </span>
                    <span className="text-[14px] font-medium" style={{ color: 'var(--th-text-muted)' }}>days</span>
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: '#E8B94A' }}>
                    Amazing work! {'\u2B50'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ─── ROW 2: Calendar + Day Panel ─── */}
          <div className="grid gap-4 mb-5 grid-cols-1 xl:grid-cols-[1fr_320px]">
            {/* Calendar */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>
                  {monthName} {year}
                </span>
                <div className="flex gap-0.5 p-1 rounded-lg" style={{ background: 'var(--th-highlight)' }}>
                  {['month', 'week'].map((v) => (
                    <button key={v} onClick={() => setCalView(v)}
                      className="px-3 py-0.5 rounded-md text-[12px] font-medium transition-all"
                      style={{
                        background: calView === v ? '#E8B94A' : 'transparent',
                        color: calView === v ? '#000' : 'var(--th-text-muted)',
                      }}>
                      {v === 'month' ? 'Month' : 'Week'}
                    </button>
                  ))}
                </div>
              </div>
              {calGridBlock(false)}
            </div>

            {/* Day Panel Wrapper */}
            <div className="w-full xl:h-full xl:relative">
              <div className="xl:absolute xl:inset-0 rounded-2xl p-5 flex flex-col max-h-[500px] xl:max-h-none" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--th-text)' }}>
                  {formattedSelDate}
                </h3>
                <button className="p-1 rounded-md" style={{ background: 'var(--th-highlight)' }}>
                  <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
                </button>
              </div>
              {selData && (
                <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold self-start shrink-0"
                  style={{ background: 'rgba(232,185,74,0.15)', color: '#E8B94A' }}>
                  {selData.completedCount}/{selData.totalCount} Completed
                </span>
              )}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">{dayHabitsBlock(false)}</div>
              <button onClick={() => onNavigate?.('/reflections')}
                className="mt-3 shrink-0 w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-[var(--th-highlight)]"
                style={{ border: '1px solid var(--th-border)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>{'\uD83D\uDCDD'}</span>
                  <span className="text-[12px]" style={{ color: 'var(--th-text-muted)' }}>Add Note for this day</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--th-text-dim)' }} />
              </button>
            </div>
          </div>
          </div>

          {/* ─── ROW 3: Momentum + Consistency Trend (side by side, same ratio) ─── */}
          <div className="grid gap-4 mb-5 grid-cols-1 xl:grid-cols-[1fr_320px]">
            <MomentumSection momentum={data?.momentum ?? []} isLoading={isLoading} streakMessage={streakMessage} />
            <ConsistencyTrend data={data?.consistencyTrend ?? []} isLoading={isLoading} />
          </div>

          {/* ─── ROW 4: Day Overview + Performance Cards ─── */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <DayOverviewCard selData={selData} mood={mood} />
            <HabitPerformanceCard title="Best Performing Habit" habit={data?.bestHabit}
              color="#10b981" icon={<Trophy className="w-4 h-4" style={{ color: '#10b981' }} />}
              cta={`Keep it up! ${'\uD83D\uDD25'}`} />
            <HabitPerformanceCard title="Needs More Love" habit={data?.worstHabit}
              color="#f97316" icon={<Heart className="w-4 h-4" style={{ color: '#f97316' }} />}
              cta={`Let's build this habit! ${'\uD83D\uDCAA'}`} />
          </div>

          {/* ─── ROW 5: Pro Tip ─── */}
          <ProTip onNavigate={onNavigate} />
        </div>


        {/* ══════════════════════════════════════════════════════════════
            MOBILE LAYOUT
            ══════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden w-full overflow-x-hidden">

          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg" style={{ background: 'var(--th-highlight)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
            </button>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--th-text)' }}>
              {monthName} {year}
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              className="p-1.5 rounded-lg disabled:opacity-40" style={{ background: 'var(--th-highlight)' }}>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--th-text-muted)' }} />
            </button>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl p-4 relative overflow-hidden flex flex-col justify-center"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 120 }}>
              <div className="relative z-10">
                <p className="text-[12px] font-medium" style={{ color: 'var(--th-text-dim)' }}>Streak {'\uD83D\uDD25'}</p>
                <p className="text-[32px] font-black leading-tight mt-1" style={{ color: 'var(--th-text)' }}>
                  {data?.streak?.current ?? 0}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--th-text-dim)' }}>days</p>
              </div>
              <img src="/BigStreakFlame.webp" alt="" className="absolute pointer-events-none select-none"
                style={{ right: -40, top: '60%', transform: 'translateY(-50%)', width: 200, height: 200, objectFit: 'contain', opacity: 1 }} />
            </div>
            <div className="rounded-xl p-4 flex flex-col items-center justify-center relative"
              style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 120 }}>
              <p className="text-[12px] font-medium mb-1 absolute top-4 left-4" style={{ color: 'var(--th-text-dim)' }}>Completion</p>
              <div className="relative mt-5">
                <RingChart pct={data?.completionRate ?? 0} size={64} stroke={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] font-bold" style={{ color: 'var(--th-text)' }}>
                    {data?.completionRate ?? 0}%
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 flex flex-col justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 120 }}>
              <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--th-text-dim)' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} /> XP
              </p>
              <p className="text-[26px] font-black leading-tight mt-2" style={{ color: 'var(--th-text)' }}>
                {(data?.totalXP ?? 0).toLocaleString()}
              </p>
              <p className="text-[11px] mt-1" style={{ color: '#10b981' }}>+{data?.xpThisMonth ?? 0}</p>
            </div>
            <div className="rounded-xl p-4 flex flex-col justify-center" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)', minHeight: 120 }}>
              <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--th-text-dim)' }}>
                <Star className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} /> Perfect
              </p>
              <p className="text-[26px] font-black leading-tight mt-2" style={{ color: 'var(--th-text)' }}>
                {data?.perfectDays ?? 0}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--th-text-dim)' }}>days</p>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            {calGridBlock(true)}
          </div>

          {/* Selected day habits */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--th-text)' }}>{formattedSelDate}</h3>
                {selData && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(232,185,74,0.15)', color: '#E8B94A' }}>
                    {selData.completedCount}/{selData.totalCount} Completed
                  </span>
                )}
              </div>
              <button className="p-1.5 rounded-lg" style={{ background: 'var(--th-highlight)' }}>
                <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--th-text-dim)' }} />
              </button>
            </div>
            {dayHabitsBlock(true)}
          </div>

          {/* Day overview */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--th-card)', border: '1px solid var(--th-border)' }}>
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--th-text)' }}>Day Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Focus Time</p>
                  <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{fmtFocus(selData?.focusMinutes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Habits</p>
                  <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{selData?.completedCount ?? 0} / {selData?.totalCount ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,185,74,0.12)' }}>
                  <Activity className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} />
                </div>
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Productivity</p>
                  <p className="text-[13px] font-bold" style={{ color: 'var(--th-text)' }}>{selData?.productivity ?? 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,185,74,0.12)' }}>
                  <Smile className="w-3.5 h-3.5" style={{ color: '#E8B94A' }} />
                </div>
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--th-text-dim)' }}>Mood</p>
                  <p className="text-[13px] font-bold" style={{ color: mood?.color ?? 'var(--th-text)' }}>{mood?.label ?? '\u2014'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Momentum */}
          <div className="mb-4">
            <MomentumSection momentum={data?.momentum ?? []} isLoading={isLoading} streakMessage={streakMessage} mobile />
          </div>

          {/* Consistency trend */}
          <ConsistencyTrend data={data?.consistencyTrend ?? []} isLoading={isLoading} />

          {/* Habit Performance */}
          <div className="mt-4 flex flex-col gap-4">
            <HabitPerformanceCard title="Best Habit" habit={data?.bestHabit}
              color="#10b981" icon={<TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />}
              cta={`Keep it up! ${'\uD83D\uDD25'}`} />
            <HabitPerformanceCard title="Needs More Love" habit={data?.worstHabit}
              color="#f97316" icon={<Heart className="w-4 h-4" style={{ color: '#f97316' }} />}
              cta={`Let's build this habit! ${'\uD83D\uDCAA'}`} />
          </div>

          {/* Pro Tip */}
          <div className="mb-4">
            <ProTip onNavigate={onNavigate} />
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
