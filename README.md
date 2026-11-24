# Portfolio apps

Four mobile-first web apps built to show that I can **design and build** a product end to end:
shopping, flights, jobs and food delivery. Each one is a small, complete product with fake data and a
public demo, not a mock-up.

They share one design system (`packages/ui`), so the four apps look and behave like a family.

| App | Status | What it shows |
|---|---|---|
| [**Nosh**](apps/food) — food delivery | Done | Discovery with filters and live result counts, restaurant menu, cart, checkout, order tracking, search |
| [**Skylark**](apps/flight) — flights | Built, not deployed yet | Search (one way or round trip), results with Best / Cheapest / Fastest, filters in the URL with live counts, itinerary, fare choice, passengers, booking, trips |
| Shopping | Planned | — |
| Jobs | Planned | — |

**Live demo (Nosh):** https://portfolio-apps-beige.vercel.app
**Design case studies:** [Nosh](apps/food/CASE_STUDY.md) · [Skylark](apps/flight/CASE_STUDY.md)

## Run it

You need Node 22+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173 (or `pnpm dev:flight` for Skylark). On a desktop screen the app appears
inside a phone frame; on a phone it fills the screen.

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the food app |
| `pnpm dev:flight` | Starts the flight app |
| `pnpm typecheck` | TypeScript, strict mode, in every package |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit and component tests (Vitest + Testing Library) |
| `pnpm build` | Production build |
| `pnpm e2e` | End-to-end and accessibility tests in a real browser, both apps (Playwright + axe) |

For `pnpm e2e` install the browser once with `pnpm --filter food exec playwright install chromium`.
If you already have a compatible Chromium, set `PW_CHROMIUM_PATH` to its executable instead.

## What is in the repo

```
apps/food/          Nosh, the food delivery app
  src/pages/        One file per screen
  src/features/     Logic by topic: restaurants (filters), cart, orders, search
  src/data/         Fake restaurants and menus
  e2e/              Playwright tests, including axe accessibility scans
apps/flight/        Skylark, the flight search and booking app (same layout as apps/food)
  src/features/     Logic by topic: results (generator, filters, sort), booking (prices), search (URL params), trips
  src/data/         Real airports, made-up airlines
packages/ui/        Shared design system: tokens (tokens.css), icons, components
packages/config/    Shared TypeScript configuration
```

**Stack:** React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router, TanStack Query, Zustand.

## Quality

- **Types and lint:** TypeScript strict with `noUncheckedIndexedAccess`; ESLint on every package.
- **Unit and component tests:** Nosh 94, Skylark 121. The logic that matters most (filters and result
  counts, prices, sorting, search parameters, order status) lives in pure functions with their own tests.
- **End-to-end tests:** Nosh 27, Skylark 28, in a real browser: full purchase and full bookings (one way
  and round trip), persistence across a reload, links opened directly, keyboard use and the phone frame on
  desktop.
- **Accessibility:** axe scans (WCAG 2.0 and 2.1, levels A and AA, plus best practices) run on 13 Nosh
  screens and states and 20 Skylark ones, including sheets, dialogs, error and empty states. In Nosh they
  found real bugs during development; in Skylark they reported nothing (see the case studies).
- **Lighthouse (mobile, on the live Nosh site):** home 92 / 100 / 100 / 100 and restaurant page
  94 / 100 / 100 / 100 for Performance / Accessibility / Best Practices / SEO. Layout shift 0, blocking
  time 0 ms. The weakest number is LCP (3.2 s on the home, 3.0 s on a restaurant page); see the case study
  for why. Skylark has not been measured yet.
- **Real device:** Nosh was checked by hand on one phone (full purchase, reload mid-flow, direct links).
  Not a device matrix. Skylark has not been checked on a phone yet.

## Notes about the demo

- Restaurants, dishes and addresses are made up. No payment is taken and **no card details are ever
  asked**: checkout offers a "Demo card" or "Cash".
- The cart and orders are saved only in your browser. *Account → Reset demo data* clears them.
- An order goes through its four stages in 30 seconds, so the whole tracking flow is easy to see.
- Skylark: airports are real, **airlines, fares and schedules are made up** and nothing is bookable. No
  passport or ID number and no card is ever asked; bookings are saved only in your browser (*Account →
  Reset demo data* clears them). Time zones are fixed offsets without daylight saving.

## Publishing on Vercel

Create one Vercel project per app from this repository and set **Root Directory** to `apps/food` or
`apps/flight`. Vercel detects Vite and installs the workspace from the repository root. Each app's
`vercel.json` redirects every path to `index.html`, so links such as `/restaurant/salt-and-lime` or
`/flight/LHR-ATH-2027-03-15-economy-0` keep working after a refresh.

## Credits

Food photos come from [Unsplash](https://unsplash.com) (Unsplash License); each photo is linked in
[`apps/food/public/photos/CREDITS.md`](apps/food/public/photos/CREDITS.md). The design takes its cue from
a UX Peak video on food-delivery screens.
