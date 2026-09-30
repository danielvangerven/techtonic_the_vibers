// Owner: B (Backend + AI). Transactions → moments. Plain rules, no AI.
import { randomUUID } from "node:crypto";
import type { Moment, Transaction } from "../types";
import { findPlace, normalize } from "./keywords";
import { addDays, daysBetween, firstOfNextMonth, isoDate, makeDate, shortLabel } from "./dates";
import { addSources } from "./merge";

const LOOKBACK_DAYS = 120;
const MIN_DEPOSIT = 500;
const TRIP_WINDOW_DAYS = 120;

const DEPOSIT = /\b(huurwaarborg|waarborg|huurgarantie|rental deposit|garantie locative)\b/;
const REMOVAL = /\b(verhui[sz]\w*|removals?|movers|demenag\w*)\b/;
const TRAVEL =
  /\b(tap air portugal|tap portugal|brussels airlines|ryanair|klm|lufthansa|easyjet|vueling|transavia|air france|tui|booking com|airbnb|expedia|hotels?)\b/;

type Payment = Transaction & { day: string; text: string };

function recentPayments(txs: Transaction[], today: string): Payment[] {
  const from = addDays(today, -LOOKBACK_DAYS);
  return txs
    .flatMap((tx) => {
      const day = isoDate(tx.date);
      if (!day || day < from) return [];
      return [{ ...tx, day, text: normalize(`${tx.merchant} ${tx.type ?? ""} ${tx.description ?? ""}`) }];
    })
    .sort((a, b) => a.day.localeCompare(b.day));
}

const isDeposit = (p: Payment) =>
  (p.type === "rental_deposit" || DEPOSIT.test(p.text)) && Math.abs(p.amount) >= MIN_DEPOSIT;
const isRemoval = (p: Payment) => !isDeposit(p) && (p.type === "removal_firm" || REMOVAL.test(p.text));

/** A date in the payment message ("Verhuis 01/12" or "01/12/2026"), on or after the payment day. */
function dateInMessage(message: string | undefined, paidOn: string): string | null {
  const m = message ? /\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}|\d{2}))?\b/.exec(message) : null;
  if (!m) return null;
  const [day, month] = [+m[1], +m[2]];
  if (m[3]) return makeDate(m[3].length === 2 ? 2000 + +m[3] : +m[3], month, day);
  const year = +paidOn.slice(0, 4);
  const guess = makeDate(year, month, day);
  return guess && guess < paidOn ? makeDate(year + 1, month, day) : guess;
}

const euros = (amount: number) => `€${Math.round(Math.abs(amount)).toLocaleString("en-GB")}`;

/**
 * Moving house from a rental deposit and/or a removal-firm payment. Move date: from the removal
 * payment's message, else the first of the month after the payment. Airline and hotel payments
 * never create a trip on their own (no destination or date); see attachTripPayments.
 */
export function detectFromTransactions(txs: Transaction[], today: string): Moment[] {
  const payments = recentPayments(txs, today);
  const deposit = payments.filter(isDeposit).at(-1);
  const removal = payments.filter(isRemoval).at(-1);
  const first = deposit ?? removal;
  if (!first) return [];

  const startDate = (removal && dateInMessage(removal.description, removal.day)) ?? firstOfNextMonth(first.day);
  if (startDate < today) return []; // already moved

  const sources: Moment["sources"] = [];
  if (deposit) {
    sources.push({ kind: "transaction", label: `Rental deposit (${euros(deposit.amount)}) on ${shortLabel(deposit.day)}` });
  }
  if (removal) {
    sources.push({ kind: "transaction", label: `${removal.merchant.slice(0, 40)} booking on ${shortLabel(removal.day)}` });
  }

  const place = findPlace([deposit, removal].map((p) => (p ? `${p.merchant} ${p.description ?? ""}` : "")).join(" "));
  return [
    {
      id: randomUUID(),
      type: "moving",
      startDate,
      attrs: place?.city ? { city: place.city } : {},
      sources,
      confidence: deposit && removal ? 0.9 : 0.6,
    },
  ];
}

/** Adds each airline or hotel payment as a source of the first trip starting within 120 days after it. */
export function attachTripPayments(moments: Moment[], txs: Transaction[], today: string): Moment[] {
  const trips = moments
    .filter((m) => m.type === "trip_abroad")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const extra = new Map<string, Moment["sources"]>();
  for (const p of recentPayments(txs, today).filter((p) => TRAVEL.test(p.text))) {
    const trip = trips.find((t) => t.startDate >= p.day && daysBetween(p.day, t.startDate) <= TRIP_WINDOW_DAYS);
    if (!trip) continue;
    const label = `${p.merchant.slice(0, 40)} payment on ${shortLabel(p.day)}`;
    extra.set(trip.id, [...(extra.get(trip.id) ?? []), { kind: "transaction", label }]);
  }
  return moments.map((m) => (extra.has(m.id) ? addSources(m, extra.get(m.id)!) : m));
}
