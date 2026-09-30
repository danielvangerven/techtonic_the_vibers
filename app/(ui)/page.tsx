// Owner: A (Frontend). Timeline: "Your next 90 days".
// TODO: swap the mock for fetch("/api/timeline") once B's route works.
import { mockTimeline } from "@/lib/mock";
import MomentCard from "@/components/MomentCard";

export default function TimelinePage() {
  return (
    <main className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Your next 90 days</h1>
      {mockTimeline.map((view) => (
        <MomentCard key={view.moment.id} view={view} />
      ))}
    </main>
  );
}
