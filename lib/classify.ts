// Owner: B (Backend + AI). Classifies short texts (calendar titles) into moment types.
// Gemini first; on any error, timeout or missing config, the keyword classifier. Results are cached
// by a hash of the normalised title, so the titles themselves are never kept.
import { createHash } from "node:crypto";
import type { MomentType } from "./types";
import { findPlace, keywordClassify, normalize, type Detection } from "./detect/keywords";

export type Classified = Detection & { via: "ai" | "keywords" };
export type AiClassifier = (titles: string[]) => Promise<Detection[]>;

const MAX_TITLES = 50;
const MAX_TITLE_LENGTH = 120;
const MAX_CACHE = 5000;
const cache = new Map<string, Classified>();

const hashTitle = (title: string) => createHash("sha256").update(normalize(title)).digest("hex");

async function gemini(titles: string[]): Promise<Detection[]> {
  // Loaded only when used, so keyword-only runs don't need GCP set up.
  const { classifyWithGemini } = await import("./detect/gemini");
  return classifyWithGemini(titles);
}

/** Gemini unless CLASSIFIER=keywords or no GCP project is configured. */
function defaultAi(): AiClassifier | null {
  return process.env.CLASSIFIER !== "keywords" && process.env.GOOGLE_CLOUD_PROJECT ? gemini : null;
}

/** One result per title (max 50 titles, each cut to 120 chars). `ai` can be swapped out in tests. */
export async function classifyTitles(
  titles: string[],
  ai: AiClassifier | null = defaultAi(),
): Promise<Classified[]> {
  const clean = titles.slice(0, MAX_TITLES).map((t) => t.slice(0, MAX_TITLE_LENGTH));
  const keys = clean.map(hashTitle);

  const todo = new Map<string, string>(); // hash → title, uncached and unique
  keys.forEach((key, i) => {
    if (!cache.has(key) && !todo.has(key)) todo.set(key, clean[i]);
  });

  const fallback = new Map<string, Classified>();
  if (todo.size > 0) {
    const pending = [...todo];
    let answers: Detection[] | null = null;
    if (ai) {
      try {
        answers = await ai(pending.map(([, title]) => title));
      } catch (err) {
        // Counts only: titles are personal data and never go to the logs.
        const reason = err instanceof Error ? err.message : "unknown error";
        console.warn(`classify: AI unavailable (${reason}), keywords for ${pending.length} titles`);
      }
    }
    if (cache.size > MAX_CACHE) cache.clear();
    pending.forEach(([key, title], i) => {
      const answer = answers?.[i];
      // Only AI answers are cached, so a Gemini outage doesn't stick after it recovers.
      if (answer) cache.set(key, { ...answer, via: "ai" });
      else fallback.set(key, { ...keywordClassify(title), via: "keywords" });
    });
  }
  return keys.map((key) => cache.get(key) ?? fallback.get(key)!);
}

// ---------------------------------------------------------------------------------------------
// Synchronous keyword classifier for /api/tell (same shape as before).
// Renovation has no MomentType yet, so it maps to "moving" as it did before (open question 2
// in docs/moment-detection.md).

export interface ClassifiedMoment {
  type: MomentType | "none";
  country?: string;
  city?: string;
  nights?: number;
  confidence: number;
}

const RENOVATION = /\b(keuken|renovat\w*|verbouw\w*|kitchen|renovation)\b/;

export function classifyTitle(text: string): ClassifiedMoment {
  const detection = keywordClassify(text);
  if (detection.type === "none") {
    return RENOVATION.test(normalize(text)) ? { type: "moving", confidence: 0.6 } : { type: "none", confidence: 0 };
  }
  return { type: detection.type, country: detection.country, city: findPlace(text)?.city, confidence: 0.7 };
}
