export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(n);

export const formatCurrency = (n, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

export const formatPercentage = (n) => `${Math.round(n)}%`;

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const truncateText = (text, maxLen = 50) =>
  text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
