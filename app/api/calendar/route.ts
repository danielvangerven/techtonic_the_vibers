import { NextResponse } from "next/server";
import { authenticate, jsonError, readJson, unauthorized } from "@/lib/api";
import { addEvents, getCalendar, getMoments } from "@/lib/store";
import { EventInput, toCalendarItems } from "@/lib/calendar-api";

/** The logged-in customer's calendar: { events: CalendarItem[] }. */
export async function GET() {
  const auth = await authenticate();
  if (!auth) return unauthorized();
  const [calendar, moments] = await Promise.all([getCalendar(auth.customerId), getMoments(auth.customerId)]);
  return NextResponse.json({ events: toCalendarItems(calendar, moments) });
}

/** Add an event { title, startDate, endDate? }; detection runs again. */
export async function POST(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const parsed = EventInput.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid event", 400);

  const added = await addEvents(auth.customerId, [parsed.data]);
  if (!added) return jsonError("Your calendar is full", 409);
  const [calendar, moments] = await Promise.all([getCalendar(auth.customerId), getMoments(auth.customerId)]);
  const events = toCalendarItems(calendar, moments);
  return NextResponse.json({ event: events.find((e) => e.id === added[0].id), events }, { status: 201 });
}
