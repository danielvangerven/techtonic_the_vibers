// Owner: B (Backend + AI). Calendar entries → moments. Dates come from the event, never from the model.
import { randomUUID } from "node:crypto";
import type { CalendarEvent, Moment } from "../types";
import { classifyTitles, type Classified } from "../classify";
import { isSensitiveEvent } from "../sensitive";
import { findPlace } from "./keywords";
import { daysBetween, isoDate, shortLabel } from "./dates";
import { mergeMoments } from "./merge";

const MAX_EVENTS = 50;
const CONFIDENCE = { ai: 0.9, keywords: 0.7 } as const;

type Classify = (titles: string[]) => Promise<Classified[]>;

export async function detectFromCalendar(
  events: CalendarEvent[],
  today: string,
  classify: Classify = classifyTitles,
): Promise<Moment[]> {
  const usable = events
    .flatMap((e) => {
      const start = isoDate(e.startDate);
      const end = e.endDate ? isoDate(e.endDate) : null;
      // Second line of defence: the browser should already have dropped sensitive entries.
      if (!start || isSensitiveEvent(e.title)) return [];
      return [{ title: e.title, start, end: end && end > start ? end : undefined }];
    })
    .filter((e) => (e.end ?? e.start) >= today)
    .slice(0, MAX_EVENTS);
  if (usable.length === 0) return [];

  const results = await classify(usable.map((e) => e.title));
  const moments: Moment[] = [];
  usable.forEach((e, i) => {
    const result = results[i];
    if (!result || result.type === "none") return;

    const place = findPlace(e.title);
    const country = result.type === "trip_abroad" ? (result.country ?? place?.country) : place?.country;
    if (result.type === "trip_abroad" && country === "BE") return; // not abroad, e.g. the flight home

    const attrs: Moment["attrs"] = {};
    if (country) attrs.country = country;
    if (place?.city && place.country === country) attrs.city = place.city;
    if (result.type === "trip_abroad" && e.end) attrs.nights = daysBetween(e.start, e.end);

    moments.push({
      id: randomUUID(),
      type: result.type,
      startDate: e.start,
      ...(e.end ? { endDate: e.end } : {}),
      attrs,
      // The label never contains the title: titles are not stored.
      sources: [{ kind: "calendar", label: `Calendar entry on ${shortLabel(e.start)}` }],
      confidence: CONFIDENCE[result.via],
    });
  });
  return mergeMoments([], moments, new Set());
}
