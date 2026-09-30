import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, jsonError, unauthorized } from "@/lib/api";
import { computePeerStats } from "@/lib/peers";
import type { Moment } from "@/lib/types";

const Query = z.object({
  type: z.enum(["trip_abroad", "moving", "wedding_guest"]),
  country: z.string().regex(/^[A-Z]{2}$/).optional(),
});

/**
 * Peer stats for a moment type (and destination) among customers like the logged-in one.
 * Aggregates only, minimum group of 50, e.g. /api/peers?type=trip_abroad&country=IS → refused.
 */
export async function GET(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const params = new URL(req.url).searchParams;
  const parsed = Query.safeParse({ type: params.get("type"), country: params.get("country") ?? undefined });
  if (!parsed.success) return jsonError("Use ?type=trip_abroad|moving|wedding_guest&country=XX", 400);

  const query: Moment = {
    id: "query",
    type: parsed.data.type,
    startDate: "",
    attrs: parsed.data.country ? { country: parsed.data.country } : {},
    sources: [],
    confidence: 1,
  };
  return NextResponse.json(computePeerStats(auth.customer, query).peers);
}
