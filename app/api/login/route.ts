// Owner: B (Backend + AI). Demo login: bcrypt check, sets signed httpOnly SameSite=Lax cookie. Rate-limited.
// Rules: check the session first (401 without one); customer ID only from the session;
// validate every input with zod.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
