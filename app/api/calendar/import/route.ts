import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { filterSensitiveEvents } from "@/lib/sensitive";
import { classifyTitle } from "@/lib/classify";
import { addMomentForCustomer } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";
import { getPersonas } from "@/lib/data";
import type { Moment } from "@/lib/types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const events = Array.isArray(body.events) ? body.events : [];

    // Server-side second layer of sensitive filtering (defense-in-depth)
    const cleanEvents = filterSensitiveEvents(events);

    const createdMoments: Moment[] = [];
    const personas = getPersonas();
    const customer = personas.find((p) => p.id === session.customerId) || {
      id: session.customerId,
      name: session.name,
      age: 29,
      ageBand: "18-29" as const,
      household: "single" as const,
      region: "Flanders",
      city: "Ghent",
      passwordHash: "",
      products: {},
      transactions: [],
    };

    for (const ev of cleanEvents) {
      const title = ev.title || ev.summary || "";
      const classified = classifyTitle(title);
      if (classified.type !== "none") {
        const moment: Moment = {
          id: crypto.randomUUID(),
          type: classified.type,
          startDate: ev.startDate || "2026-10-14",
          endDate: ev.endDate,
          attrs: { country: classified.country, city: classified.city, nights: classified.nights },
          sources: [{ kind: "calendar", label: `Calendar: "${title}"` }],
          confidence: classified.confidence,
        };
        addMomentForCustomer(session.customerId, moment);
        createdMoments.push(moment);
      }
    }

    const momentViews = createdMoments.map((m) => buildMomentView(customer, m));
    return NextResponse.json({ ok: true, imported: momentViews.length, moments: momentViews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
