import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { getPersonas } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    const personas = getPersonas();
    const target = personas.find(
      (p) => p.id.toLowerCase() === (username || "").toLowerCase() || p.name.toLowerCase() === (username || "").toLowerCase()
    );

    if (!target) {
      return NextResponse.json({ error: "Invalid credentials. Use 'lotte' or 'tom'." }, { status: 401 });
    }

    await setSession({ customerId: target.id, name: target.name });
    return NextResponse.json({ ok: true, user: { id: target.id, name: target.name } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
