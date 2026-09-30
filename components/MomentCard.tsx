// Owner: A (Frontend). One moment on the timeline, with "3/4 ready".
import Link from "next/link";
import type { MomentView } from "@/lib/types";

export default function MomentCard({ view }: { view: MomentView }) {
  const { moment, readiness } = view;
  return (
    <Link href={`/moments/${moment.id}`} className="block rounded-xl border p-4">
      <div className="font-medium">{moment.type}</div>
      <div className="text-sm text-neutral-500">
        {moment.startDate} · {readiness.done}/{readiness.total} ready
      </div>
    </Link>
  );
}
