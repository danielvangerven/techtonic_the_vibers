import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
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
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length > 300) {
      return NextResponse.json({ error: "Invalid text (max 300 chars)" }, { status: 400 });
    }

    const classified = classifyTitle(text);
    if (classified.type === "none") {
      return NextResponse.json({ error: "Could not detect a life moment from this text" }, { status: 422 });
    }

    const newMoment: Moment = {
      id: crypto.randomUUID(),
      type: classified.type,
      startDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      attrs: { country: classified.country, city: classified.city, nights: classified.nights },
      sources: [{ kind: "told_us", label: `You told KBC: "${text}"` }],
      confidence: classified.confidence,
    };

    addMomentForCustomer(session.customerId, newMoment);

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

    const momentView = buildMomentView(customer, newMoment);
    return NextResponse.json(momentView);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
