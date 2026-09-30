// Owner: C (Data + peers). Sensitive-entry filter (medical, religious, …).
// Runs in the browser before upload AND on the server as a second line — keep it dependency-free.
export function isSensitive(title: string): boolean {
  void title;
  return false; // TODO
}
