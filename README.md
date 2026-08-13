# Mini Deals Explorer

A small investor-facing Expo (React Native) app that mirrors a **Deals → Deal Detail → Invest** flow, built entirely on local mock data — no backend, no real API calls.

- **Sign in** — any email works; a mock user is stored in a React context.
- **Deals list** — search-as-you-type, Draft/Active/Closed filter chips, a summary header (deal count + total raised), and pull-to-refresh that reshuffles the mock data after a fake delay.
- **Deal detail** — Overview / Investors / Documents tabs.
- **Invest** — pick an identity → currency-formatted amount (validated against the deal's minimum) → accept terms → submit with a loading state → success screen. The new subscription then appears in the deal's investor list and raise stats.

## Setup

Requires Node 20+ and the [Expo Go](https://expo.dev/go) app on your phone (or an iOS Simulator / Android emulator).

```bash
npm install
npx expo start
```

Then press `i` (iOS Simulator), `a` (Android emulator), or scan the QR code with Expo Go. There is no backend to run.

Useful scripts:

```bash
npm run typecheck     # strict TypeScript, no `any` anywhere
npm run verify:mocks  # proves the mock data invariants (see below)
```

## Project structure

```
app/                    # expo-router routes — thin wrappers around feature screens
  _layout.tsx           # React Query + Auth providers
  sign-in.tsx
  (app)/                # auth-protected group (redirects to /sign-in)
    index.tsx           # "/"                 → deals list
    deals/[id]/
      index.tsx         # "/deals/:id"        → deal detail tabs
      invest.tsx        # "/deals/:id/invest" → invest flow
      success.tsx       # "/deals/:id/success"
features/
  auth/                 # mock auth context + sign-in screen
  deals-list/           # list screen, useDeals(), list components
  deal-detail/          # detail screen, useDealById(), tab components
  invest/               # invest + success screens, useCreateInvestment()
components/             # shared UI: Button, StatusBadge, Avatar, ProgressBar, feedback states
lib/
  api/dealsApi.ts       # the ONLY module that talks to the "backend"
  api/queryKeys.ts      # centralized React Query keys
  format.ts, theme.ts, routeParams.ts
mocks/                  # deals.json + mock investing identities
types/                  # Deal / Investment / Identity / MockUser
scripts/verify-mocks.mjs
```

## Data layer

Screens only ever call the React Query hooks `useDeals()`, `useDealById(id)`, and `useCreateInvestment()`. Those hooks wrap fetch-shaped functions in `lib/api/dealsApi.ts`, each of which awaits a fake 400 ms delay and resolves from an in-memory store seeded by `mocks/deals.json`. Creating an investment mutates that store (and keeps its stats consistent), then invalidates the query cache so the new record shows up everywhere.

### Pointing this at a real API

Only `lib/api/dealsApi.ts` would change: replace the bodies of `fetchDeals`, `fetchDealById`, and `createInvestment` with `fetch()`/axios calls to the real endpoints (e.g. `GET /deals`, `GET /deals/:id`, `POST /deals/:id/investments`), delete the in-memory store and fake delay, and map/validate the server response into the existing `Deal`/`Investment` types at that boundary. The hook signatures, query keys, cache invalidation, and every screen stay exactly as they are; the only other likely addition is attaching a real auth token to requests, which would slot into the same module (fed by the auth context that already exists).

## Mock data

Eight hand-authored deals with thirty investment records, covering every status and a realistic spread of raise progress:

- **Draft**: Aurora Deep Tech SPV (zero investors — exercises the empty state) and Halcyon Credit Opportunities Fund (soft-circled, all pending).
- **Active**: Bluebottle Robotics SPV is early (~9% of subscriptions wired); Northwind and Saltgrass are mid-raise; Meridian Growth Fund II is the oversubscribed one — $4.6M subscribed against an intended $3.5M allocation (the schema has no target field, so oversubscription is reflected in the raise totals).
- **Closed**: Juniper Climate Fund I (fully wired) and Copperline Real Assets SPV II (one signed-but-never-wired investor), both with past closing dates.

The numbers are internally consistent, and `npm run verify:mocks` proves it: `investor_count` equals the number of investment records, `total_raised_subscribed` equals the sum of subscription amounts, `total_raised_wired` equals the sum of wired subscriptions (and never exceeds subscribed), `net_investment` equals the subscription net of the deal's management fee, `created_at` precedes `closing_date`, and closed deals have past closing dates.

## Explicitly out of scope

No real backend, API calls, auth tokens, or fetch proxy; no payments, wire instructions, e-signing, or PDF generation (the success screen is the end); no admin features (deal creation/editing, roles); no offline caching or mock server — the data source is the local JSON only.
