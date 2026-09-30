import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clearSession, setSession } from "@/lib/session";
import { findPersona } from "@/lib/data";
import { resetCustomer } from "@/lib/store";
import { clientIp, jsonError, rateLimit, readJson, tooManyRequests } from "@/lib/api";

const Body = z.object({
  username: z.string().trim().toLowerCase().min(1).max(50),
  password: z.string().min(1).max(100),
});

// Compared against when the username doesn't exist, so both cases take the same time.
const DUMMY_HASH = "$2b$10$cWGO7W5xjx7s8HCcOls9X.lourNy/RIY/kWF9wHoxvuenaqpRWizW";

/** Log in: { username, password } → session cookie. */
export async function POST(req: Request) {
  if (!rateLimit(`login-ip:${clientIp(req)}`, 10, 60_000)) return tooManyRequests();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Username and password are required", 400);
  const { username, password } = parsed.data;
  if (!rateLimit(`login-user:${username}`, 5, 60_000)) return tooManyRequests();

  const persona = findPersona(username);
  const valid = await bcrypt.compare(password, persona?.passwordHash ?? DUMMY_HASH);
  if (!persona || !valid) return jsonError("Invalid username or password", 401);

  resetCustomer(persona.id); // each login starts the demo fresh
  await setSession({ customerId: persona.id, name: persona.name });
  return NextResponse.json({ ok: true, user: { id: persona.id, name: persona.name } });
}

/** Log out. */
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
