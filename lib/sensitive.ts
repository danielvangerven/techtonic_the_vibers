// Sensitive keyword filter (runs in browser and server-side)
// Drops medical, oncological, psychiatric, religious entries.

const SENSITIVE_PATTERNS = [
  /oncol/i,
  /psych/i,
  /therap/i,
  /dokter/i,
  /doctor/i,
  /ziekenhuis/i,
  /hospital/i,
  /chirurg/i,
  /medic/i,
  /kerk/i,
  /moskee/i,
  /synag/i,
  /biecht/i,
  /pray/i,
  /gebed/i,
  /sofa/i,
  /gynaec/i,
  /urolog/i,
];

export function isSensitiveEvent(title: string): boolean {
  if (!title) return false;
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(title));
}

export function filterSensitiveEvents<T extends { title?: string; summary?: string }>(
  events: T[]
): T[] {
  return events.filter((ev) => {
    const text = ev.title || ev.summary || "";
    return !isSensitiveEvent(text);
  });
}
