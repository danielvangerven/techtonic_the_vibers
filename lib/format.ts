// Display helpers shared by the server (check labels) and the browser (moment titles, dates).
import type { Moment, MomentType } from "./types";

export const COUNTRY_NAMES: Record<string, string> = {
  PT: "Portugal",
  ES: "Spain",
  IT: "Italy",
  FR: "France",
  NL: "the Netherlands",
  DE: "Germany",
  AT: "Austria",
  CZ: "Czechia",
  JP: "Japan",
  US: "the US",
  GB: "the UK",
  CH: "Switzerland",
  GR: "Greece",
  IS: "Iceland",
  BE: "Belgium",
};

const countryName = (code?: string) => (code ? COUNTRY_NAMES[code]?.replace(/^the /, "") ?? code : undefined);

export const MOMENT_KIND: Record<MomentType, string> = {
  trip_abroad: "Trip abroad",
  moving: "Home",
  wedding_guest: "Wedding",
};

export function momentTitle(m: Moment): string {
  const { city, country, housing } = m.attrs;
  switch (m.type) {
    case "trip_abroad":
      if (city && country) return `${city}, ${countryName(country)}`;
      return countryName(country) ?? "Trip abroad";
    case "moving":
      return housing === "buy" ? `Buying a home${city ? ` in ${city}` : ""}` : `Moving house${city ? ` to ${city}` : ""}`;
    case "wedding_guest":
      return city ? `Wedding in ${city}` : "Wedding";
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

/** "14 – 28 Oct 2026", "28 Nov – 2 Dec 2026" or "12 Jun 2027". */
export function formatDateRange(start: string, end?: string): string {
  const a = parts(start);
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return `${a.d} ${MONTHS[a.m - 1]} ${a.y}`;
  const b = parts(end);
  if (a.y === b.y && a.m === b.m) return `${a.d} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
  return `${a.d} ${MONTHS[a.m - 1]} ${a.y} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
}

export function daysUntil(iso: string, today = new Date()): number {
  const { y, m, d } = parts(iso);
  const start = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((start - now) / 86_400_000);
}

/** "today", "tomorrow", "in 14 days", "in 8 months". */
export function formatRelative(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 60) return `in ${days} days`;
  return `in ${Math.round(days / 30)} months`;
}

export const euro = (n: number) => `€${n.toLocaleString("en-GB")}`;
