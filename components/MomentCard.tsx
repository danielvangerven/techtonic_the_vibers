"use client";

import { useState } from "react";
import type { Check, KbcProductRecommendation, MomentView, PeerStats } from "@/lib/types";
import { MOMENT_KIND, daysUntil, euro, formatDateRange, formatRelative, momentTitle } from "@/lib/format";
import {
  AlertIcon,
  CalendarIcon,
  CardIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  MessageIcon,
  SpeakerIcon,
} from "./icons";

interface Props {
  view: MomentView;
  defaultOpen?: boolean;
  onChanged: () => void;
}

export default function MomentCard({ view, defaultOpen = false, onChanged }: Props) {
  const { moment, readiness, checks, peers, recommendations } = view;
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState<string | null>(null);

  const title = momentTitle(moment);
  const days = daysUntil(moment.startDate);
  const nights = moment.attrs.nights;
  const ready = readiness.done === readiness.total;

  async function activate(productId: string) {
    setBusy(productId);
    await fetch(`/api/moments/${moment.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setBusy(null);
    onChanged();
  }

  async function remove() {
    setBusy("remove");
    await fetch(`/api/moments/${moment.id}`, { method: "DELETE" });
    onChanged();
  }

  async function listen() {
    setBusy("voice");
    const gaps = checks.filter((c) => c.status !== "ok").map((c) => c.label.toLowerCase());
    const text =
      `${title}, ${formatRelative(days)}. You're ${readiness.done} of ${readiness.total} ready.` +
      (gaps.length ? ` Still open: ${gaps.join(", ")}.` : "") +
      (peers.ok ? ` People like you spent around ${peers.median} euros.` : "");
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.headers.get("Content-Type")?.includes("audio")) {
        await new Audio(URL.createObjectURL(await res.blob())).play();
      } else {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-6 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-500">{MOMENT_KIND[moment.type]}</p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-zinc-900">{title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            {formatDateRange(moment.startDate, moment.endDate)}
            {nights ? ` · ${nights} nights` : ""} · {formatRelative(days)}
          </p>
        </div>
        <Readiness done={readiness.done} total={readiness.total} ready={ready} />
        <ChevronDownIcon className={`size-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
          <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Checklist</h4>
              <ul className="mt-2 divide-y divide-zinc-100">
                {checks.map((check) => (
                  <CheckRow key={check.id} check={check} busy={busy} onActivate={activate} />
                ))}
              </ul>
            </section>
            <aside className="space-y-6">
              <PeerSummary peers={peers} type={moment.type} />
              <section>
                <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">How we know</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-zinc-600">
                  {moment.sources.map((s) => (
                    <li key={s.kind + s.label} className="flex items-start gap-2">
                      {s.kind === "calendar" && <CalendarIcon className="mt-0.5 size-4 shrink-0 text-zinc-400" />}
                      {s.kind === "transaction" && <CardIcon className="mt-0.5 size-4 shrink-0 text-zinc-400" />}
                      {s.kind === "told_us" && <MessageIcon className="mt-0.5 size-4 shrink-0 text-zinc-400" />}
                      <span>{s.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          {recommendations && (recommendations.bestProduct || recommendations.alternatives.length > 0) && (
            <section className="mt-6 border-t border-zinc-100 pt-5">
              <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">Suggested for this moment</h4>
              <div className="mt-3 space-y-3">
                {[recommendations.bestProduct, recommendations.secondaryProduct]
                  .filter((p): p is KbcProductRecommendation => !!p)
                  .map((p, i) => (
                    <ProductRow key={p.productId} product={p} primary={i === 0} busy={busy} onActivate={activate} />
                  ))}
              </div>
              {recommendations.alternatives.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {recommendations.alternatives.map((alt) => (
                    <li key={alt.id} className="text-sm">
                      <p className="font-medium text-zinc-900">
                        {alt.title}
                        {alt.estimatedSavings && <span className="ml-2 font-normal text-emerald-700">{alt.estimatedSavings}</span>}
                      </p>
                      <p className="mt-0.5 text-zinc-600">{alt.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <footer className="mt-6 flex items-center gap-5 border-t border-zinc-100 pt-4 text-sm">
            <button
              onClick={listen}
              disabled={busy === "voice"}
              className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
            >
              <SpeakerIcon className="size-4" />
              {busy === "voice" ? "Playing…" : "Listen to briefing"}
            </button>
            <button onClick={remove} disabled={busy === "remove"} className="ml-auto text-zinc-500 hover:text-red-700">
              Not relevant, remove
            </button>
          </footer>
        </div>
      )}
    </article>
  );
}

function Readiness({ done, total, ready }: { done: number; total: number; ready: boolean }) {
  return (
    <div className="hidden w-28 shrink-0 sm:block">
      <p className={`text-right text-sm ${ready ? "text-emerald-700" : "text-zinc-700"}`}>
        {ready ? "Ready" : `${done} of ${total} ready`}
      </p>
      <div className="mt-1.5 flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < done ? (ready ? "bg-emerald-600" : "bg-brand-600") : "bg-zinc-200"}`} />
        ))}
      </div>
    </div>
  );
}

function CheckRow({ check, busy, onActivate }: { check: Check; busy: string | null; onActivate: (id: string) => void }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      {check.status === "ok" && <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
      {check.status === "gap" && <AlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />}
      {check.status === "todo" && <CircleIcon className="mt-0.5 size-4 shrink-0 text-zinc-300" />}
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${check.status === "ok" ? "text-zinc-600" : "text-zinc-900"}`}>{check.label}</p>
        {check.status !== "ok" && check.peerMissedPct ? (
          <p className="mt-0.5 text-xs text-zinc-500">{check.peerMissedPct}% of people like you forgot this</p>
        ) : null}
      </div>
      {check.status !== "ok" && check.action && (
        <button
          onClick={() => onActivate(check.action!.productId)}
          disabled={busy !== null}
          className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
        >
          {busy === check.action.productId ? "Adding…" : check.action.label}
        </button>
      )}
    </li>
  );
}

function PeerSummary({ peers, type }: { peers: PeerStats; type: MomentView["moment"]["type"] }) {
  const what = type === "trip_abroad" ? "spent on a trip like this" : type === "moving" ? "spent extra in the first 3 months" : "gave as a gift";
  if (!peers.ok) {
    return (
      <section>
        <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">People like you</h4>
        <p className="mt-2 text-sm text-zinc-600">Not enough similar customers to compare privately.</p>
      </section>
    );
  }
  // Scale the bar so the 20th–80th percentile band sits in the middle.
  const min = peers.p20 * 0.6;
  const max = peers.p80 * 1.3;
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <section>
      <h4 className="text-xs font-medium uppercase tracking-wide text-zinc-500">People like you</h4>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{euro(peers.median)}</p>
      <p className="text-sm text-zinc-600">typically {what}</p>
      <div className="relative mt-3 h-1.5 rounded-full bg-zinc-100">
        <div className="absolute inset-y-0 rounded-full bg-brand-200" style={{ left: pos(peers.p20), right: `calc(100% - ${pos(peers.p80)})` }} />
        <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-brand-700" style={{ left: pos(peers.median) }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
        <span>{euro(peers.p20)}</span>
        <span>{euro(peers.p80)}</span>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Middle 60% of {peers.n} {peers.cohortLabel}
        {peers.unexpectedMedian ? `. Unexpected costs: about ${euro(peers.unexpectedMedian)}.` : "."}
      </p>
    </section>
  );
}

function ProductRow({
  product,
  primary,
  busy,
  onActivate,
}: {
  product: KbcProductRecommendation;
  primary: boolean;
  busy: string | null;
  onActivate: (id: string) => void;
}) {
  return (
    <div className={`flex items-start gap-4 rounded-lg p-4 ${primary ? "bg-brand-50" : "border border-zinc-200"}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">
          {product.name}
          {product.priceOrRate && <span className="ml-2 font-normal text-zinc-500">{product.priceOrRate}</span>}
        </p>
        <p className="mt-0.5 text-sm text-zinc-600">{product.reason}</p>
      </div>
      <button
        onClick={() => onActivate(product.productId)}
        disabled={busy !== null}
        className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
          primary ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50"
        }`}
      >
        {busy === product.productId ? "Activating…" : "Activate"}
      </button>
    </div>
  );
}
