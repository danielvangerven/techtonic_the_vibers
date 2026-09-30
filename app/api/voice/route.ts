import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json(); // Default Rachel/Kate voice
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // If ElevenLabs API Key is present, call the ElevenLabs TTS API
    if (apiKey) {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `ElevenLabs error: ${errText}` }, { status: 502 });
      }

      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
    }

    // Fallback if no API key provided during local dev
    return NextResponse.json({
      ok: true,
      simulated: true,
      message: "ElevenLabs API key not configured. Falling back to browser speech synthesis.",
      text,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
