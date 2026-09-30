"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERSONAS = [
  {
    id: "thomas",
    name: "Thomas Dubois",
    role: "Young Professional (28)",
    city: "Ghent",
    avatar: "👨‍💻",
    badge: "International Travel",
    headline: "Tokyo & Kyoto Trip 🇯🇵 (14 days) + London Tech Conf",
    signals: "ANA Flight €1,150 + Airbnb €840",
  },
  {
    id: "emma",
    name: "Emma Van de Velde",
    role: "Master Student (24)",
    city: "Leuven",
    avatar: "👩‍🎓",
    badge: "Milestones & Social",
    headline: "25th Birthday Bash 🎂 + Lisbon Trip + Starter Flat",
    signals: "Rooftop deposit €250 + Rock Werchter €315",
  },
  {
    id: "lucas",
    name: "Lucas & Sophie Peeters",
    role: "Senior Family (36)",
    city: "Mechelen",
    avatar: "🏡",
    badge: "Home & Family",
    headline: "Notary Deed Signing ✍️ + Swiss Alps Roadtrip 🇨🇭",
    signals: "Notary escrow deposit €5,000",
  },
  {
    id: "marc",
    name: "Marc Verhoeven",
    role: "SME Managing Director (58)",
    city: "Hasselt",
    avatar: "⛵",
    badge: "Wealth & Corporate",
    headline: "Greek Islands Yacht Charter 🇬🇷 + Granddaughter 1st Birthday",
    signals: "Olympic Yachting charter advance €1,450",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [customUser, setCustomUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (username: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-2">
            <span className="text-2xl font-black tracking-tight text-sky-200">KBC</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">KBC Ahead</h1>
          <p className="text-xs text-sky-100/80 mt-1">
            Your next 90 days, prepared with the experience of 2.3M customers.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Demo Persona (1-Click Login)
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLogin(p.id)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-150 flex items-start space-x-3.5 group cursor-pointer shadow-xs active:scale-98"
                >
                  <span className="text-3xl p-1 bg-slate-50 rounded-xl group-hover:bg-white transition">
                    {p.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-blue-700">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{p.role} · {p.city}</p>
                    <p className="text-[11px] text-slate-600 mt-1 truncate font-medium">
                      {p.headline}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Manual Login */}
          <div className="pt-2 border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customUser) handleLogin(customUser);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customUser}
                onChange={(e) => setCustomUser(e.target.value)}
                placeholder="Or enter name (e.g. lotte, tom)"
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={loading || !customUser}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 disabled:opacity-50 transition"
              >
                Log In
              </button>
            </form>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            🔒 Privacy by Design · Minimum Group Size = 50 · Aikido Security Audited
          </p>
        </div>
      </div>
    </main>
  );
}
