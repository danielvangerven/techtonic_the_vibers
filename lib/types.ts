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

export interface SmartAlternative {
  id: string;
  title: string;
  badge: string;
  description: string;
  peerAdoptionRate?: string;
  estimatedSavings?: string;
  action?: { label: string; target: string };
}

export interface KbcProductRecommendation {
  productId: string;
  name: string;
  category: "insurance" | "banking" | "loans" | "investments" | "deals_mobility";
  reason: string;
  actionLabel: string;
  priceOrRate?: string;
  badge?: string;
}

export interface MomentRecommendations {
  bestProduct?: KbcProductRecommendation;
  secondaryProduct?: KbcProductRecommendation;
  alternatives: SmartAlternative[];
}

export interface MomentView {
  moment: Moment;
  readiness: { done: number; total: number };
  checks: Check[];
  peers: PeerStats;
  recommendations?: MomentRecommendations;
}

// A customer's bank transaction, as in data/personas.json. `amount` is the money paid (positive).
export interface Transaction {
  date: string; // ISO date
  merchant: string;
  amount: number;
  type?: string; // bank category, e.g. "rental_deposit"
  description?: string; // payment message, e.g. "Voorschot verhuis 01/12/2026"
}

// A calendar entry as the browser sends it, after its sensitive filter.
// Titles only, no attendees, notes or locations. `endDate` is the last day of the event.
export interface CalendarEvent {
  title: string;
  startDate: string; // ISO date or date-time
  endDate?: string;
}
