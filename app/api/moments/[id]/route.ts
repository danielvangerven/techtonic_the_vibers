// Owner: B (Backend + AI). Remove / that's wrong. 404 unless the moment belongs to the session's customer.
// Rules: check the session first (401 without one); customer ID only from the session;
// validate every input with zod.
import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
