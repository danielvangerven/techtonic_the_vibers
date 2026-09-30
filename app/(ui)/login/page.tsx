"use client";

import { useState } from "react";
import { DEMO_USERS, login } from "@/components/AppShell";

const DESCRIPTIONS: Record<string, string> = {
  thomas: "28, single, Ghent. A trip to Japan, a conference in London and a wedding.",
  lucas: "Family of four, Mechelen. Buying a house and a Christmas trip to the Alps.",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(id: string, pw: string) {
    setBusy(true);
    setError("");
    const failure = await login(id, pw);
    if (failure) {
      setError(failure);
      setBusy(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-[15px] tracking-tight">
          <span className="font-semibold text-brand-700">KBC</span> <span className="text-zinc-600">Ahead</span>
        </p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">Your next months, prepared</h1>
        <p className="mt-2 text-sm text-zinc-600">
          We look at what&apos;s coming up in your calendar and payments, and prepare you with what similar
          customers spent and forgot.
        </p>

        <div className="mt-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Demo customers</p>
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => signIn(u.id, u.password)}
              disabled={busy}
              className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left hover:border-zinc-400 disabled:opacity-60"
            >
              <span className="block text-sm font-medium text-zinc-900">{u.name}</span>
              <span className="mt-0.5 block text-sm text-zinc-500">{DESCRIPTIONS[u.id]}</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn(username, password);
          }}
          className="mt-8 space-y-3 border-t border-zinc-200 pt-6"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Or sign in</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !username || !password}
            className="h-10 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Sign in
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>

        <p className="mt-10 text-xs text-zinc-500">
          All customers and numbers are synthetic. Comparisons use groups of at least 50 people.
        </p>
      </div>
    </main>
  );
}
