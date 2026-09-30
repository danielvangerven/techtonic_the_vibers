// Owner: B (Backend + AI). In-memory state per customer for the demo: their moments (detected
// from their calendar and transactions on first access), the moments they removed, and the
// products they activated in the app. Every function takes the customer ID from the session.
import type { Moment } from "./types";
import { findPersona, type Persona } from "./data";
import {
  attachTripPayments,
  detectFromCalendar,
  detectFromTransactions,
  dismissKey,
  mergeMoments,
  todayIso,
} from "./detect";
import { withProduct } from "./products";

interface CustomerState {
  moments: Moment[];
  dismissed: Set<string>; // "that's wrong": detection never brings these back
  activated: Record<string, boolean>; // products activated during the demo
}

// Kept on globalThis so the state survives dev hot reloads.
const globals = globalThis as { __kbcStore?: Map<string, Promise<CustomerState>> };
const states = (globals.__kbcStore ??= new Map());

async function detectAll(persona: Persona, dismissed: Set<string>): Promise<Moment[]> {
  const today = todayIso();
  const fromCalendar = await detectFromCalendar(persona.calendar ?? [], today);
  const fromTransactions = detectFromTransactions(persona.transactions ?? [], today);
  const merged = mergeMoments(mergeMoments([], fromCalendar, dismissed), fromTransactions, dismissed);
  return attachTripPayments(merged, persona.transactions ?? [], today);
}

function customerState(customerId: string): Promise<CustomerState> {
  let state = states.get(customerId);
  if (!state) {
    state = (async () => {
      const persona = findPersona(customerId);
      const dismissed = new Set<string>();
      return { moments: persona ? await detectAll(persona, dismissed) : [], dismissed, activated: {} };
    })();
    state.catch(() => states.delete(customerId)); // retry on the next request
    states.set(customerId, state);
  }
  return state;
}

/** Starts the customer's demo over: detection runs again on the next request. */
export function resetCustomer(customerId: string): void {
  states.delete(customerId);
}

/** The customer with the products they hold, including ones activated during the demo. */
export async function getCustomer(customerId: string): Promise<Persona | undefined> {
  const persona = findPersona(customerId);
  if (!persona) return undefined;
  const { activated } = await customerState(customerId);
  return { ...persona, products: { ...persona.products, ...activated } };
}

export async function activateProduct(customerId: string, productId: string): Promise<void> {
  const state = await customerState(customerId);
  state.activated = withProduct(state.activated, productId);
}

export async function getMoments(customerId: string): Promise<Moment[]> {
  return (await customerState(customerId)).moments;
}

/** The moment only if it belongs to this customer. */
export async function getMoment(customerId: string, momentId: string): Promise<Moment | undefined> {
  return (await getMoments(customerId)).find((m) => m.id === momentId);
}

/**
 * Merges newly detected moments into the customer's timeline and links travel payments to trips.
 * Returns the moments that are new or changed.
 */
export async function addDetectedMoments(customerId: string, incoming: Moment[]): Promise<Moment[]> {
  const state = await customerState(customerId);
  const before = new Map(state.moments.map((m) => [m.id, JSON.stringify(m)]));
  const merged = mergeMoments(state.moments, incoming, state.dismissed);
  state.moments = attachTripPayments(merged, findPersona(customerId)?.transactions ?? [], todayIso());
  return state.moments.filter((m) => before.get(m.id) !== JSON.stringify(m));
}

/** Removes the moment if it belongs to this customer; false otherwise. */
export async function deleteMoment(customerId: string, momentId: string): Promise<boolean> {
  const state = await customerState(customerId);
  const target = state.moments.find((m) => m.id === momentId);
  if (!target) return false;
  state.moments = state.moments.filter((m) => m.id !== momentId);
  state.dismissed.add(dismissKey(target));
  return true;
}
