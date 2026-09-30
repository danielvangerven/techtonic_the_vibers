"use client";

import { useState } from "react";
import type { AdviceItem, MomentView } from "@/lib/types";
import { MOMENT_KIND, daysUntil, euro, formatDateRange, formatRelative, momentTitle } from "@/lib/format";
import { AlertIcon, CheckIcon, ChevronDownIcon, CircleIcon } from "./icons";

interface Props {
  view: MomentView;
  defaultOpen?: boolean;
  onChanged: () => void;
}

// "KBC Global Travel Assistance (Wereldwijde Reisbijstand)" → "KBC Global Travel Assistance"
const shortName = (name: string) => name.replace(/\s*\(.*\)\s*/, "").replace(/^Kate Deals: /, "");

function AdviceRow({ item, busy, onAction }: { item: AdviceItem; busy: boolean; onAction: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left text-sm text-zinc-900 hover:text-brand-700">
          {item.title}
          {item.savings && <span className="ml-2 text-emerald-700">{item.savings}</span>}
        </button>
        {item.action && (
          <button
            onClick={() => onAction(item.action!.target)}
            disabled={busy}
            className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
          >
            {item.action.label.length > 22 ? "Do it" : item.action.label}
          </button>
        )}
      </div>
      {open && <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>}
    </li>
  );
}

export default function MomentCard({ view, defaultOpen = false, onChanged }: Props) {
  const { moment, readiness, checks, peers, recommendations } = view;
  const [open, setOpen] = useState(defaultOpen);
  const [why, setWhy] = useState(false);
  const [busy, setBusy] = useState(false);

  const ready = readiness.done === readiness.total;
  const advice = recommendations?.bestProduct;
  const gap = checks.find((c) => c.status === "gap");

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
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm ${ready ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700"}`}>
          {ready ? "Ready" : `${readiness.done}/${readiness.total} ready`}
        </span>
        <ChevronDownIcon className={`size-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-6 pb-6">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  {c.status === "ok" && <CheckIcon className="size-4 shrink-0 text-emerald-600" />}
                  {c.status === "gap" && <AlertIcon className="size-4 shrink-0 text-amber-600" />}
                  {c.status === "todo" && <CircleIcon className="size-4 shrink-0 text-zinc-300" />}
                  <span className={c.status === "ok" ? "text-zinc-500" : "text-zinc-900"}>{c.label}</span>
                </li>
              ))}
            </ul>
            {peers.ok && (
              <div className="sm:text-right">
                <p className="text-2xl font-semibold tracking-tight text-zinc-900">{euro(peers.median)}</p>
                <p className="text-xs text-zinc-500">spent by people like you</p>
              </div>
            )}
          </div>

          {advice && (
            <div className="mt-5 flex items-center gap-4 rounded-xl bg-brand-50 px-4 py-3">
              <p className="min-w-0 flex-1 font-medium text-zinc-900">{shortName(advice.name)}</p>
              <button
                onClick={() => activate(advice.productId)}
                disabled={busy}
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {busy ? "Adding…" : advice.priceOrRate?.startsWith("€") ? `Add · ${advice.priceOrRate.split(" ")[0]}` : "Add"}
              </button>
            </div>
          )}

          {recommendations && recommendations.advice.length > 0 && (
            <section className="mt-6">
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Our advice</h4>
              <ul className="mt-2 divide-y divide-zinc-100">
                {recommendations.advice.map((a) => (
                  <AdviceRow key={a.id} item={a} busy={busy} onAction={activate} />
                ))}
              </ul>
            </section>
          )}

          {why && (
            <div className="mt-4 space-y-1.5 text-sm text-zinc-600">
              {gap?.peerMissedPct ? <p>{gap.peerMissedPct}% of people like you forgot {gap.label.toLowerCase()}.</p> : null}
              {advice && <p>{advice.reason}</p>}
              {peers.ok && (
                <p>
                  Most spent {euro(peers.p20)}–{euro(peers.p80)} ({peers.n} {peers.cohortLabel}).
                </p>
              )}
              <p className="text-zinc-500">Found via: {moment.sources.map((s) => s.label).join(" · ")}</p>
            </div>
          )}

          <div className="mt-4 flex justify-between text-xs text-zinc-400">
            <button onClick={() => setWhy(!why)} className="hover:text-zinc-700">
              {why ? "Less" : "Why?"}
            </button>
            <button onClick={remove} className="hover:text-zinc-700">
              Not relevant
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
