// Owner: B (Backend + AI). Transactions → moments. Plain rules, no AI.
import { randomUUID } from "node:crypto";
import type { Moment, Transaction } from "../types";
import { findPlace, normalize } from "./keywords";
import { addDays, daysBetween, firstOfNextMonth, isoDate, makeDate, shortLabel } from "./dates";
import { addSources } from "./merge";

const LOOKBACK_DAYS = 120;
const MIN_DEPOSIT = 500;
const TRIP_WINDOW_DAYS = 120; // a payment without a destination attaches to the next trip within this window
const MATCHED_TRIP_WINDOW_DAYS = 365; // a payment whose destination matches the trip

const DEPOSIT = /\b(huurwaarborg|waarborg|huurgarantie|rental deposit|garantie locative)\b/;
const REMOVAL = /\b(verhui[sz]\w*|removals?|movers|demenag\w*)\b/;
const NOTARY = /\b(notari\w*|notary|notaire|aankoopakte|acte d achat)\b/;
const TRAVEL =
  /\b(tap air portugal|tap portugal|brussels airlines|ryanair|klm|lufthansa|easyjet|vueling|transavia|air france|all nippon airways|japan airlines|swiss international|tui|eurostar|thalys|jungfrau\w*|booking com|airbnb|expedia|hotels?)\b/;
// Carriers whose name gives away the destination.
const CARRIER_COUNTRY: [RegExp, string][] = [
  [/\ball nippon airways|japan airlines\b/, "JP"],
  [/\btap (?:air )?portugal\b/, "PT"],
  [/\beurostar\b/, "GB"],
  [/\bswiss international\b/, "CH"],
];

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

const bigEnough = (p: Payment) => Math.abs(p.amount) >= MIN_DEPOSIT;
const isDeposit = (p: Payment) => (p.type === "rental_deposit" || DEPOSIT.test(p.text)) && bigEnough(p);
const isNotary = (p: Payment) => (p.type === "notary_deposit" || NOTARY.test(p.text)) && bigEnough(p);
const isRemoval = (p: Payment) =>
  !isDeposit(p) && !isNotary(p) && (p.type === "removal_firm" || REMOVAL.test(p.text));

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
const merchant = (p: Payment) => p.merchant.slice(0, 40);

/**
 * Moving house from a rental deposit, a notary deposit (buying) and/or a removal-firm payment.
 * Date: from a payment message ("verlijden 18/10/2026"), else the first of the next month.
 * Airline and hotel payments never create a trip on their own (no reliable dates); see attachTripPayments.
 */
export function detectFromTransactions(txs: Transaction[], today: string): Moment[] {
  const payments = recentPayments(txs, today);
  const deposit = payments.filter(isDeposit).at(-1);
  const notary = payments.filter(isNotary).at(-1);
  const removal = payments.filter(isRemoval).at(-1);
  const signals = [notary, deposit, removal].filter((p): p is Payment => !!p);
  if (signals.length === 0) return [];

  const dated = signals.map((p) => dateInMessage(p.description, p.day)).find((d) => d);
  const startDate = dated ?? firstOfNextMonth(signals[0].day);
  if (!startDate || startDate < today) return []; // already moved

  const sources: Moment["sources"] = [];
  if (notary) sources.push({ kind: "transaction", label: `Notary deposit (${euros(notary.amount)}) on ${shortLabel(notary.day)}` });
  if (deposit) sources.push({ kind: "transaction", label: `Rental deposit (${euros(deposit.amount)}) on ${shortLabel(deposit.day)}` });
  if (removal) sources.push({ kind: "transaction", label: `${merchant(removal)} booking on ${shortLabel(removal.day)}` });

  const attrs: Moment["attrs"] = { housing: notary ? "buy" : "rent" };
  const place = findPlace(signals.map((p) => `${p.merchant} ${p.description ?? ""}`).join(" "));
  if (place?.city) attrs.city = place.city;

  return [
    {
      id: randomUUID(),
      type: "moving",
      startDate,
      attrs,
      sources,
      confidence: signals.length > 1 ? 0.9 : 0.6,
    },
  ];
}

/** The destination a payment gives away: a place in its text, or the carrier. */
function paymentCountry(p: Payment): string | undefined {
  const place = findPlace(`${p.merchant} ${p.description ?? ""}`);
  if (place && place.country !== "BE") return place.country;
  return CARRIER_COUNTRY.find(([pattern]) => pattern.test(p.text))?.[1];
}

/**
 * Adds each airline, rail or hotel payment as a source of the trip it belongs to: the trip to the
 * payment's country if known, else the first trip starting within 120 days after the payment.
 */
export function attachTripPayments(moments: Moment[], txs: Transaction[], today: string): Moment[] {
  const trips = moments
    .filter((m) => m.type === "trip_abroad")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const extra = new Map<string, Moment["sources"]>();
  for (const p of recentPayments(txs, today).filter((p) => TRAVEL.test(p.text))) {
    const after = (t: Moment, days: number) => t.startDate >= p.day && daysBetween(p.day, t.startDate) <= days;
    const country = paymentCountry(p);
    const trip = country
      ? trips.find((t) => t.attrs.country === country && after(t, MATCHED_TRIP_WINDOW_DAYS))
      : trips.find((t) => after(t, TRIP_WINDOW_DAYS));
    if (!trip) continue;
    const label = `${merchant(p)} (${euros(p.amount)}) on ${shortLabel(p.day)}`;
    extra.set(trip.id, [...(extra.get(trip.id) ?? []), { kind: "transaction", label }]);
  }
  return moments.map((m) => (extra.has(m.id) ? addSources(m, extra.get(m.id)!) : m));
}
