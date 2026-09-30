// Owner: B (Backend + AI). Shared helpers for API routes: authentication, rate limiting, errors.
import { NextResponse } from "next/server";
import { getSession } from "./session";
import { getCustomer } from "./store";
import type { Persona } from "./data";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export const unauthorized = () => jsonError("Unauthorized", 401);
export const notFound = () => jsonError("Not found", 404);

/**
 * The logged-in customer, with the products they hold. Every route calls this first and answers
 * 401 when it returns null. The customer ID comes only from the signed session cookie.
 */
export async function authenticate(): Promise<{ customerId: string; customer: Persona } | null> {
  const session = await getSession();
  if (!session) return null;
  const customer = await getCustomer(session.customerId);
  return customer ? { customerId: session.customerId, customer } : null;
}

// Fixed-window rate limiter, in memory (one server process is enough for the demo).
const globals = globalThis as { __kbcRateLimits?: Map<string, { count: number; resetAt: number }> };
const hits = (globals.__kbcRateLimits ??= new Map());

/** True if the call is allowed: at most `limit` calls per `windowMs` for this key. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    if (hits.size > 10_000) hits.clear();
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export const tooManyRequests = () => jsonError("Too many requests, try again in a minute", 429);

/** Parses the JSON body; null if it isn't JSON. */
export async function readJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
