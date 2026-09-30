"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Synthetic demo accounts, so the demo can switch between the two customers in one click.
export const DEMO_USERS = [
  { id: "thomas", name: "Thomas Dubois", password: "tokyo2026" },
  { id: "lucas", name: "Lucas & Sophie Peeters", password: "mechelen2026" },
];

const NAV = [
  { href: "/", label: "Upcoming" },
  { href: "/calendar", label: "Calendar" },
];

export async function login(id: string, password: string): Promise<string | null> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: id, password }),
  });
  if (res.ok) return null;
  return (await res.json().catch(() => null))?.error ?? "Login failed";
}

export default function AppShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const pathname = usePathname();
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.status === 401) window.location.href = "/login";
      else if (res.ok) setMe(await res.json());
    });
  }, []);

  const other = DEMO_USERS.find((u) => u.id !== me?.id);

  async function switchUser() {
    if (!other) return;
    if (!(await login(other.id, other.password))) window.location.reload();
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className={`mx-auto flex h-14 items-center gap-8 px-4 sm:px-6 ${wide ? "max-w-7xl" : "max-w-4xl"}`}>
          <Link href="/" className="text-[15px] tracking-tight">
            <span className="font-semibold text-brand-700">KBC</span> <span className="text-zinc-600">Ahead</span>
          </Link>
          <nav className="flex h-full gap-6 text-sm">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center border-b-2 ${
                    active ? "border-brand-600 font-medium text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {me && (
              <>
                <span className="hidden text-zinc-900 sm:inline">{me.name}</span>
                {other && (
                  <button onClick={switchUser} className="text-zinc-500 hover:text-zinc-900">
                    Switch to {other.name.split(" ")[0]}
                  </button>
                )}
                <button onClick={logout} className="text-zinc-500 hover:text-zinc-900">
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 sm:px-6 ${wide ? "max-w-7xl" : "max-w-4xl"}`}>{children}</main>
    </div>
  );
}
