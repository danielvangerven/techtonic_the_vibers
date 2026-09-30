import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, jsonError, readJson, unauthorized } from "@/lib/api";
import { addEvents, getCalendar, getMoments } from "@/lib/store";
import { EventInput, toCalendarItems } from "@/lib/calendar-api";

// Titles and dates only; any other field (attendees, notes, location) is stripped by zod.
const Body = z.object({ events: z.array(EventInput).min(1).max(50) });

/** Import events (e.g. from an .ics file, filtered in the browser) into the calendar. */
export async function POST(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Send 1 to 50 events with a title (max 120 chars) and ISO dates", 400);
  }

  const added = await addEvents(auth.customerId, parsed.data.events);
  if (!added) return jsonError("Your calendar is full", 409);
  const [calendar, moments] = await Promise.all([getCalendar(auth.customerId), getMoments(auth.customerId)]);
  return NextResponse.json({ ok: true, imported: added.length, events: toCalendarItems(calendar, moments) });
}
