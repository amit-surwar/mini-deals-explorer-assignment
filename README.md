# Mini Deals Explorer

A small investor-facing Expo (React Native) app that mirrors a **Deals → Deal Detail → Invest** flow, built entirely on local mock data — no real backend.

- **Sign in** — any email works; a mock user is stored in a React context.
- **Deals list** — search-as-you-type, Draft/Active/Closed filter chips, a summary header (deal count + total raised), and pull-to-refresh that reshuffles the mock data after a fake delay.
- **Deal detail** — Overview / Investors / Documents tabs.
- **Invest** — pick an identity → currency-formatted amount (validated against the deal's minimum) → accept terms → submit with a loading state → success screen. The new subscription then appears in the deal's investor list, raise stats, and My Investments.

All three optional stretch goals are implemented:

- **Mock server (MSW)** — the data layer makes real `fetch()` calls to `https://api.mini-deals.test`, answered in-process by [MSW](https://mswjs.io) (`msw/native` in the app, `msw/node` in Jest — same handlers).
- **My Investments tab** — a bottom tab listing every mock investment made during the session, across deals, with a session total.
- **Offline fallback** — every successful deals fetch is cached in AsyncStorage; if a fetch fails, the list renders from the cache with an "Offline — showing your last synced deals" banner.

## Setup

Requires Node 20+ and the [Expo Go](https://expo.dev/go) app on your phone (or an iOS Simulator / Android emulator).

```bash
npm install
npx expo start
```

Then press `i` (iOS Simulator), `a` (Android emulator), or scan the QR code with Expo Go. There is no backend to run — the API is intercepted in-process.

Useful scripts:

```bash
npm test              # headless E2E: real router + screens + MSW data layer
npm run typecheck     # strict TypeScript, no `any` anywhere
npm run verify:mocks  # proves the mock data invariants (see below)
```

## Project structure

```
app/                    # expo-router routes — thin wrappers around feature screens
  _layout.tsx           # polyfills, MSW startup gate, React Query + Auth providers
  sign-in.tsx
  (app)/                # auth-protected group (redirects to /sign-in)
    _layout.tsx
    (tabs)/             # bottom tabs
      index.tsx         # "/"                 → deals list
      my-investments.tsx# "/my-investments"   → session investments
    deals/[id]/
      index.tsx         # "/deals/:id"        → deal detail tabs
      invest.tsx        # "/deals/:id/invest" → invest flow
      success.tsx       # "/deals/:id/success"
features/
  auth/                 # mock auth context + sign-in screen
  deals-list/           # list screen, useDeals(), list components
  deal-detail/          # detail screen, useDealById(), tab components
  invest/               # invest + success screens, useCreateInvestment()
  my-investments/       # session investments screen, useMyInvestments()
components/             # shared UI: Button, StatusBadge, Avatar, ProgressBar, feedback states
lib/
  api/config.ts         # API_BASE_URL — the single switch to a real backend
  api/dealsApi.ts       # fetch functions (the app's only API boundary)
  api/queryKeys.ts      # centralized React Query keys
  offlineCache.ts       # AsyncStorage cache for the deals list
  polyfills.ts          # Hermes polyfills MSW needs (fetch/streams/events)
  format.ts, theme.ts, routeParams.ts
mocks/
  deals.json            # hand-authored seed data (verified consistent)
  identities.ts         # the signed-in user's investing identities
  server/               # the "backend": in-memory db + MSW handlers
    db.ts, handlers.ts, native.ts (app), testServer.ts (Jest)
types/                  # Deal / Investment / Identity / MockUser
scripts/verify-mocks.mjs
__tests__/              # headless end-to-end suite (runs the real route tree)
```

## Data layer

Screens only ever call the React Query hooks `useDeals()`, `useDealById(id)`, `useCreateInvestment()`, and `useMyInvestments()`. Those hooks wrap fetch functions in `lib/api/dealsApi.ts` that issue real `fetch()` requests against `API_BASE_URL`. The MSW mock server (`mocks/server`) intercepts them in-process, waits a fake 400 ms, and answers from an in-memory store seeded by `mocks/deals.json`. Creating an investment mutates that store (keeping its stats consistent) and invalidates the query caches, so the new record shows up in the deal detail, the list totals, and My Investments. `fetchDeals` additionally persists each successful response to AsyncStorage and falls back to that cache when the network fails.

Running MSW inside Hermes required a small polyfill layer (`lib/polyfills.ts`): a spec-compliant fetch family with readable streams (`react-native-polyfill-globals`), DOM event classes, `BroadcastChannel`, and a fix for `react-native-fetch-api`'s broken body-stream getter. Jest skips all of it and runs the same handlers through `msw/node` against Node's native fetch.

### Pointing this at a real API

Change `API_BASE_URL` in `lib/api/config.ts` to the real host and delete `mocks/server` (and the startup gate in `app/_layout.tsx`) — because the data layer already speaks HTTP through real `fetch()` calls, nothing else has to move. The response mapping/validation seam is `request()` in `lib/api/dealsApi.ts`, which is also where a real auth token would be attached (fed by the auth context that already exists); hook signatures, query keys, cache invalidation, and every screen stay exactly as they are. The offline cache keeps working unchanged since it wraps the fetch, not the mock.

## Mock data

Eight hand-authored deals with thirty investment records, covering every status and a realistic spread of raise progress:

- **Draft**: Aurora Deep Tech SPV (zero investors — exercises the empty state) and Halcyon Credit Opportunities Fund (soft-circled, all pending).
- **Active**: Bluebottle Robotics SPV is early (~9% of subscriptions wired); Northwind and Saltgrass are mid-raise; Meridian Growth Fund II is the oversubscribed one — $4.6M subscribed against an intended $3.5M allocation (the schema has no target field, so oversubscription is reflected in the raise totals).
- **Closed**: Juniper Climate Fund I (fully wired) and Copperline Real Assets SPV II (one signed-but-never-wired investor), both with past closing dates.

The numbers are internally consistent, and `npm run verify:mocks` proves it: `investor_count` equals the number of investment records, `total_raised_subscribed` equals the sum of subscription amounts, `total_raised_wired` equals the sum of wired subscriptions (and never exceeds subscribed), `net_investment` equals the subscription net of the deal's management fee, `created_at` precedes `closing_date`, and closed deals have past closing dates.

## Testing

`npm test` runs a headless end-to-end suite that mounts the **real route tree** via `expo-router/testing-library` — actual layouts, screens, hooks, and the MSW-backed data layer with its real latency. It covers the full happy path (sign-in → list → detail tabs → validated invest → success → cache invalidation), the My Investments tab, the offline fallback (simulated network outage via an MSW handler override), and the edge cases: empty search results, a zero-investor deal, and non-numeric amount input.

## Commit history

The history is small commits whose messages explain why, not just what — `git log --oneline` shows the arc: scaffold → types → verified mock data → shared UI → mock API + hooks → auth → the three screens → docs, then the stretch work (MSW swap, My Investments, offline fallback), the E2E suite, and this README update.

## Out of scope

No real backend or auth tokens; no payments, wire instructions, e-signing, or PDF generation (the success screen is the end); no admin features (deal creation/editing, roles). The base spec also excluded offline caching and a mock server — both were added deliberately as the assignment's optional stretch goals.
