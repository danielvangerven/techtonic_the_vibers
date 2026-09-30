// Owner: B (Backend + AI). In-memory state per customer for the demo: their calendar (editable in
// the app), the moments detected from it and from their transactions, the moments they removed,
// and the products they activated. Every function takes the customer ID from the session.
import { randomUUID } from "node:crypto";
import type { CalendarEntry, CalendarEvent, Moment } from "./types";
import { findPersona, type Persona } from "./data";
import {
  attachTripPayments,
  detectFromCalendar,
  detectFromTransactions,
  dismissKey,
  mergeMoments,
  sameMoment,
  todayIso,
} from "./detect";
import { withProduct } from "./products";

export const MAX_CALENDAR_EVENTS = 200;

interface CustomerState {
  calendar: CalendarEntry[];
  moments: Moment[];
  dismissed: Set<string>; // "that's wrong": detection never brings these back
  activated: Record<string, boolean>; // products activated during the demo
}

// Kept on globalThis so the state survives dev hot reloads.
const globals = globalThis as { __kbcStore?: Map<string, Promise<CustomerState>> };
const states = (globals.__kbcStore ??= new Map());

async function detectAll(calendar: CalendarEvent[], persona: Persona, dismissed: Set<string>): Promise<Moment[]> {
  const today = todayIso();
  const transactions = persona.transactions ?? [];
  const fromCalendar = await detectFromCalendar(calendar, today);
  const fromTransactions = detectFromTransactions(transactions, today);
  const merged = mergeMoments(mergeMoments([], fromCalendar, dismissed), fromTransactions, dismissed);
  return attachTripPayments(merged, transactions, today);
}

/**
 * Runs detection again after a calendar change. A moment that still exists keeps its ID, a moment
 * whose calendar entry was deleted disappears, and what the customer told KBC is kept.
 */
async function redetect(customerId: string, state: CustomerState): Promise<void> {
  const persona = findPersona(customerId);
  if (!persona) return;
  const detected = await detectAll(state.calendar, persona, state.dismissed);
  const withIds = detected.map((m) => {
    const previous = state.moments.find((p) => sameMoment(p, m));
    return previous ? { ...m, id: previous.id } : m;
  });
  const told = state.moments
    .filter((m) => m.sources.some((s) => s.kind === "told_us"))
    .map((m) => ({ ...m, sources: m.sources.filter((s) => s.kind === "told_us") }));
  state.moments = mergeMoments(withIds, told, state.dismissed);
}

function customerState(customerId: string): Promise<CustomerState> {
  let state = states.get(customerId);
  if (!state) {
    state = (async () => {
      const persona = findPersona(customerId);
      const calendar = (persona?.calendar ?? []).map((e) => ({ ...e, id: randomUUID() }));
      const dismissed = new Set<string>();
      const moments = persona ? await detectAll(calendar, persona, dismissed) : [];
      return { calendar, moments, dismissed, activated: {} };
    })();
    state.catch(() => states.delete(customerId)); // retry on the next request
    states.set(customerId, state);
  }
  return state;
}

/** Starts the customer's demo over: their original calendar and fresh detection. */
export function resetCustomer(customerId: string): void {
  states.delete(customerId);
}

// ---- Customer and products ----------------------------------------------------------------

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

// ---- Moments --------------------------------------------------------------------------------

export async function getMoments(customerId: string): Promise<Moment[]> {
  return (await customerState(customerId)).moments;
}

/** The moment only if it belongs to this customer. */
export async function getMoment(customerId: string, momentId: string): Promise<Moment | undefined> {
  return (await getMoments(customerId)).find((m) => m.id === momentId);
}

/** Merges moments from Tell KBC into the timeline. Returns the moments that are new or changed. */
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

// ---- Calendar -------------------------------------------------------------------------------

export async function getCalendar(customerId: string): Promise<CalendarEntry[]> {
  return (await customerState(customerId)).calendar;
}

/** Adds events and re-runs detection. Null if the calendar would exceed its size limit. */
export async function addEvents(customerId: string, events: CalendarEvent[]): Promise<CalendarEntry[] | null> {
  const state = await customerState(customerId);
  if (state.calendar.length + events.length > MAX_CALENDAR_EVENTS) return null;
  const added = events.map((e) => ({ ...e, id: randomUUID() }));
  state.calendar = [...state.calendar, ...added];
  await redetect(customerId, state);
  return added;
}

/** Replaces an event of this customer and re-runs detection. Undefined if it isn't theirs. */
export async function updateEvent(
  customerId: string,
  eventId: string,
  event: CalendarEvent,
): Promise<CalendarEntry | undefined> {
  const state = await customerState(customerId);
  if (!state.calendar.some((e) => e.id === eventId)) return undefined;
  const updated = { ...event, id: eventId };
  state.calendar = state.calendar.map((e) => (e.id === eventId ? updated : e));
  await redetect(customerId, state);
  return updated;
}

/** Deletes an event of this customer and re-runs detection; false if it isn't theirs. */
export async function deleteEvent(customerId: string, eventId: string): Promise<boolean> {
  const state = await customerState(customerId);
  if (!state.calendar.some((e) => e.id === eventId)) return false;
  state.calendar = state.calendar.filter((e) => e.id !== eventId);
  await redetect(customerId, state);
  return true;
}
