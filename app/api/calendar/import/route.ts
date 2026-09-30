import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { addDetectedMoments } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";
import { getPersonas, type Customer } from "@/lib/data";
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

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send up to 50 events with a title (max 120 chars) and ISO dates" }, { status: 400 });
  }

  try {
    // Titles are used for classification only; they are not stored or logged.
    const detected = await detectFromCalendar(parsed.data.events, todayIso());
    const changed = addDetectedMoments(session.customerId, detected);

    const fallback: Customer = {
      id: session.customerId,
      household: "single",
      ageBand: "18-29",
      region: "Flanders",
      city: "Ghent",
      products: {},
    };
    const customer = getPersonas().find((p) => p.id === session.customerId) ?? fallback;
    const moments = changed.map((m) => buildMomentView(customer, m));
    return NextResponse.json({ ok: true, imported: moments.length, moments });
  } catch (err) {
    console.error("calendar import failed", err instanceof Error ? err.name : "unknown error");
    return NextResponse.json({ error: "Calendar import failed" }, { status: 500 });
  }
}
