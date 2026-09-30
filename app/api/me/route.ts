import { NextResponse } from "next/server";
import { authenticate, unauthorized } from "@/lib/api";

/** The logged-in customer: { id, name }, or 401. */
export async function GET() {
  const auth = await authenticate();
  if (!auth) return unauthorized();
  return NextResponse.json({ id: auth.customer.id, name: auth.customer.name });
}
