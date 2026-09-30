// Owner: A (Frontend). Moment detail: checklist, peer budget bar, "How we know this", Remove button.
export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold">Moment</h1>
      <p className="text-sm text-neutral-500">{id}</p>
      {/* TODO: ChecklistItem list, PeerBudgetBar, HowWeKnow, Remove button */}
    </main>
  );
}
