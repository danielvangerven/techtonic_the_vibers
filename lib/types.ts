// SHARED CONTRACTS — change only with the whole team's agreement.
// Source: kbc-ahead-context/docs/PLAN.md, section "Contracts".

export type MomentType = "trip_abroad" | "moving" | "wedding_guest";

export interface Moment {
  id: string; // random ID (crypto.randomUUID()), never sequential
  type: MomentType;
  startDate: string; // ISO date
  endDate?: string;
  attrs: { country?: string; city?: string; nights?: number };
  sources: { kind: "calendar" | "transaction" | "told_us"; label: string }[];
  confidence: number; // 0-1
}

export interface Check {
  id: string; // e.g. "medical_cover"
  label: string;
  status: "ok" | "gap" | "todo";
  peerMissedPct?: number; // "24% of people like you forgot this"
  action?: { label: string; productId: string };
}

export type PeerStats =
  | {
      ok: true;
      cohortLabel: string;
      n: number;
      median: number;
      p20: number;
      p80: number;
      unexpectedMedian?: number;
    }
  | { ok: false; reason: "too_few_people" };

export interface MomentView {
  moment: Moment;
  readiness: { done: number; total: number };
  checks: Check[];
  peers: PeerStats;
}
