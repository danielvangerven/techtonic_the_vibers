import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPersonas } from "@/lib/data";
import { computePeerStats } from "@/lib/peers";
import type { Moment } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "trip_abroad";
  const country = searchParams.get("country") || "PT";

  const personas = getPersonas();
  const customer = personas.find((p) => p.id === session.customerId) || {
    id: session.customerId,
    household: "single" as const,
    ageBand: "18-29" as const,
    region: "Flanders",
  };

  const dummyMoment: Moment = {
    id: "query",
    type: type as any,
    startDate: "2026-10-14",
    attrs: { country },
    sources: [],
    confidence: 1,
  };

  const { peers } = computePeerStats(customer as any, dummyMoment);
  return NextResponse.json(peers);
}
