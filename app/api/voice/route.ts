import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, jsonError, rateLimit, readJson, tooManyRequests, unauthorized } from "@/lib/api";

const Body = z.object({ text: z.string().trim().min(1).max(600) });

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const TIMEOUT_MS = 15_000;

/** Voice briefing: { text } → audio/mpeg from ElevenLabs, or { simulated: true } without an API key. */
export async function POST(req: Request) {
  const auth = await authenticate();
  if (!auth) return unauthorized();
  if (!rateLimit(`voice:${auth.customerId}`, 5, 60_000)) return tooManyRequests();

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Send a text of 1 to 600 characters", 400);
  const { text } = parsed.data;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // The frontend falls back to the browser's speech synthesis.
    return NextResponse.json({ ok: true, simulated: true, text });
  }

  // The voice is fixed on the server; the client can't choose where the request goes.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error("ElevenLabs returned", response.status);
      return jsonError("Voice briefing unavailable", 502);
    }
    return new Response(await response.arrayBuffer(), { headers: { "Content-Type": "audio/mpeg" } });
  } catch (err) {
    console.error("ElevenLabs request failed", err instanceof Error ? err.name : "unknown error");
    return jsonError("Voice briefing unavailable", 502);
  }
}
