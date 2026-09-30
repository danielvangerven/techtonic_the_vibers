import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { authenticate, jsonError, rateLimit, readJson, tooManyRequests, unauthorized } from "@/lib/api";
import { classifyTitle, classifyTitles } from "@/lib/classify";
import { addDetectedMoments } from "@/lib/store";
import { buildMomentView } from "@/lib/engine";
import { addDays, shortLabel, todayIso } from "@/lib/detect/dates";
import { findPlace } from "@/lib/detect";
import { isSensitiveEvent } from "@/lib/sensitive";
import type { Moment } from "@/lib/types";

const Body = z.object({ text: z.string().trim().min(1).max(300) });

// Without a date in the text, a told moment is placed a month ahead.
const DEFAULT_DAYS_AHEAD = 30;

/** "Tell KBC": free text (max 300 chars) → a moment, via the same classifier as the calendar. */
export async function POST(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();
  if (!rateLimit(`tell:${auth.customerId}`, 10, 60_000)) return tooManyRequests();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Send a text of 1 to 300 characters", 400);
  const { text } = parsed.data;
  if (isSensitiveEvent(text)) return jsonError("We don't use health or religious information", 422);

  const [result] = await classifyTitles([text]);
  // Renovation has no moment type yet; the keyword classifier maps it to moving.
  const type = result.type !== "none" ? result.type : classifyTitle(text).type;
  if (type === "none") return jsonError("We couldn't find an upcoming moment in that text", 422);

  const today = todayIso();
  const place = findPlace(text);
  const country = type === "trip_abroad" ? (result.country ?? place?.country) : place?.country;
  const attrs: Moment["attrs"] = {};
  if (country) attrs.country = country;
  if (place?.city && place.country === country) attrs.city = place.city;

  const moment: Moment = {
    id: randomUUID(),
    type,
    startDate: addDays(today, DEFAULT_DAYS_AHEAD),
    attrs,
    // The text itself is not stored.
    sources: [{ kind: "told_us", label: `You told KBC on ${shortLabel(today)}` }],
    confidence: result.via === "ai" ? 0.9 : 0.7,
  };
  const changed = await addDetectedMoments(auth.customerId, [moment]);
  return NextResponse.json({ ok: true, moments: changed.map((m) => buildMomentView(auth.customer, m)) });
}
