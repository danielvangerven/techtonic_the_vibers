import { getPastMoments, PastMoment } from "./data";
import type { PeerStats, Moment } from "./types";

export const MIN_GROUP_SIZE = 50;

function round10(val: number): number {
  return Math.round(val / 10) * 10;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computePeerStats(
  customer: { household: string; ageBand: string; region: string },
  moment: Moment
): { peers: PeerStats; forgotPcts: Record<string, number> } {
  const allMoments = getPastMoments();

  // Filter moments by type and attributes first
  const typeMatches = allMoments.filter((m) => {
    if (m.type !== moment.type) return false;
    if (moment.type === "trip_abroad") {
      if (moment.attrs.country && m.country !== moment.attrs.country) return false;
    }
    return true;
  });

  // Step 1: Narrowest cohort (household + ageBand + region)
  let cohort = typeMatches.filter(
    (m) =>
      m.household === customer.household &&
      m.ageBand === customer.ageBand &&
      m.region === customer.region
  );
  let cohortLabel = `${customer.household}s aged ${customer.ageBand} in ${customer.region}`;

  // Step 2: Widen by dropping region
  if (cohort.length < MIN_GROUP_SIZE) {
    cohort = typeMatches.filter(
      (m) => m.household === customer.household && m.ageBand === customer.ageBand
    );
    cohortLabel = `${customer.household}s aged ${customer.ageBand}`;
  }

  // Step 3: Widen by dropping ageBand
  if (cohort.length < MIN_GROUP_SIZE) {
    cohort = typeMatches.filter((m) => m.household === customer.household);
    cohortLabel = `all ${customer.household}s`;
  }

  // Step 4: Refuse if still < MIN_GROUP_SIZE
  if (cohort.length < MIN_GROUP_SIZE) {
    return {
      peers: { ok: false, reason: "too_few_people" },
      forgotPcts: {},
    };
  }

  // Extract metric values
  let spendValues: number[] = [];
  let unexpectedValues: number[] = [];

  if (moment.type === "trip_abroad") {
    spendValues = cohort.map((m) => m.totalSpent ?? 0).filter((v) => v > 0);
    unexpectedValues = cohort.map((m) => m.unexpectedCost ?? 0).filter((v) => v > 0);
  } else if (moment.type === "moving") {
    spendValues = cohort.map((m) => m.extraCostsFirst3Months ?? 0).filter((v) => v > 0);
  } else if (moment.type === "wedding_guest") {
    spendValues = cohort.map((m) => m.giftAmount ?? 0).filter((v) => v > 0);
  }

  const median = round10(percentile(spendValues, 0.5));
  const p20 = round10(percentile(spendValues, 0.2));
  const p80 = round10(percentile(spendValues, 0.8));
  const unexpectedMedian = unexpectedValues.length > 0 ? round10(percentile(unexpectedValues, 0.5)) : undefined;

  // Calculate percentage who forgot each check
  const forgotPcts: Record<string, number> = {};
  const total = cohort.length;
  for (const m of cohort) {
    for (const item of m.forgot || []) {
      forgotPcts[item] = (forgotPcts[item] || 0) + 1;
    }
  }
  for (const key of Object.keys(forgotPcts)) {
    forgotPcts[key] = Math.round((forgotPcts[key] / total) * 100);
  }

  return {
    peers: {
      ok: true,
      cohortLabel,
      n: cohort.length,
      median,
      p20,
      p80,
      unexpectedMedian,
    },
    forgotPcts,
  };
}
