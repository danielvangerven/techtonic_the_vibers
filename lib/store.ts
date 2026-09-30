import type { Moment } from "./types";

// In-memory store supporting all 4 rich personas with their full multi-event journeys
const store: Record<string, Moment[]> = {
  // =========================================================================
  // PERSONA 1: Thomas (or Lotte) - Young Tech Professional & Global Traveler
  // =========================================================================
  lotte: [
    {
      id: "3f0c9a2e-7b1d-4c55-9a51-0d6f2b8e41aa",
      type: "trip_abroad",
      startDate: "2026-10-14",
      endDate: "2026-10-28",
      attrs: { country: "JP", city: "Tokyo", nights: 14 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Vacation: Trip to Tokyo & Kyoto 🇯🇵'" },
        { kind: "transaction", label: "ANA All Nippon Airways (€1,150) on 3 Sep" },
        { kind: "transaction", label: "Airbnb Kyoto Machiya (€840) on 5 Sep" },
      ],
      confidence: 0.98,
    },
    {
      id: "b8e2d6f1-2a4c-4e9b-8f37-5c1a0e9d7b62",
      type: "wedding_guest",
      startDate: "2027-06-12",
      attrs: { city: "Ghent" },
      sources: [{ kind: "calendar", label: "Calendar: 'Trouw Sophie & Tom, Gent'" }],
      confidence: 0.90,
    },
  ],
  thomas: [
    {
      id: "thomas_evt_1",
      type: "trip_abroad",
      startDate: "2026-10-14",
      endDate: "2026-10-28",
      attrs: { country: "JP", city: "Tokyo", nights: 14 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Vacation: Trip to Tokyo & Kyoto 🇯🇵'" },
        { kind: "transaction", label: "ANA All Nippon Airways flight (€1,150.00)" },
        { kind: "transaction", label: "Airbnb Kyoto Traditional Stay (€840.00)" },
      ],
      confidence: 0.98,
    },
    {
      id: "thomas_evt_5",
      type: "trip_abroad",
      startDate: "2026-11-20",
      endDate: "2026-11-23",
      attrs: { country: "GB", city: "London", nights: 3 },
      sources: [
        { kind: "calendar", label: "Calendar: 'QCon London Tech Conference'" },
        { kind: "transaction", label: "Eurostar Brussels-London (€145.00)" },
      ],
      confidence: 0.95,
    },
    {
      id: "thomas_evt_wedding",
      type: "wedding_guest",
      startDate: "2027-06-12",
      attrs: { city: "Ghent" },
      sources: [{ kind: "calendar", label: "Calendar: 'Trouw Sophie & Tom, Gent'" }],
      confidence: 0.90,
    },
  ],

  // =========================================================================
  // PERSONA 2: Emma - Master Student (25th Birthday & Festivals)
  // =========================================================================
  emma: [
    {
      id: "emma_evt_1",
      type: "wedding_guest", // Celebration / Group Pot template
      startDate: "2026-10-10",
      attrs: { city: "Leuven" },
      sources: [
        { kind: "calendar", label: "Calendar: 'Emma's 25th Milestone Birthday Bash! 🎂'" },
        { kind: "transaction", label: "Rooftop Leuven venue deposit (€250.00)" },
      ],
      confidence: 0.95,
    },
    {
      id: "emma_evt_5",
      type: "trip_abroad",
      startDate: "2026-10-25",
      endDate: "2026-10-29",
      attrs: { country: "PT", city: "Lisbon", nights: 4 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Lisbon Long Weekend 🇵🇹'" },
        { kind: "transaction", label: "Ryanair Charleroi-Lisbon (€89.00)" },
      ],
      confidence: 0.92,
    },
    {
      id: "emma_evt_6",
      type: "moving",
      startDate: "2026-12-15",
      attrs: { city: "Antwerp" },
      sources: [{ kind: "calendar", label: "Calendar: 'Antwerp Starter Flat Handover 🔑'" }],
      confidence: 0.88,
    },
  ],

  // =========================================================================
  // PERSONA 3: Tom (or Lucas) - Couple/Family Moving & Home Purchase
  // =========================================================================
  tom: [
    {
      id: "7c1d8e2f-5a3b-4c91-9e28-1b7f3a9e52cc",
      type: "moving",
      startDate: "2026-12-01",
      attrs: { city: "Leuven" },
      sources: [
        { kind: "transaction", label: "Rental deposit (€2,400) on 15 Sep" },
        { kind: "transaction", label: "Dockx removal van booking on 20 Sep" },
      ],
      confidence: 0.98,
    },
    {
      id: "tom_evt_swiss",
      type: "trip_abroad",
      startDate: "2027-07-10",
      endDate: "2027-07-24",
      attrs: { country: "CH", city: "Interlaken", nights: 14 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Swiss Alps Family Roadtrip 🇨🇭'" },
        { kind: "transaction", label: "Jungfrau Railway Pass (€260.00)" },
      ],
      confidence: 0.94,
    },
  ],
  lucas: [
    {
      id: "lucas_evt_1",
      type: "moving",
      startDate: "2026-10-18",
      attrs: { city: "Mechelen" },
      sources: [
        { kind: "calendar", label: "Calendar: 'Notary Deed Signing: New House Purchase 🏡'" },
        { kind: "transaction", label: "Notaris Van Damme advance deposit (€5,000.00)" },
      ],
      confidence: 0.99,
    },
    {
      id: "lucas_evt_3",
      type: "trip_abroad",
      startDate: "2027-07-10",
      endDate: "2027-07-24",
      attrs: { country: "CH", city: "Interlaken", nights: 14 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Swiss Alps Family Roadtrip 🇨🇭'" },
        { kind: "transaction", label: "Jungfrau Railway Pass (€260.00)" },
      ],
      confidence: 0.94,
    },
  ],

  // =========================================================================
  // PERSONA 4: Marc - SME Business Owner (Greek Yacht & Wealth)
  // =========================================================================
  marc: [
    {
      id: "marc_evt_3",
      type: "trip_abroad",
      startDate: "2027-05-15",
      endDate: "2027-05-25",
      attrs: { country: "GR", city: "Athens", nights: 10 },
      sources: [
        { kind: "calendar", label: "Calendar: 'Greek Islands Yacht Charter 🇬🇷⛵'" },
        { kind: "transaction", label: "Olympic Yachting charter advance (€1,450.00)" },
      ],
      confidence: 0.95,
    },
    {
      id: "marc_evt_4",
      type: "wedding_guest",
      startDate: "2026-10-16",
      attrs: { city: "Genk" },
      sources: [{ kind: "calendar", label: "Calendar: 'Granddaughter Julie 1st Birthday 🎀'" }],
      confidence: 0.90,
    },
  ],
};

export function getMomentsForCustomer(customerId: string): Moment[] {
  const id = (customerId || "").toLowerCase();
  return store[id] || store["thomas"] || store["lotte"] || [];
}

export function addMomentForCustomer(customerId: string, moment: Moment): void {
  const id = (customerId || "").toLowerCase();
  if (!store[id]) {
    store[id] = [];
  }
  store[id].unshift(moment);
}

export function deleteMomentForCustomer(customerId: string, momentId: string): boolean {
  const id = (customerId || "").toLowerCase();
  if (!store[id]) return false;
  const initialLen = store[id].length;
  store[id] = store[id].filter((m) => m.id !== momentId);
  return store[id].length < initialLen;
}
