/** Format a date as relative text: 'Today', 'Yesterday', 'X days ago' */
export function formatRelative(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format a date with options */
export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', ...options,
  });
}

/** Check if a date is today */
export function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

/** Check if a date falls within the current week (Mon-Sun) */
export function isThisWeek(date) {
  const { start, end } = getWeekRange();
  const d = new Date(date);
  return d >= start && d <= end;
}

/** Get the start and end of the current week (Monday-based) */
export function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Get the start and end of the current month */
export function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Generate an array of date strings between start and end */
export function getDaysInRange(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= new Date(end)) {
    days.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Calculate current streak from a sorted (desc) array of completion dates */
export function calculateStreak(dates) {
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let expected = new Date(today);

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === expected.getTime()) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else if (streak === 0 && expected.getTime() - d.getTime() === 86400000) {
      expected = new Date(d);
      streak = 1;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Get greeting based on time of day */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
