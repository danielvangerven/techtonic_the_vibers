import type { Moment } from "./types";
import { getPersonas } from "./data";
import { attachTripPayments, detectFromTransactions, dismissKey, mergeMoments, todayIso } from "./detect";

// In-memory moments per customerId for the demo. On first access they are detected from the
// customer's transactions (Tom's move); calendar imports and Tell KBC add to them.
const store: Record<string, Moment[]> = {};
// Moments the customer removed ("that's wrong"), so detection never brings them back.
const dismissed: Record<string, Set<string>> = {};

function dismissedFor(customerId: string): Set<string> {
  return (dismissed[customerId] ??= new Set());
}

function transactionsOf(customerId: string) {
  return getPersonas().find((p) => p.id === customerId)?.transactions ?? [];
}

function ensureLoaded(customerId: string): Moment[] {
  if (!store[customerId]) {
    const today = todayIso();
    const txs = transactionsOf(customerId);
    const detected = mergeMoments([], detectFromTransactions(txs, today), dismissedFor(customerId));
    store[customerId] = attachTripPayments(detected, txs, today);
  }
  return store[customerId];
}

export function getMomentsForCustomer(customerId: string): Moment[] {
  return ensureLoaded(customerId);
}

export function addMomentForCustomer(customerId: string, moment: Moment): void {
  store[customerId] = [moment, ...ensureLoaded(customerId)];
}

/**
 * Merges newly detected moments into the customer's timeline and links travel payments to trips.
 * Returns the moments that are new or changed.
 */
export function addDetectedMoments(customerId: string, incoming: Moment[]): Moment[] {
  const before = new Map(ensureLoaded(customerId).map((m) => [m.id, JSON.stringify(m)]));
  const merged = mergeMoments(ensureLoaded(customerId), incoming, dismissedFor(customerId));
  store[customerId] = attachTripPayments(merged, transactionsOf(customerId), todayIso());
  return store[customerId].filter((m) => before.get(m.id) !== JSON.stringify(m));
}

export function deleteMomentForCustomer(customerId: string, momentId: string): boolean {
  const moments = ensureLoaded(customerId);
  const target = moments.find((m) => m.id === momentId);
  if (!target) return false;
  store[customerId] = moments.filter((m) => m.id !== momentId);
  dismissedFor(customerId).add(dismissKey(target));
  return true;
}
