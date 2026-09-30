// Owner: A (Frontend). Hard-coded data to build the UI against until /api/timeline works.
// Numbers match the demo script (Lotte's Lisbon trip).
import type { MomentView } from "./types";

export const mockTimeline: MomentView[] = [
  {
    moment: {
      id: "3f0c9a2e-7b1d-4c55-9a51-0d6f2b8e41aa",
      type: "trip_abroad",
      startDate: "2026-10-14",
      endDate: "2026-10-21",
      attrs: { country: "PT", city: "Lisbon", nights: 7 },
      sources: [
        { kind: "calendar", label: "Calendar entry on 14 Oct" },
        { kind: "transaction", label: "TAP Air Portugal payment on 3 Sep" },
      ],
      confidence: 0.95,
    },
    readiness: { done: 3, total: 4 },
    checks: [
      { id: "card_country", label: "Your card works in Portugal", status: "ok" },
      { id: "cancellation_cover", label: "Cancellation cover via your card", status: "ok" },
      {
        id: "medical_cover",
        label: "Medical cover abroad",
        status: "gap",
        peerMissedPct: 30,
        action: { label: "Add travel medical cover, €12", productId: "travel_medical" },
      },
      { id: "trip_budget", label: "Trip budget set", status: "ok", peerMissedPct: 45 },
    ],
    peers: {
      ok: true,
      cohortLabel: "singles aged 18–29 in Flanders",
      n: 214,
      median: 670,
      p20: 570,
      p80: 770,
      unexpectedMedian: 90,
    },
  },
  {
    moment: {
      id: "b8e2d6f1-2a4c-4e9b-8f37-5c1a0e9d7b62",
      type: "wedding_guest",
      startDate: "2027-06-12",
      attrs: { city: "Ghent" },
      sources: [{ kind: "calendar", label: "Calendar entry on 12 Jun" }],
      confidence: 0.9,
    },
    readiness: { done: 0, total: 2 },
    checks: [
      { id: "gift_set_aside", label: "Gift set aside", status: "todo" },
      { id: "travel_outfit_budget", label: "Travel and outfit budget", status: "todo" },
    ],
    // Exercise the refusal state too: the UI must never break on this.
    peers: { ok: false, reason: "too_few_people" },
  },
];
