// Owner: B (Backend + AI). Merges moments found by different signals into one timeline.
import type { Moment } from "../types";
import { daysBetween } from "./dates";

const SAME_MOMENT_DAYS = 7;
const BONUS_PER_SOURCE = 0.05;
const MAX_CONFIDENCE = 0.99;

type Source = Moment["sources"][number];
type MomentKey = Pick<Moment, "type" | "startDate">;

/** Key stored when a customer taps "that's wrong", so detection never brings the moment back. */
export function dismissKey(m: MomentKey): string {
  return `${m.type}|${m.startDate}`;
}

function sameMoment(a: MomentKey, b: MomentKey): boolean {
  return a.type === b.type && Math.abs(daysBetween(a.startDate, b.startDate)) <= SAME_MOMENT_DAYS;
}

function isDismissed(m: MomentKey, dismissed: Set<string>): boolean {
  for (const key of dismissed) {
    const [type, startDate] = key.split("|");
    if (sameMoment(m, { type: type as Moment["type"], startDate })) return true;
  }
  return false;
}

/** Adds sources not yet on the moment; each new one raises confidence by 0.05 (max 0.99). */
export function addSources(m: Moment, sources: Source[], confidence = m.confidence): Moment {
  const known = new Set(m.sources.map((s) => `${s.kind}|${s.label}`));
  const added = sources.filter((s) => {
    const key = `${s.kind}|${s.label}`;
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  if (added.length === 0) return m;
  const raised = Math.max(m.confidence, confidence) + BONUS_PER_SOURCE * added.length;
  return {
    ...m,
    sources: [...m.sources, ...added],
    confidence: Math.round(Math.min(MAX_CONFIDENCE, raised) * 100) / 100,
  };
}

/**
 * Same type and start dates within 7 days → one moment: the existing ID is kept, sources are
 * combined and missing details are filled in. Dismissed moments are skipped. Sorted by start date.
 */
export function mergeMoments(existing: Moment[], incoming: Moment[], dismissed: Set<string>): Moment[] {
  const result = [...existing];
  for (const m of incoming) {
    if (isDismissed(m, dismissed)) continue;
    const i = result.findIndex((r) => sameMoment(r, m));
    if (i === -1) {
      result.push(m);
      continue;
    }
    const merged = addSources(result[i], m.sources, m.confidence);
    const attrs = { ...m.attrs, ...merged.attrs };
    const endDate = merged.endDate ?? m.endDate;
    const changed =
      merged !== result[i] ||
      endDate !== merged.endDate ||
      Object.keys(attrs).length !== Object.keys(merged.attrs).length;
    if (changed) result[i] = { ...merged, attrs, ...(endDate ? { endDate } : {}) };
  }
  return result.sort((a, b) => a.startDate.localeCompare(b.startDate));
}
