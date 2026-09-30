"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MomentCard from "@/components/MomentCard";
import type { MomentView } from "@/lib/types";

// Synthetic demo accounts, for one-click switching in the demo.
const DEMO_PASSWORDS: Record<string, string> = { thomas: "tokyo2026", lucas: "mechelen2026" };

export default function TimelinePage() {
  const [moments, setMoments] = useState<MomentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [tellText, setTellText] = useState("");
  const [submittingTell, setSubmittingTell] = useState(false);
  const [importingCal, setImportingCal] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const loadTimeline = async () => {
    try {
      const res = await fetch("/api/timeline");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const me = await fetch("/api/me");
      if (me.ok) setCurrentUser((await me.json()).name);
      if (res.ok) {
        const data = await res.json();
        setMoments(data);
      }
    } catch (err) {
      console.error("Failed to load timeline", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const handleTellKbc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tellText.trim()) return;

    setSubmittingTell(true);
    try {
      const res = await fetch("/api/tell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tellText }),
      });
      if (res.ok) {
        setTellText("");
        await loadTimeline();
      }
    } catch (err) {
      console.error("Failed to tell KBC", err);
    } finally {
      setSubmittingTell(false);
    }
  };

  const handleImportDemoCalendar = async () => {
    setImportingCal(true);
    try {
      const events = [
        { title: "Vacation: Trip to Tokyo & Kyoto 🇯🇵", startDate: "2026-10-14", endDate: "2026-10-28" },
        { title: "Trouw Sophie & Tom, Gent", startDate: "2027-06-12" },
        { title: "Dr. Peeters – oncologie", startDate: "2026-11-05" }, // Dropped
        { title: "Padel met Charlotte", startDate: "2026-10-08" }, // Noise
      ];

      const res = await fetch("/api/calendar/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      if (res.ok) {
        await loadTimeline();
      }
    } catch (err) {
      console.error("Failed to import calendar", err);
    } finally {
      setImportingCal(false);
    }
  };

  const switchUser = async (username: string) => {
    setLoading(true);
    await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: DEMO_PASSWORDS[username] }),
    });
    await loadTimeline();
  };

  return (
    <main className="min-h-screen bg-slate-100 py-6 px-3 sm:px-4 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 flex flex-col">
        {/* App Top Bar */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-sky-200 tracking-tight">KBC</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
                Ahead
              </span>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              Switch Persona 👤
            </Link>
          </div>

          {/* Quick Persona Switcher Bar */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
            <span className="text-sky-200/70 text-[10px] uppercase">Quick Demo:</span>
            <button
              onClick={() => switchUser("thomas")}
              className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/30 transition shrink-0"
            >
              🇯🇵 Thomas (Tokyo)
            </button>
            <button
              onClick={() => switchUser("lucas")}
              className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/30 transition shrink-0"
            >
              🏡 Lucas (House)
            </button>
          </div>

          {/* Account Snapshot */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-sky-200">Hello, {currentUser}</p>
              <p className="text-2xl font-black tracking-tight">€ 3,450.75</p>
            </div>
            <span className="text-[11px] font-semibold text-sky-200 bg-white/10 px-2 py-1 rounded-md">
              KBC Plus Account
            </span>
          </div>
        </div>

        {/* Kate Life-Sync Intelligence Banner */}
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <div>
              <p className="font-bold text-blue-950">Kate Foresight Active</p>
              <p className="text-[11px] text-blue-700">Next 90 days prepared with 2.3M customer insights</p>
            </div>
          </div>
          <button
            onClick={handleImportDemoCalendar}
            disabled={importingCal}
            className="px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg font-bold text-[10px] hover:bg-blue-100 transition shadow-2xs"
          >
            {importingCal ? "Syncing..." : "Sync .ics 📅"}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Tell KBC Zero-Party Input */}
          <form onSubmit={handleTellKbc} className="flex gap-2">
            <input
              type="text"
              value={tellText}
              onChange={(e) => setTellText(e.target.value)}
              placeholder="Tell KBC: 'Renovating kitchen in spring'..."
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              type="submit"
              disabled={submittingTell || !tellText}
              className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
            >
              {submittingTell ? "Adding..." : "+ Tell"}
            </button>
          </form>

          {/* Timeline Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Upcoming Moments ({moments.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">90-Day Outlook</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Loading upcoming life moments...
              </div>
            ) : moments.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No moments detected. Tap <strong>"Sync .ics"</strong> or type in <strong>"Tell KBC"</strong>.
              </div>
            ) : (
              moments.map((view) => (
                <MomentCard key={view.moment.id} view={view} onRefresh={loadTimeline} />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
          KBC Ahead · Team The Vibers · Tectonic Hackathon 2026
        </div>
      </div>
    </main>
  );
}
