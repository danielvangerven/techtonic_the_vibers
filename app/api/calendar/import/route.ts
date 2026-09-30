// Owner: B (Backend + AI). Already-filtered events (title <= 120 chars, max 50). Titles are not stored.
// Rules: check the session first (401 without one); customer ID only from the session;
// validate every input with zod.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
