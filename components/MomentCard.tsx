"use client";

import React, { useState } from "react";
import type { MomentView } from "@/lib/types";
import { SmartAlternativesModal } from "./SmartAlternativesModal";

interface Props {
  view: MomentView;
  onRefresh?: () => void;
}

export default function MomentCard({ view, onRefresh }: Props) {
  const { moment, readiness, checks, peers, recommendations } = view;
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState<Record<string, boolean>>({});

  const handleResolveGap = async (e: React.MouseEvent, productId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    setResolving(true);
    try {
      const res = await fetch(`/api/moments/${moment.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setResolvedStatus((prev) => ({ ...prev, [productId]: true }));
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to resolve gap", err);
    } finally {
      setResolving(false);
    }
  };

  const handlePlayVoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingVoice(true);
    try {
      const text = `Hello! For your upcoming ${moment.type === "trip_abroad" ? "trip abroad" : moment.type}, we've prepared your KBC checklist. ${
        peers.ok ? `Customers like you spend around €${peers.median}.` : ""
      }`;
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const contentType = res.headers.get("Content-Type");
        if (contentType && contentType.includes("audio")) {
          const blob = await res.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audio.play();
        } else {
          // Fallback to browser speech synthesis
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error("Voice playback error", err);
    } finally {
      setPlayingVoice(false);
    }
  };

  const isReady = readiness.done === readiness.total;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top Bar: Title & Readiness Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base">
              {moment.type === "trip_abroad" && "✈️ "}
              {moment.type === "moving" && "🏡 "}
              {moment.type === "wedding_guest" && "🎉 "}
              {moment.sources[0]?.label.replace("Calendar: ", "").replace(/'/g, "") || moment.type}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Starts {moment.startDate} {moment.endDate ? `· ${moment.attrs.nights || 7} nights` : ""}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-tight shrink-0 ${
            isReady
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          {isReady ? "100% Ready ✓" : `${readiness.done}/${readiness.total} ready`}
        </span>
      </div>

      {/* Dual-Signal Source Badges */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {moment.sources.map((src, i) => (
          <span
            key={i}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
          >
            {src.kind === "calendar" && "📅 "}
            {src.kind === "transaction" && "💳 "}
            {src.kind === "told_us" && "🗣️ "}
            {src.label}
          </span>
        ))}
      </div>

      {/* Peer Statistics & Crowd Hindsight */}
      {peers.ok && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>📊 Typical peer spend:</span>
            <span className="text-blue-700 font-bold">€{peers.median} median</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Range: €{peers.p20} – €{peers.p80} (based on {peers.n} {peers.cohortLabel})
          </p>
        </div>
      )}

      {/* Checklist & Gaps */}
      <div className="mt-3.5 space-y-2">
        {checks.map((chk) => {
          const isGap = chk.status === "gap" && !resolvedStatus[chk.action?.productId || ""];
          return (
            <div
              key={chk.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                isGap
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-slate-50/50 border-slate-100 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`font-bold ${isGap ? "text-amber-600" : "text-emerald-600"}`}>
                  {isGap ? "⚠️" : "✓"}
                </span>
                <span className="font-medium truncate">{chk.label}</span>
                {chk.peerMissedPct && isGap && (
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                    {chk.peerMissedPct}% forgot
                  </span>
                )}
              </div>

              {isGap && chk.action && (
                <button
                  onClick={(e) => handleResolveGap(e, chk.action?.productId)}
                  disabled={resolving}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition shrink-0 active:scale-95"
                >
                  {resolving ? "Adding..." : chk.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Bar: Kate Voice & Smart Alternatives Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handlePlayVoice}
          disabled={playingVoice}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <span>{playingVoice ? "🔊" : "🎙️"}</span>
          <span>{playingVoice ? "Playing Kate..." : "Listen to Kate"}</span>
        </button>

        <button
          onClick={() => setShowAlternatives(!showAlternatives)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
        >
          {showAlternatives ? "Hide Alternatives ↑" : "💡 KBC Deals & Alternatives ↓"}
        </button>
      </div>

      {/* Expandable Smart Alternatives & KBC Products */}
      {showAlternatives && recommendations && (
        <SmartAlternativesModal
          recommendations={recommendations}
          onActivateProduct={(pid) => handleResolveGap({ preventDefault: () => {}, stopPropagation: () => {} } as any, pid)}
        />
      )}
    </div>
  );
}
