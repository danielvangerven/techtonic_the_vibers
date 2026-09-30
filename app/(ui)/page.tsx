"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import MomentCard from "@/components/MomentCard";
import type { MomentView } from "@/lib/types";
import { daysUntil } from "@/lib/format";

const HORIZON_DAYS = 90;

export default function UpcomingPage() {
  const [moments, setMoments] = useState<MomentView[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/timeline");
    if (res.ok) setMoments(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const soon = moments?.filter((v) => daysUntil(v.moment.startDate) <= HORIZON_DAYS) ?? [];
  const later = moments?.filter((v) => daysUntil(v.moment.startDate) > HORIZON_DAYS) ?? [];

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Upcoming</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Moments we found in your <Link href="/calendar" className="text-brand-600 hover:underline">calendar</Link> and
          payments, prepared with what similar customers spent and forgot.
        </p>
      </div>

      <TellKbc onAdded={load} />

      {moments === null ? (
        <p className="mt-10 text-sm text-zinc-500">Loading…</p>
      ) : moments.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center">
          <p className="text-sm text-zinc-700">Nothing coming up that we can prepare for yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Add a trip or a move to your <Link href="/calendar" className="text-brand-600 hover:underline">calendar</Link>, or tell us above.
          </p>
        </div>
      ) : (
        <>
          <Section title="Next 90 days" views={soon} onChanged={load} openFirst />
          <Section title="Later" views={later} onChanged={load} />
        </>
      )}
    </AppShell>
  );
}

function Section({
  title,
  views,
  onChanged,
  openFirst = false,
}: {
  title: string;
  views: MomentView[];
  onChanged: () => void;
  openFirst?: boolean;
}) {
  if (views.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-zinc-500">{title}</h2>
      <div className="mt-3 space-y-3">
        {views.map((v, i) => (
          <MomentCard key={v.moment.id} view={v} defaultOpen={openFirst && i === 0} onChanged={onChanged} />
        ))}
      </div>
    </section>
  );
}

function TellKbc({ onAdded }: { onAdded: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "error" | "done"; message?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus({ kind: "busy" });
    const res = await fetch("/api/tell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus({ kind: "error", message: body.error ?? "Something went wrong" });
      return;
    }
    setText("");
    setStatus({ kind: "done", message: "Added to your upcoming moments." });
    onAdded();
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl">
      <label htmlFor="tell" className="text-sm font-medium text-zinc-900">
        Something coming up that we can&apos;t see?
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="tell"
          value={text}
          maxLength={300}
          onChange={(e) => {
            setText(e.target.value);
            if (status.kind !== "busy") setStatus({ kind: "idle" });
          }}
          placeholder="For example: we're renovating the kitchen in spring"
          className="h-10 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status.kind === "busy" || !text.trim()}
          className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
        >
          {status.kind === "busy" ? "Adding…" : "Tell KBC"}
        </button>
      </div>
      {status.message && (
        <p className={`mt-2 text-sm ${status.kind === "error" ? "text-red-700" : "text-zinc-600"}`}>{status.message}</p>
      )}
    </form>
  );
}
