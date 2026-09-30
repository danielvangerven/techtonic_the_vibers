// Owner: A (Frontend). "People like you spent €570–770; median €670".
// Must handle peers.ok === false: "Not enough similar customers to compare privately."
import type { PeerStats } from "@/lib/types";

export default function PeerBudgetBar({ peers }: { peers: PeerStats }) {
  if (!peers.ok) {
    return <p className="text-sm text-neutral-500">Not enough similar customers to compare privately.</p>;
  }
  return (
    <p className="text-sm">
      {peers.cohortLabel}: €{peers.p20}–{peers.p80}, median €{peers.median}
    </p>
  );
}
