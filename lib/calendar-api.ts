// Owner: B (Backend + AI). Shared validation and response shape for the calendar routes.
import { z } from "zod";
import type { CalendarEntry, CalendarItem, Moment } from "./types";
import { isSensitiveEvent } from "./sensitive";
import { isoDate } from "./detect/dates";

// "2026-10-14" (all day) or "2026-10-14T08:00:00.000Z" (timed).
const DATE_OR_DATETIME = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export const EventInput = z
  .object({
    title: z.string().trim().min(1).max(120),
    startDate: z.string().max(40).regex(DATE_OR_DATETIME),
    endDate: z.string().max(40).regex(DATE_OR_DATETIME).optional(),
  })
  .refine((e) => isoDate(e.startDate) !== null && (!e.endDate || isoDate(e.endDate) !== null), "Invalid date")
  .refine((e) => !e.endDate || e.endDate >= e.startDate, "The end is before the start");

/** Each event with whether it is private and which moment it led to. */
export function toCalendarItems(calendar: CalendarEntry[], moments: Moment[]): CalendarItem[] {
  return calendar.map((e) => {
    const priv = isSensitiveEvent(e.title);
    const day = isoDate(e.startDate);
    const moment = priv
      ? undefined
      : moments.find((m) => m.startDate === day && m.sources.some((s) => s.kind === "calendar"));
    return { ...e, private: priv, ...(moment ? { moment: { id: moment.id, type: moment.type } } : {}) };
  });
}
