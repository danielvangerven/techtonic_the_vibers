import { NextResponse } from "next/server";
import { authenticate, jsonError, notFound, readJson, unauthorized } from "@/lib/api";
import { deleteEvent, getCalendar, getMoments, updateEvent } from "@/lib/store";
import { EventInput, toCalendarItems } from "@/lib/calendar-api";

type Params = { params: Promise<{ id: string }> };

async function calendarResponse(customerId: string, eventId?: string) {
  const [calendar, moments] = await Promise.all([getCalendar(customerId), getMoments(customerId)]);
  const events = toCalendarItems(calendar, moments);
  return NextResponse.json({ event: events.find((e) => e.id === eventId), events });
}

/** Replace an event { title, startDate, endDate? }; detection runs again. 404 if it isn't yours. */
export async function PUT(req: Request, { params }: Params) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const parsed = EventInput.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid event", 400);

  const { id } = await params;
  if (!(await updateEvent(auth.customerId, id, parsed.data))) return notFound();
  return calendarResponse(auth.customerId, id);
}

/** Delete an event; detection runs again. 404 if it isn't yours. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  if (!(await deleteEvent(auth.customerId, (await params).id))) return notFound();
  return calendarResponse(auth.customerId);
}
