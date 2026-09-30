// Owner: B (Backend + AI). Keyword classifier: the fallback when Gemini is unavailable, so the demo
// never depends on it. Dutch, French and English. Matches whole words only ("vol" ≠ "volleybal").
import type { MomentType } from "../types";

export type Detection = { type: MomentType | "none"; country?: string };
export type Place = { city?: string; country: string };

/** Lowercase, strip accents, keep letters and digits separated by single spaces. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Checked in this order on normalised text; the first match wins.
const RULES: [MomentType, RegExp][] = [
  [
    "moving",
    /\b(verhui[sz]\w*|moving|move (?:house|in|out)|movers|demenag\w*|notari\w*|notary|notaire|aankoopakte|deed|sleuteloverdracht|key handover|house purchase|nieuw huis|nieuwe woning)\b/,
  ],
  ["wedding_guest", /\b(trouw\w*|huwelijk\w*|bruiloft|wedding|mariage)\b/],
  [
    "trip_abroad",
    /\b(vlucht\w*|flights?|vols?|vliegtuig|reis naar|trip to|city ?trip|road ?trip|roadtrip|voyage|skivakantie|ski trip)\b/,
  ],
];

const city = (name: string, country: string): Place => ({ city: name, country });

// Keys are normalised (lowercase, no accents). Multi-word keys are fine.
const PLACES: Record<string, Place> = {
  lissabon: city("Lisbon", "PT"), lisbon: city("Lisbon", "PT"), lisbonne: city("Lisbon", "PT"), lisboa: city("Lisbon", "PT"),
  porto: city("Porto", "PT"), faro: city("Faro", "PT"),
  barcelona: city("Barcelona", "ES"), barcelone: city("Barcelona", "ES"), madrid: city("Madrid", "ES"),
  sevilla: city("Seville", "ES"), seville: city("Seville", "ES"), malaga: city("Malaga", "ES"),
  rome: city("Rome", "IT"), roma: city("Rome", "IT"), milaan: city("Milan", "IT"), milan: city("Milan", "IT"),
  milano: city("Milan", "IT"), venetie: city("Venice", "IT"), venice: city("Venice", "IT"), venise: city("Venice", "IT"),
  parijs: city("Paris", "FR"), paris: city("Paris", "FR"), nice: city("Nice", "FR"),
  londen: city("London", "GB"), london: city("London", "GB"), londres: city("London", "GB"),
  amsterdam: city("Amsterdam", "NL"), berlijn: city("Berlin", "DE"), berlin: city("Berlin", "DE"),
  wenen: city("Vienna", "AT"), vienna: city("Vienna", "AT"), wien: city("Vienna", "AT"), vienne: city("Vienna", "AT"),
  praag: city("Prague", "CZ"), prague: city("Prague", "CZ"), praha: city("Prague", "CZ"),
  athene: city("Athens", "GR"), athens: city("Athens", "GR"), athenes: city("Athens", "GR"),
  tokio: city("Tokyo", "JP"), tokyo: city("Tokyo", "JP"), kyoto: city("Kyoto", "JP"), osaka: city("Osaka", "JP"),
  "new york": city("New York", "US"), reykjavik: city("Reykjavik", "IS"),
  interlaken: city("Interlaken", "CH"), zermatt: city("Zermatt", "CH"), jungfrau: city("Interlaken", "CH"),
  zurich: city("Zurich", "CH"), geneve: city("Geneva", "CH"), geneva: city("Geneva", "CH"),
  zwitserland: { country: "CH" }, switzerland: { country: "CH" }, suisse: { country: "CH" }, swiss: { country: "CH" },
  engeland: { country: "GB" }, "united kingdom": { country: "GB" }, "verenigd koninkrijk": { country: "GB" },
  portugal: { country: "PT" }, spanje: { country: "ES" }, espagne: { country: "ES" }, spain: { country: "ES" },
  italie: { country: "IT" }, italy: { country: "IT" }, frankrijk: { country: "FR" }, france: { country: "FR" },
  griekenland: { country: "GR" }, greece: { country: "GR" }, grece: { country: "GR" },
  japan: { country: "JP" }, japon: { country: "JP" },
  ijsland: { country: "IS" }, iceland: { country: "IS" }, islande: { country: "IS" },
  // Belgium: gives the city for weddings and moves, and marks "trips" that are really the flight home.
  gent: city("Ghent", "BE"), ghent: city("Ghent", "BE"), gand: city("Ghent", "BE"),
  antwerpen: city("Antwerp", "BE"), antwerp: city("Antwerp", "BE"), anvers: city("Antwerp", "BE"),
  leuven: city("Leuven", "BE"), louvain: city("Leuven", "BE"),
  brussel: city("Brussels", "BE"), brussels: city("Brussels", "BE"), bruxelles: city("Brussels", "BE"),
  luik: city("Liège", "BE"), liege: city("Liège", "BE"),
  mechelen: city("Mechelen", "BE"), malines: city("Mechelen", "BE"), hasselt: city("Hasselt", "BE"),
  brugge: city("Bruges", "BE"), bruges: city("Bruges", "BE"),
};
const PLACE_KEYS = Object.keys(PLACES).sort((a, b) => b.length - a.length);

/** The first known city or country named in the text. */
export function findPlace(text: string): Place | undefined {
  const padded = ` ${normalize(text)} `;
  const key = PLACE_KEYS.find((k) => padded.includes(` ${k} `));
  return key ? PLACES[key] : undefined;
}

export function keywordClassify(title: string): Detection {
  const text = normalize(title);
  const rule = RULES.find(([, pattern]) => pattern.test(text));
  if (!rule) return { type: "none" };
  const type = rule[0];
  const country = type === "trip_abroad" ? findPlace(title)?.country : undefined;
  return country ? { type, country } : { type };
}
