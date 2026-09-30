// Owner: C (Data + peers). Peer engine.
// Narrowest cohort (household + age band + region + moment attrs) → drop region → drop age band
// → fewer than 50: { ok: false, reason: "too_few_people" }. Round amounts to €10.
export const MIN_GROUP_SIZE = 50;
