/**
 * Finance module utility functions.
 * Currency formatting, date helpers, and constants.
 */

// ═══ Currency Formatting ═══

const CURRENCY_CONFIG = {
  INR: { locale: 'en-IN', symbol: '₹', code: 'INR' },
  USD: { locale: 'en-US', symbol: '$', code: 'USD' },
  EUR: { locale: 'de-DE', symbol: '€', code: 'EUR' },
  GBP: { locale: 'en-GB', symbol: '£', code: 'GBP' },
  JPY: { locale: 'ja-JP', symbol: '¥', code: 'JPY' },
  AUD: { locale: 'en-AU', symbol: 'A$', code: 'AUD' },
  CAD: { locale: 'en-CA', symbol: 'C$', code: 'CAD' },
};

export function formatCurrency(amount, currency = 'INR', compact = false) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  const isWhole = Number(amount) % 1 === 0;
  const opts = {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  };
  if (compact && Math.abs(amount) >= 100000) {
    opts.notation = 'compact';
    opts.maximumFractionDigits = 1;
  }
  try {
    return new Intl.NumberFormat(config.locale, opts).format(amount);
  } catch {
    return `${config.symbol}${Number(amount || 0).toLocaleString()}`;
  }
}

export function getCurrencySymbol(currency = 'INR') {
  return CURRENCY_CONFIG[currency]?.symbol || '₹';
}

// ═══ Percentage Formatting ═══

export function formatPercent(value, decimals = 1) {
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(decimals)}%`;
}

export function formatPercentRaw(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`;
}

// ═══ Date Helpers ═══

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const d = new Date(year, parseInt(month) - 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function daysUntil(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ═══ Number Helpers ═══

export function abbreviateNumber(n) {
  if (Math.abs(n) >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

// ═══ Color Helpers ═══

export function getChangeColor(value) {
  if (value > 0) return '#10B981'; // green
  if (value < 0) return '#EF4444'; // red
  return 'var(--th-text-secondary)';
}

export function getRiskColor(percent) {
  if (percent >= 100) return '#EF4444';
  if (percent >= 80) return '#F59E0B';
  if (percent >= 50) return '#3B82F6';
  return '#10B981';
}

export function getScoreColor(score) {
  if (score >= 86) return '#10B981';
  if (score >= 71) return '#22C55E';
  if (score >= 51) return '#3B82F6';
  if (score >= 31) return '#F59E0B';
  return '#EF4444';
}

// ═══ Category Constants ═══

export const CATEGORY_ICONS = {
  // Expense Categories
  'Food & Dining': '🍔',
  'Groceries': '🛒',
  'Rent & Mortgage': '🏠',
  'Transport': '🚗',
  'Fuel': '⛽',
  'Shopping': '🛍️',
  'Subscriptions': '📱',
  'Health & Fitness': '💪',
  'Education': '🎓',
  'Entertainment': '🎬',
  'Bills & Utilities': '💡',
  'Travel': '✈️',
  'Personal Care': '💇',
  'Family & Kids': '👨‍👩‍👧',
  'Pets': '🐾',
  'Gifts & Donations': '🎁',
  'Insurance': '🛡️',
  'Taxes': '🧾',
  'Debt Payment': '💳',
  'Other Expense': '📦',
  
  // Income Categories
  'Salary': '💰',
  'Freelance': '💻',
  'Investments': '📈',
  'Business': '🏢',
  'Gifts Received': '🎁',
  'Refunds': '💳',
  'Side Hustle': '🚀',
  'Other Income': '💵',
};

export const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B',
  'Groceries': '#14B8A6',
  'Rent & Mortgage': '#A855F7',
  'Transport': '#3B82F6',
  'Fuel': '#EF4444',
  'Shopping': '#EC4899',
  'Subscriptions': '#8B5CF6',
  'Health & Fitness': '#10B981',
  'Education': '#6366F1',
  'Entertainment': '#F97316',
  'Bills & Utilities': '#6366F1',
  'Travel': '#0EA5E9',
  'Personal Care': '#FB923C',
  'Family & Kids': '#F472B6',
  'Pets': '#D97706',
  'Gifts & Donations': '#EC4899',
  'Insurance': '#6366F1',
  'Taxes': '#EF4444',
  'Debt Payment': '#EF4444',
  'Other Expense': '#9CA3AF',
  
  'Salary': '#22C55E',
  'Freelance': '#0EA5E9',
  'Investments': '#22C55E',
  'Business': '#F59E0B',
  'Gifts Received': '#F472B6',
  'Refunds': '#14B8A6',
  'Side Hustle': '#8B5CF6',
  'Other Income': '#9CA3AF',
};

export const MOOD_LABELS = {
  NECESSARY: { label: 'Necessary', emoji: '🎯', color: '#3B82F6' },
  HAPPY: { label: 'Happy', emoji: '😊', color: '#10B981' },
  REGRET: { label: 'Regret', emoji: '😔', color: '#EF4444' },
  NEUTRAL: { label: 'Neutral', emoji: '😐', color: '#9CA3AF' },
};

export const NECESSITY_LABELS = {
  ESSENTIAL: { label: 'Essential', color: '#10B981' },
  COMFORTABLE: { label: 'Comfortable', color: '#3B82F6' },
  LUXURY: { label: 'Luxury', color: '#F59E0B' },
  WASTEFUL: { label: 'Wasteful', color: '#EF4444' },
};

export const STREAK_CONFIG = {
  no_spend: { label: 'No-Spend Days', icon: '🚫', color: '#EF4444' },
  savings: { label: 'Savings Streak', icon: '💰', color: '#10B981' },
  budget: { label: 'Budget Streak', icon: '📊', color: '#3B82F6' },
  logging: { label: 'Logging Streak', icon: '✏️', color: '#8B5CF6' },
};

export const GOAL_TYPE_CONFIG = {
  EMERGENCY: { label: 'Emergency Fund', icon: '🛡️', color: '#EF4444' },
  ASSET: { label: 'Asset', icon: '🏠', color: '#3B82F6' },
  TRAVEL: { label: 'Travel', icon: '✈️', color: '#0EA5E9' },
  EDUCATION: { label: 'Education', icon: '🎓', color: '#8B5CF6' },
  INVESTMENT: { label: 'Investment', icon: '📈', color: '#22C55E' },
  OPPORTUNITY: { label: 'Opportunity', icon: '🎯', color: '#F59E0B' },
  CUSTOM: { label: 'Custom', icon: '⭐', color: '#6366F1' },
};
