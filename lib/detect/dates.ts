// Owner: B (Backend + AI). Date helpers for moment detection. All dates are ISO "YYYY-MM-DD" in UTC.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;

/** A valid calendar date, or null. */
export function makeDate(year: number, month: number, day: number): string | null {
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return d.toISOString().slice(0, 10);
}

/** "2026-10-14" or "2026-10-14T08:00:00Z" → "2026-10-14"; anything else → null. */
export function isoDate(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? makeDate(+m[1], +m[2], +m[3]) : null;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export function firstOfNextMonth(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : makeDate(y, m + 1, 1)!;
}

/** "2026-09-03" → "3 Sep", for source labels. */
export function shortLabel(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** Today, or DEMO_TODAY from .env so the recorded demo always sees the same dates. */
export function todayIso(): string {
  const demo = process.env.DEMO_TODAY ? isoDate(process.env.DEMO_TODAY) : null;
  return demo ?? new Date().toISOString().slice(0, 10);
}
