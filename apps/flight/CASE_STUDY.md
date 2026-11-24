# Skylark — case study

A flight search and booking app designed and built as a portfolio project, the second of four. Airlines,
fares and schedules are made up (the airports are real), but the flow is complete: search, compare, pick a
fare, add passengers, book, find the booking again.

## The problem

A list of flights is a list of near-identical rows: they differ by a few euros, an hour, a stop. People do
not need more rows, they need help **deciding**. The screen has two jobs: make the differences easy to see,
and let people narrow the list without losing track of what they are trading away.

This is the harder twin of Nosh's filter sheet. In Nosh, filters hide restaurants. Here a filter can hide
the flight you would have wanted, so every filter has to show its cost before you use it.

## Goals and non-goals

**Goals**
- From the search form to a booking in under two minutes, one way or round trip.
- Results that read at a glance: times, duration, stops and price, in a clear order.
- Filters that show how many flights each option gives, and that never change the list under your fingers.
- Accessible with a keyboard and a screen reader, on narrow screens, with reduced motion.
- A link that opens in ten seconds and survives a refresh on any screen.

**Non-goals**
- Real data, prices, availability or airlines; payments; accounts; seat maps; multi-city trips; loyalty;
  notifications; other languages.
- A native app.

**Anti-goals** (a failure even if everything "works")
- A wall of numbers where nothing tells one flight from another.
- Nosh in a different colour. Skylark has its own layout: an itinerary with a timeline.
- Collecting sensitive data. There are **no passport numbers and no card details** anywhere, and the
  booking form says it is a demo.

## Design decisions

### 1. Three tabs that answer "which one?" before you scroll
The top of the results has **Best / Cheapest / Fastest**, and each tab shows its own best value (for
example "Cheapest €102", "Fastest 3h 29m"). The tabs are a summary and a sort control in one. "Best" is a
plain, documented rule: normalised price plus normalised duration plus 0.15 for every stop, so a direct
flight at an average price beats a slightly cheaper one with a two-hour layover. The rule lives in one pure
function with tests.

### 2. A card that shows the route, not just a price
Each card is an itinerary in miniature: departure time and airport, a line with the duration and the number
of stops, arrival time and airport. A dot on the line marks a connection and the layover is written under
it ("1h 45m in Madrid"). An arrival on a later day gets a "+1". The price is the biggest thing on the card
but sits at the bottom, after the facts that justify it.

### 3. Filters that show their cost (again, and harder)
- Quick filters ("Direct", "Morning") are on screen. The full sheet opens **over** the results.
- Every option shows how many flights it would return; the main button says exactly what you get ("Show 7
  flights") and turns off at zero.
- Multi-choice groups (departure time, airlines) count what you would get by *adding* that option, because
  choosing a second time of day widens the list.
- Price and duration have histograms behind their sliders, so you can see where most flights are.
- The sheet works on a **draft**: confirming applies it, closing throws it away.
- Filters and the search live in the **URL**. A link shares the search, the filters and the sort order, and
  a refresh keeps everything.

### 4. Round trips are chosen in sequence
Pick the outbound, then the same results page asks for the return and shows the running total ("Choose your
return · Total so far €…"). It avoids the grid of outbound-by-return pairs, which is hard to read on a
phone, at the cost of not seeing the cheapest *pair* up front.

### 5. The price before the surprise
The card shows the Basic fare per person. On the flight page three fares are cards with what each includes
(cabin bag / checked bag / free changes) and the extra amount ("+€25", "+€60"). Under them a breakdown shows
fare, **taxes as their own line**, any outbound already chosen, and the total for all adults. Taxes are
visible before booking, not at the last step.

### 6. Every state is designed
Loading skeletons, an error with "Try again", "No flights match these filters" with "Clear filters", an
invalid search (past date, return before departure) with a way back, a flight that does not exist, a
booking that does not exist, an empty trips list. Garbage in the URL (an unknown airport, `adults=99`, a
bad date, a malformed filter) falls back to safe defaults and never crashes.

## What testing found

- **The airport search matched the airport's name.** Typing "ath" for Athens also listed London, because
  Heathrow contains "ath". The search now matches city and code only, as intended. A unit test on the
  picker caught it.
- **My plan used `ret` twice.** The return *date* is already `ret` in the search URL, and I had planned to
  use `ret` again for the chosen return *flight*. Writing the URL-handling code made the clash obvious; the
  chosen return flight is `rtn`, with `rtnFare`.
- **A stored total would have been a bug waiting to happen.** The passengers page rebuilds the price from
  the flights and fares in the URL every time, so a changed link can never book at a different price.
- **Real browser, 20 accessibility scans.** axe (WCAG 2.0 and 2.1 A and AA, plus best practices) ran on
  every screen and state, including the sheets, the errors and the empty states. It reported nothing on
  the first run. I take that as "no machine-detectable problems", not as proof the app is accessible: it
  cannot judge reading order or whether the copy makes sense.

## How it is built

- **Reuses the Nosh design system.** `packages/ui` already had the sheet, option chips, histogram slider,
  stepper and tab bar. Skylark needed four small, backwards-compatible changes (tab bar with any number of
  tabs, a text variant of the segmented toggle, min/max on the stepper, four icons) and four helpers moved
  out of Nosh. Nosh's own tests stayed green after every change. The accent is a different blue, set by
  redefining the colour tokens, without touching a component.
- **A deterministic flight generator.** The same airports and date always give the same 20–30 flights, from
  a small seeded random generator. A flight's id contains its route, date, cabin and index, so
  `/flight/:id` can rebuild the flight from the id alone, which is why every URL survives a refresh and the
  tests are stable.
- **Logic kept apart from screens.** Filters and counts, sorting, prices, search parameters and the booking
  reference are small pure functions with their own tests.
- **Honest persistence.** Bookings are saved in the browser with a safe wrapper, so the app still works if
  storage is blocked.
- **Tests at three levels:** the logic and the screens (121 tests), and a real browser for the full
  bookings, the URLs, the keyboard and accessibility (28 tests).

## Trade-offs and limits

- Everything is made up. Prices follow a long-tailed distribution so the histogram has a shape, not
  because any real fare looks like that.
- **Time zones are fixed offsets per airport, with no daylight saving.** Arrival times are therefore
  consistent inside the demo but would be an hour off in summer for some routes.
- Flights have at most one stop and are priced per person; there are no baggage fees beyond the three
  fares, no seat map and no children or infants.
- The results price is the Basic fare **before taxes**; taxes and add-ons appear on the flight page. That is
  clear in the breakdown but a person comparing only the cards sees slightly lower numbers than they pay.
- The "error" state of the results is covered by tests of the component, not in the real browser: the data
  is generated in the page, so there is no network request to make fail.
- Lighthouse has **not been measured yet**; it will be run on the public link once the app is deployed.
- Not checked on a real phone yet, only in a desktop browser at phone sizes.
- When the route changes, keyboard focus is not moved to the new page heading (the same gap as Nosh).

## What I would do next

1. Deploy, measure Lighthouse on the live link and check the app by hand on a phone.
2. Move focus to the page heading on every route change.
3. A calendar view of prices around the chosen date, which is where flexible travellers actually decide.
4. Children and infants, and a seat map.
5. Show the total with taxes on the result cards, behind a switch, to compare real prices.
