# Portfolio apps

Four mobile-first web apps built to show that I can **design and build** a product end to end:
shopping, flights, jobs and food delivery. Each one is a small, complete product with fake data and a
public demo, not a mock-up.

They share one design system (`packages/ui`), so the four apps look and behave like a family.

| App | Status | What it shows |
|---|---|---|
| [**Nosh**](apps/food) — food delivery | Done | Discovery with filters and live result counts, restaurant menu, cart, checkout, order tracking, search |
| Shopping | Planned | — |
| Flights | Planned | — |
| Jobs | Planned | — |

**Live demo:** https://portfolio-apps-beige.vercel.app
**Design case study:** [apps/food/CASE_STUDY.md](apps/food/CASE_STUDY.md)

## Run it

You need Node 22+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. On a desktop screen the app appears inside a phone frame; on a phone it
fills the screen.

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the food app |
| `pnpm typecheck` | TypeScript, strict mode, in every package |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit and component tests (Vitest + Testing Library) |
| `pnpm build` | Production build |
| `pnpm e2e` | End-to-end and accessibility tests in a real browser (Playwright + axe) |

For `pnpm e2e` install the browser once with `pnpm --filter food exec playwright install chromium`.
If you already have a compatible Chromium, set `PW_CHROMIUM_PATH` to its executable instead.

## What is in the repo

```
apps/food/          Nosh, the food delivery app
  src/pages/        One file per screen
  src/features/     Logic by topic: restaurants (filters), cart, orders, search
  src/data/         Fake restaurants and menus
  e2e/              Playwright tests, including axe accessibility scans
packages/ui/        Shared design system: tokens (tokens.css), icons, components
packages/config/    Shared TypeScript configuration
```

**Stack:** React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router, TanStack Query, Zustand.

## Quality

- **Types and lint:** TypeScript strict with `noUncheckedIndexedAccess`; ESLint on every package.
- **Unit and component tests:** 90 tests. The logic that matters most (filters and result counts, cart,
  price totals, order status, search) lives in pure functions with their own tests.
- **End-to-end tests:** 27 tests in a real browser, including a full purchase, cart persistence across a
  reload, keyboard focus handling and the phone frame on desktop.
- **Accessibility:** axe scans (WCAG 2.0 and 2.1, levels A and AA, plus best practices) run on 13 screens
  and states, including the filter sheet, dialogs, error and empty states. They found real bugs during
  development; see the case study.
- **Lighthouse (mobile, on the live site):** home 95 / 100 / 100 / 92 and restaurant page 93 / 100 / 100 / 92
  for Performance / Accessibility / Best Practices / SEO. Layout shift 0, blocking time 0 ms. The weakest
  numbers are the largest image (LCP 2.8 s and 3.2 s) and `robots.txt`; see the case study.
- **Real device:** checked by hand on one phone (full purchase, reload mid-flow, direct links). Not a
  device matrix.

## Notes about the demo

- Restaurants, dishes and addresses are made up. No payment is taken and **no card details are ever
  asked**: checkout offers a "Demo card" or "Cash".
- The cart and orders are saved only in your browser. *Account → Reset demo data* clears them.
- An order goes through its four stages in 30 seconds, so the whole tracking flow is easy to see.

## Publishing on Vercel

Create a project from this repository and set **Root Directory** to `apps/food`. Vercel detects Vite and
installs the workspace from the repository root. `apps/food/vercel.json` redirects every path to
`index.html`, so links such as `/restaurant/salt-and-lime` keep working after a refresh.

## Credits

Food photos come from [Unsplash](https://unsplash.com) (Unsplash License); each photo is linked in
[`apps/food/public/photos/CREDITS.md`](apps/food/public/photos/CREDITS.md). The design takes its cue from
a UX Peak video on food-delivery screens.
