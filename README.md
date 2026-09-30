# techtonic_the_vibers
This is the repo of the Vibers. Building the bank of the future.

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:3000
```

## Who works where

Each role owns its own folders, so Git conflicts stay rare. Full plan: [kbc-ahead-context/docs/PLAN.md](kbc-ahead-context/docs/PLAN.md).

| Role | Owns |
| --- | --- |
| **A. Frontend** | `app/(ui)/`, `components/`, `lib/mock.ts` |
| **B. Backend + AI** | `app/api/`, `lib/session.ts`, `lib/classify.ts`, `lib/engine.ts`, `lib/store.ts` |
| **C. Data + peers** | `scripts/`, `data/`, `templates/`, `public/demo_calendar.ics`, `lib/peers.ts`, `lib/data.ts`, `lib/sensitive.ts` |
| **D. Security + pitch** | `README.md`, `docs/` (demo script, `docs/aikido/` screenshots) |
| **Everyone (agree first)** | `lib/types.ts` (shared contracts), `package.json` |

```
app/
  (ui)/                 A  pages: timeline (/), login, moments/[id]
  api/                  B  login, timeline, calendar/import, tell, moments/[id], peers
components/             A  PhoneFrame, MomentCard, PeerBudgetBar, ...
lib/
  types.ts              ★  shared contracts
  mock.ts               A  hard-coded MomentView[] to build the UI against
  session.ts classify.ts engine.ts store.ts      B
  peers.ts data.ts sensitive.ts                  C
scripts/generate.py     C  synthetic data, fixed seed → data/
data/  templates/       C
public/                 C  demo_calendar.ics
docs/                   D
```
