const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "$1,234,567" — whole dollars, hand-rolled so it behaves identically on iOS and Android. */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}`;
}

/** "$4.6M" / "$52.5K" for tight spots like cards and summary tiles. */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `$${trimTrailingZero(amount / 1_000_000)}M`;
  }
  if (abs >= 10_000) {
    return `$${trimTrailingZero(amount / 1_000)}K`;
  }
  return formatCurrency(amount);
}

function trimTrailingZero(value: number): string {
  const fixed = (Math.round(value * 10) / 10).toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

/** 2 → "2%", 1.75 → "1.75%". */
export function formatPercent(value: number): string {
  return `${value}%`;
}

/** ISO string → "Sep 30, 2026". UTC-based so device timezone never shifts the date. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
