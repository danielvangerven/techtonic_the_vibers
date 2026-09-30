"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, LockIcon, PlusIcon } from "@/components/icons";
import type { CalendarItem } from "@/lib/types";
import { MOMENT_KIND } from "@/lib/format";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const isAllDay = (iso: string) => iso.length === 10;

/** The local days an event covers (all-day end dates are inclusive). */
function eventDays(e: CalendarItem): [string, string] {
  const start = isAllDay(e.startDate) ? e.startDate : dayKey(new Date(e.startDate));
  const endIso = e.endDate ?? e.startDate;
  const end = isAllDay(endIso) ? endIso : dayKey(new Date(endIso));
  return [start, end < start ? start : end];
}

function timeLabel(iso: string) {
  if (isAllDay(iso)) return "";
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Draft {
  id?: string;
  title: string;
  allDay: boolean;
  startDay: string;
  startTime: string;
  endDay: string;
  endTime: string;
  item?: CalendarItem;
}

function draftFrom(item: CalendarItem): Draft {
  const [startDay, endDay] = eventDays(item);
  return {
    id: item.id,
    title: item.title,
    allDay: isAllDay(item.startDate),
    startDay,
    endDay,
    startTime: timeLabel(item.startDate) || "09:00",
    endTime: timeLabel(item.endDate ?? item.startDate) || "10:00",
    item,
  };
}

function toPayload(d: Draft) {
  if (d.allDay) return { title: d.title, startDate: d.startDay, endDate: d.endDay };
  return {
    title: d.title,
    startDate: new Date(`${d.startDay}T${d.startTime}`).toISOString(),
    endDate: new Date(`${d.endDay}T${d.endTime}`).toISOString(),
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/calendar");
    if (res.ok) setEvents((await res.json()).events);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // 6-week grid starting on the Monday before the 1st.
  const days = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const first = addDays(month, -offset);
    return Array.from({ length: 42 }, (_, i) => addDays(first, i));
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const e of events) {
      const [start, end] = eventDays(e);
      for (let d = new Date(`${start}T00:00`); dayKey(d) <= end; d = addDays(d, 1)) {
        const k = dayKey(d);
        map.set(k, [...(map.get(k) ?? []), e]);
      }
    }
    return map;
  }, [events]);

  const today = dayKey(new Date());

  function newEvent(day: string) {
    setDraft({ title: "", allDay: false, startDay: day, endDay: day, startTime: "09:00", endTime: "10:00" });
  }

  async function save(d: Draft) {
    const res = await fetch(d.id ? `/api/calendar/${d.id}` : "/api/calendar", {
      method: d.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(d)),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return body.error ?? "Could not save";
    setEvents(body.events);
    setDraft(null);
    const moment = body.event?.moment;
    setNotice(
      moment && !d.item?.moment
        ? `We found a new moment in this event (${MOMENT_KIND[moment.type as keyof typeof MOMENT_KIND].toLowerCase()}). It's on your Upcoming page.`
        : "",
    );
    return null;
  }

  async function remove(id: string) {
    const res = await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    if (res.ok) setEvents((await res.json()).events);
    setDraft(null);
    setNotice("");
  }

  const monthLabel = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <AppShell wide>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-4 text-2xl font-semibold tracking-tight text-zinc-900">{monthLabel}</h1>
        <button
          onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
          className="h-9 rounded-lg border border-zinc-300 px-3 text-sm hover:bg-zinc-100"
        >
          Today
        </button>
        <div className="flex">
          <button
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="grid size-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100"
          >
            <ChevronLeftIcon />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="grid size-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100"
          >
            <ChevronRightIcon />
          </button>
        </div>
        <button
          onClick={() => newEvent(today)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <PlusIcon /> New event
        </button>
      </div>

      {notice && <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">{notice}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-7 border-b border-zinc-200">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-xs font-medium text-zinc-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const k = dayKey(d);
            const inMonth = d.getMonth() === month.getMonth();
            const items = byDay.get(k) ?? [];
            return (
              <div
                key={k}
                onClick={() => newEvent(k)}
                className={`min-h-28 cursor-pointer border-zinc-100 p-1.5 hover:bg-zinc-50 ${i % 7 ? "border-l" : ""} ${
                  i >= 7 ? "border-t" : ""
                } ${inMonth ? "" : "bg-zinc-50/60"}`}
              >
                <span
                  className={`inline-grid size-6 place-items-center rounded-full text-xs ${
                    k === today ? "bg-brand-600 font-medium text-white" : inMonth ? "text-zinc-700" : "text-zinc-400"
                  }`}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {items.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setDraft(draftFrom(e));
                      }}
                      className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-xs ${
                        e.private
                          ? "bg-zinc-100 text-zinc-600"
                          : e.moment
                            ? "bg-brand-600 text-white"
                            : "bg-brand-50 text-brand-900"
                      }`}
                    >
                      {e.private && <LockIcon className="size-3 shrink-0" />}
                      {!isAllDay(e.startDate) && eventDays(e)[0] === k && (
                        <span className="shrink-0 opacity-70">{timeLabel(e.startDate)}</span>
                      )}
                      <span className="truncate">{e.title}</span>
                    </button>
                  ))}
                  {items.length > 3 && <p className="px-1.5 text-xs text-zinc-500">{items.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-600" /> Part of an upcoming moment</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-50 ring-1 ring-brand-100" /> Other events</span>
        <span className="flex items-center gap-1.5"><LockIcon className="size-3" /> Private, never analysed</span>
      </div>

      {draft && <EventDialog draft={draft} onClose={() => setDraft(null)} onSave={save} onDelete={remove} />}
    </AppShell>
  );
}

function EventDialog({
  draft,
  onClose,
  onSave,
  onDelete,
}: {
  draft: Draft;
  onClose: () => void;
  onSave: (d: Draft) => Promise<string | null>;
  onDelete: (id: string) => void;
}) {
  const [d, setD] = useState(draft);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch });
  const input = "h-9 rounded-lg border border-zinc-300 bg-white px-2.5 text-sm focus:border-brand-500 focus:outline-none";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError((await onSave(d)) ?? "");
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-900/30 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">{d.id ? "Edit event" : "New event"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-zinc-700">
            <CloseIcon />
          </button>
        </div>

        <input
          autoFocus
          required
          maxLength={120}
          value={d.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Title, e.g. Flight to Barcelona"
          className={`${input} mt-4 w-full`}
        />

        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={d.allDay} onChange={(e) => set({ allDay: e.target.checked })} />
          All day
        </label>

        <div className="mt-3 grid grid-cols-[3rem_1fr_auto] items-center gap-2 text-sm text-zinc-600">
          <span>Starts</span>
          <input type="date" required value={d.startDay} onChange={(e) => set({ startDay: e.target.value, endDay: e.target.value > d.endDay ? e.target.value : d.endDay })} className={input} />
          {!d.allDay ? <input type="time" required value={d.startTime} onChange={(e) => set({ startTime: e.target.value })} className={input} /> : <span />}
          <span>Ends</span>
          <input type="date" required min={d.startDay} value={d.endDay} onChange={(e) => set({ endDay: e.target.value })} className={input} />
          {!d.allDay ? <input type="time" required value={d.endTime} onChange={(e) => set({ endTime: e.target.value })} className={input} /> : <span />}
        </div>

        {d.item?.private && (
          <p className="mt-4 flex items-start gap-2 text-sm text-zinc-600">
            <LockIcon className="mt-0.5 size-4 shrink-0" /> This looks private. KBC Ahead never analyses it.
          </p>
        )}
        {d.item?.moment && (
          <p className="mt-4 text-sm text-zinc-600">
            Part of an upcoming moment ({MOMENT_KIND[d.item.moment.type].toLowerCase()}). Changing it updates your
            Upcoming page.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex items-center gap-2">
          {d.id && (
            <button type="button" onClick={() => onDelete(d.id!)} className="text-sm text-zinc-500 hover:text-red-700">
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto h-9 rounded-lg px-3 text-sm text-zinc-700 hover:bg-zinc-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !d.title.trim()}
            className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
