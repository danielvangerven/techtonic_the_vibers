"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { formatDateRange } from "@/lib/format";

interface Row {
  date: string;
  merchant: string;
  description?: string;
  amount: number;
  category?: string;
  moment?: { id: string; title: string };
}

const eur = (n: number) =>
  `−€${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (c?: string) => (c ? c.replace(/_/g, " ").replace(/^\w/, (x) => x.toUpperCase()) : "");

export default function TransactionsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch("/api/transactions").then(async (res) => res.ok && setRows((await res.json()).transactions));
  }, []);

  const linked = rows?.filter((r) => r.moment).length ?? 0;

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Transactions</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Recent payments from your account.{" "}
        {rows && linked > 0 && `${linked} of them point to something coming up.`}
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {rows === null ? (
          <p className="px-5 py-6 text-sm text-zinc-500">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Description</th>
                <th className="hidden px-5 py-2.5 font-medium sm:table-cell">Linked moment</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="whitespace-nowrap px-5 py-3 text-zinc-500">{formatDateRange(r.date)}</td>
                  <td className="px-5 py-3">
                    <p className="text-zinc-900">{r.merchant}</p>
                    <p className="text-xs text-zinc-500">{r.description ?? label(r.category)}</p>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    {r.moment ? (
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-900">{r.moment.title}</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-zinc-900">{eur(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
