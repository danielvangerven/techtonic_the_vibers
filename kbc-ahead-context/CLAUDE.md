# KBC Ahead — project context for Claude

Hackathon project (Tectonic Hackathon, KBC case, 30 Sep 2026). 3-hour build, judged on
Creativity 30%, Technical ability 30%, Fit to the case 30%, Security 10% (Aikido AI code audit).
The full plan, roles and schedule are in @docs/PLAN.md — read it before larger changes.

## What we are building

A phone-style web app: **"Your next 90 days, prepared with the experience of people like you."**
Upcoming life moments (trip abroad, moving house, wedding guest) are detected from a calendar
upload, forward-looking transactions or free text ("Tell KBC"). Each moment gets:
- readiness checks against the customer's products ("3/4 ready"); products appear only for real gaps
- a peer layer from similar customers: median spend + 20th–80th percentile range, and
  "X% of people like you forgot this" per check (crowd hindsight)

## Stack and commands

- Next.js (App Router) + TypeScript + Tailwind, one app, run locally: `npm install`, `npm run dev`
- Data: JSON files in `/data` (synthetic, fixed seed), loaded into memory; demo-time moments in memory
- Gemini via Vertex AI (Google Gen AI SDK) with structured output; keyword fallback if it fails
- `ical.js` (browser calendar parsing), `zod` (validation), `iron-session` or `jose` (session)
- Optional: ElevenLabs text-to-speech for a voice briefing
- Not in scope: Google OAuth, deployment, a real mobile app, real KBC data

## Folder ownership (avoid Git conflicts)

- A Frontend: `app/(ui)/`, `components/`
- B Backend + AI: `app/api/`, `lib/classify.ts`, `lib/engine.ts`
- C Data + peers: `scripts/`, `data/`, `lib/peers.ts`, `templates/`
- D Security + pitch: `README.md`, security review, demo video
Shared contracts live in `lib/types.ts` — change them only with the whole team's agreement.

## Contracts (source of truth: `lib/types.ts`)

- `MomentType = "trip_abroad" | "moving" | "wedding_guest"`
- `MomentView = { moment, readiness: {done,total}, checks: Check[], peers: PeerStats }`
- `PeerStats` is either `{ ok: true, cohortLabel, n, median, p20, p80, unexpectedMedian? }`
  or `{ ok: false, reason: "too_few_people" }`
- API routes: `POST /api/login`, `GET /api/timeline`, `POST /api/calendar/import`,
  `POST /api/tell`, `DELETE /api/moments/[id]`, `GET /api/peers`

## Non-negotiable rules (security is graded)

- Every API route checks the session first; 401 without one.
- The customer ID comes ONLY from the session — never from URL, query or body.
- Ownership check on every read/delete of a moment; return 404 if it isn't the session's customer.
- IDs are random (`crypto.randomUUID()`), never sequential.
- Validate every input with zod (lengths, counts, enums, dates). Calendar titles ≤ 120 chars,
  max 50 events; Tell KBC text ≤ 300 chars.
- Peer endpoint returns aggregates only. Minimum group size 50, enforced on the server:
  narrowest cohort (household + age band + region + moment attributes) → drop region → drop age band
  → otherwise `{ ok: false, reason: "too_few_people" }`. Round amounts to €10.
- Gemini receives event titles only (no attendees, notes, locations) and may only answer in the enum
  response schema (`type` from MomentType or `"none"`, `country` as ISO-2, dates). Never let model
  output become free text shown to the user or an action.
- Sensitive calendar entries (medical, religious, etc.) are dropped in the browser before upload,
  and filtered again on the server.
- Secrets only in `.env` (git-ignored); keep `.env.example` up to date. No keys in code, logs or
  commits. Demo passwords stored as bcrypt hashes.
- Peer statistics are never used for pricing or credit decisions.

## Demo data facts (keep the numbers consistent with the video script)

- 5,000 synthetic customers, ~12,000 past moments; one deliberately tiny cohort
  (Iceland trips, singles 65+, n≈8) to demo a refused comparison.
- Lotte: 29, single, Ghent, card with cancellation cover but no medical cover abroad; calendar
  has "Vlucht Lissabon" 14–21 Oct, a wedding, an oncology appointment (must be filtered) and a
  prompt-injection title (must produce nothing).
- Tom: 34, couple, Leuven, no calendar; rental deposit + removal-firm booking → moving moment.

## Working style for this repo

- We have 3 hours: prefer the simplest thing that works on camera. No new dependencies unless needed.
- Keep the keyword fallback working so the demo never depends on Gemini being up.
- The UI must never break if `peers.ok === false` — show "Not enough similar customers to compare privately."
- When you finish a task, say which items of the security checklist in @docs/PLAN.md it touches.
