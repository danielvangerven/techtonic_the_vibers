import type { Moment } from "./types";
import { v4 as uuidv4 } from "uuid";

// In-memory store per customerId for demo lifecycle
const store: Record<string, Moment[]> = {
  lotte: [
    {
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
    {
      id: "b8e2d6f1-2a4c-4e9b-8f37-5c1a0e9d7b62",
      type: "wedding_guest",
      startDate: "2027-06-12",
      attrs: { city: "Ghent" },
      sources: [{ kind: "calendar", label: "Calendar entry on 12 Jun" }],
      confidence: 0.90,
    },
  ],
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
  ],
};

export function getMomentsForCustomer(customerId: string): Moment[] {
  return store[customerId] || [];
}

export function addMomentForCustomer(customerId: string, moment: Moment): void {
  if (!store[customerId]) {
    store[customerId] = [];
  }
  store[customerId].unshift(moment);
}

export function deleteMomentForCustomer(customerId: string, momentId: string): boolean {
  if (!store[customerId]) return false;
  const initialLen = store[customerId].length;
  store[customerId] = store[customerId].filter((m) => m.id !== momentId);
  return store[customerId].length < initialLen;
}
