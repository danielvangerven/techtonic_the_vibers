// Owner: B (Backend + AI). Returns MomentView[] for the session's customer.
// Rules: check the session first (401 without one); customer ID only from the session;
// validate every input with zod.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
