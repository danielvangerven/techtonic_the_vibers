import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, jsonError, readJson, unauthorized } from "@/lib/api";
import { addDetectedMoments } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";
import { detectFromCalendar, todayIso } from "@/lib/detect";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

// Titles and dates only; any other field (attendees, notes, location) is stripped by zod.
const Body = z.object({
  events: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        startDate: z.string().max(30).regex(ISO_DATE),
        endDate: z.string().max(30).regex(ISO_DATE).optional(),
      }),
    )
    .max(50),
});

/** Upload extra calendar events (already filtered in the browser) → the moments that are new or changed. */
export async function POST(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Send up to 50 events with a title (max 120 chars) and ISO dates", 400);
  }

  try {
    // Titles are used for classification only; they are not stored or logged.
    const detected = await detectFromCalendar(parsed.data.events, todayIso());
    const changed = await addDetectedMoments(auth.customerId, detected);
    const moments = changed.map((m) => buildMomentView(auth.customer, m));
    return NextResponse.json({ ok: true, imported: moments.length, moments });
  } catch (err) {
    console.error("calendar import failed", err instanceof Error ? err.name : "unknown error");
    return jsonError("Calendar import failed", 500);
  }
}
