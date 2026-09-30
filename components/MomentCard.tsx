"use client";

import { useState } from "react";
import type { MomentView } from "@/lib/types";
import { MOMENT_KIND, daysUntil, euro, formatDateRange, formatRelative, momentTitle } from "@/lib/format";
import { CheckIcon, ChevronDownIcon } from "./icons";

interface Props {
  view: MomentView;
  defaultOpen?: boolean;
  onChanged: () => void;
}

// "KBC Global Travel Assistance (Wereldwijde Reisbijstand)" → "KBC Global Travel Assistance"
const shortName = (name: string) => name.replace(/\s*\(.*\)\s*/, "").replace(/^Kate Deals: /, "");
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

export default function MomentCard({ view, defaultOpen = false, onChanged }: Props) {
  const { moment, readiness, checks, peers, recommendations } = view;
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);

  const ready = readiness.done === readiness.total;
  const advice = recommendations?.bestProduct;
  // The open check the advice closes, for the "X% of people like you forgot this" line.
  const gap = checks.find((c) => c.status === "gap") ?? checks.find((c) => c.status === "todo");

  async function activate(productId: string) {
    setBusy(true);
    await fetch(`/api/moments/${moment.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setBusy(false);
    onChanged();
  }

  async function remove() {
    await fetch(`/api/moments/${moment.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-6 px-6 py-5 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500">
            {MOMENT_KIND[moment.type]} · {formatRelative(daysUntil(moment.startDate))}
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-zinc-900">{momentTitle(moment)}</h3>
          <p className="text-sm text-zinc-500">{formatDateRange(moment.startDate, moment.endDate)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm ${
            ready ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          {ready ? "Ready" : `${readiness.done}/${readiness.total} ready`}
        </span>
        <ChevronDownIcon className={`size-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 px-6 pb-6">
          {peers.ok && (
            <p className="text-sm text-zinc-600">
              People like you spent <span className="font-semibold text-zinc-900">{euro(peers.median)}</span> on this.
            </p>
          )}

          {advice ? (
            <div className="flex items-center gap-4 rounded-xl bg-brand-50 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{shortName(advice.name)}</p>
                <p className="mt-0.5 text-sm text-zinc-600">
                  {gap?.peerMissedPct ? `${gap.peerMissedPct}% of people like you forgot this. ` : ""}
                  {firstSentence(advice.reason)}
                </p>
              </div>
              <button
                onClick={() => activate(advice.productId)}
                disabled={busy}
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busy ? "Adding…" : advice.priceOrRate?.startsWith("€") ? `Add · ${advice.priceOrRate.split(" ")[0]}` : "Add"}
              </button>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckIcon /> You&apos;re covered for this.
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Found in your {sourceSummary(moment.sources)}</span>
            <button onClick={remove} className="hover:text-zinc-700">
              Not relevant
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function sourceSummary(sources: MomentView["moment"]["sources"]) {
  const kinds = new Set(sources.map((s) => s.kind));
  const parts = [kinds.has("calendar") && "calendar", kinds.has("transaction") && "payments", kinds.has("told_us") && "message"];
  return parts.filter(Boolean).join(" and ");
}
