import { NextResponse } from "next/server";
import { authenticate, unauthorized } from "@/lib/api";
import { getMoments } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";

/** MomentView[] for the logged-in customer, soonest first. */
export async function GET() {
  const auth = await authenticate();
  if (!auth) return unauthorized();

  const moments = await getMoments(auth.customerId);
  return NextResponse.json(moments.map((m) => buildMomentView(auth.customer, m)));
}
