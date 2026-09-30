// Owner: B (Backend + AI). Signed session cookie (HS256 JWT via jose). The customer ID in it is
// the only customer ID the API ever trusts.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "kbc_ahead_session";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export interface SessionData {
  customerId: string;
  name: string;
}

// Kept on globalThis so dev hot reloads don't invalidate the random dev secret.
const globals = globalThis as { __kbcDevSecret?: Uint8Array };

function secret(): Uint8Array {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  if (!globals.__kbcDevSecret) {
    globals.__kbcDevSecret = crypto.getRandomValues(new Uint8Array(32));
    console.warn("SESSION_SECRET is not set: using a random dev secret, sessions end when the server restarts");
  }
  return globals.__kbcDevSecret;
}

/** The logged-in customer, or null if there is no valid, unexpired session cookie. */
export async function getSession(): Promise<SessionData | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.name !== "string") return null;
    return { customerId: payload.sub, name: payload.name };
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const token = await new SignJWT({ name: data.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(data.customerId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
