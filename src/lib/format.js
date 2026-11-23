// Display helpers shared by pages and components.

export function formatMoney(dollars) {
  if (dollars === null || dollars === undefined || dollars === '') return null;
  const n = Number(dollars);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 === 0 ? 0 : 2 });
}

// "2022-08-14" -> "Aug 14, 2022" without time-zone drift.
export function formatDate(isoDate) {
  if (!isoDate) return null;
  const [y, m, d] = String(isoDate).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// "2022-08-14" -> { mon: "Aug", day: "14", year: "2022" }
export function dateParts(isoDate) {
  if (!isoDate) return null;
  const [y, m, d] = String(isoDate).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    mon: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    day: String(d).padStart(2, '0'),
    year: String(y),
  };
}

// Condition values the API accepts, in order, with collector labels.
export const CONDITIONS = [
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
];

export function conditionLabel(value) {
  return CONDITIONS.find((c) => c.value === value)?.label ?? null;
}

// Initials for the square avatar.
export function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const base = String(nameOrEmail).split('@')[0];
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toUpperCase();
}

// Dollars typed by a person -> integer cents, or null.
export function toCents(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(String(value).replace(/[$,\s]/g, ''));
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export const HANDOFFS = [
  { value: 'ships', label: 'Ships' },
  { value: 'meets_at_shows', label: 'Meets at shows' },
  { value: 'either', label: 'Ships or meets at shows' },
];

export function handoffLabel(value) {
  return HANDOFFS.find((h) => h.value === value)?.label ?? null;
}
