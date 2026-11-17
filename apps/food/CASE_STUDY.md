# Nosh — case study

A food delivery app designed and built as a portfolio project. Everything is fake data, but the flow is
complete: find a place, read the menu, order, follow the order.

## The problem

Choosing what to eat is a decision made on a phone, often in a hurry, between hundreds of options. The
screen has two jobs: make the food look appealing, and help people narrow things down without feeling
lost.

## Goals and non-goals

**Goals**
- A person can go from opening the app to a placed order in under a minute.
- The first screen makes people want to keep scrolling, not just fit as many rows as possible.
- Filtering helps people *decide*, not only hide things.
- It works for everyone: keyboard, screen reader, small phones, reduced motion.

**Non-goals**
- A real backend, real payments or real accounts.
- A native app. A link anyone can open in ten seconds mattered more.

## Design decisions

### 1. Food first, restaurant details underneath
The photo is the biggest thing on a card and the restaurant's name and numbers sit **under** it, not on
top. That way the card looks right whatever photo a restaurant uploads. The category row uses illustrated
icons instead of photos, so six small food pictures do not compete with the dishes below.

### 2. A clear order of reading
Name first, then the numbers people compare (time, rating, fee), then everything else in a lighter
weight. Shapes follow one language: the same corner radii everywhere.

### 3. Filters that are visible and that show their cost
- The quick filters ("Under 30 min", "Free delivery") are on screen, not hidden in a menu.
- The full filter opens as a **sheet over the results**, not a new page, so you keep a sense of where you
  are. Everything is in one scroll, so you can weigh options against each other.
- **Every option shows how many places it would return** before you choose it, and the main button says
  exactly what you will get ("Show 6 places"). It turns off when nothing matches.
- Delivery time has a small histogram behind the slider, so you can see where most places are.
- Rating options are "4.5+" and not "exactly 4.5": choosing a minimum should not hide better places.
- The sheet works on a **draft**. Confirming applies it; closing throws it away. People can explore
  freely without the list changing under them.

### 4. One layout does not fit everyone
Big photos make you hungry; a compact list lets you compare. Instead of choosing for everybody there is a
card / list switch. The list got its own hierarchy: one piece of information per line, the cuisine never
cut off, and time and fee grouped on the right because both are delivery information. The review count,
the least useful number in a small space, only appears in the card view.

### 5. Ordering without surprises
- A cart holds one restaurant at a time. If you add a dish from another place, the app asks first
  ("Start a new order?") and explains that the current cart will be emptied.
- Prices show the full breakdown (subtotal, delivery, service fee, total) before checkout, and the same
  breakdown follows the order to its tracking page.
- Checkout never asks for card details. The demo offers "Demo card" or "Cash", and says so.
- Tracking shows four clear stages and a progress bar, and updates by itself.

### 6. Every state is designed
Loading skeletons, an error with a "Try again" button, "no places match" with a "Clear filters" button,
an empty cart, no orders yet, a restaurant or order that cannot be found. Each one tells people what
happened and what to do next.

## What testing found

Writing the tests in a real browser found problems that looked fine on screen:

- **The restaurant links had no usable name for screen readers.** A link that wraps a whole card has no
  reliable accessible name. The link now sits on the restaurant's name and stretches over the whole card,
  so the card is fully clickable and a screen reader just says "Salt & Lime".
- **The search bar on the home page changed the page as soon as it received focus.** Someone using the Tab
  key could never get past it to the restaurants. It is now a normal link that opens on click or Enter.
- **Small screens.** At 320 px wide, 8 of the 12 restaurant names were cut off in the list view. Below
  360 px the photo and spacing shrink, and above that nothing changes.
- **A missing page title and heading.** Every screen now sets its own title and has a level-one heading.

## How it is built

- **A shared design system.** Colours, radii and type live as tokens in `packages/ui`, with the shared
  components next to them. The next three apps reuse the sheet, option chips, histogram slider, stepper
  and tab bar.
- **Logic kept apart from screens.** Filtering, result counts, price totals, order stages and search are
  small pure functions with their own tests. The order stage is *derived from the order time*, so it
  survives a reload and needs no server.
- **Honest persistence.** Cart and orders are stored in the browser with a safe wrapper, so the app still
  works if storage is blocked.
- **Tests at three levels:** the logic, the screens, and a real browser for the full purchase and for
  accessibility (axe on 13 screens and states).

## Trade-offs and limits

- Restaurants and menus are made up, and search is a simple word match. There is no ranking or typo
  tolerance.
- Photos are served in two sizes (480 and 960 px wide, about 30 and 90 KB) with `srcset`. Newer formats such
  as WebP or AVIF would shrink them further.
- Lighthouse (v13.6, mobile, live site), measured twice:
  - First deploy: home 95 Performance / 100 Accessibility / 100 Best Practices / 92 SEO; restaurant page
    93 / 100 / 100 / 92. LCP 2.8 s and 3.2 s.
  - After responsive images, a priority first photo and a real `robots.txt`: home 92 / 100 / 100 / 100;
    restaurant page 94 / 100 / 100 / 100. LCP 3.2 s and 3.0 s. CLS 0 and TBT 0 ms in both runs.
- What the second pass taught me: SEO went to 100 (the single-page-app rewrite had been answering
  `/robots.txt` with the app's HTML) and the estimated image savings dropped from 751 KiB to 369 KiB on the
  home, but **LCP did not improve**. Image size was not the bottleneck. The photo is only discovered after
  the JavaScript bundle runs and the (simulated, 450 ms) catalogue request returns, and the CSS blocks the
  first paint for about 830 ms. Single lab runs also vary by a few points, so 92 against 95 on the home is
  within noise; I do not claim an improvement there.
- Real-device testing was one phone, by hand. It is not a device matrix.
- When the route changes, keyboard focus is not moved to the new page heading. The page title changes,
  but a screen-reader user would still have to look around. This is next on the list.

## What I would do next

1. Lower LCP, where the real cost is: inline the critical CSS, split the JavaScript by route, and show the
   first photo without waiting for the catalogue request (for example, prerendering the home). Measure again.
2. Move focus to the page heading on every route change.
3. Real search ranking and typo tolerance.
4. Saved addresses and reorder from past orders.
5. A second language, to check the layouts hold up with longer text.
