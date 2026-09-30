// Owner: B (Backend + AI). Free text (<= 300 chars) becomes a moment via the same classifier. Rate-limited.
// Rules: check the session first (401 without one); customer ID only from the session;
// validate every input with zod.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
