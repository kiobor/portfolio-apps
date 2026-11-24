import { useState } from "react";
import { useDocumentTitle } from "@portfolio/ui";
import { useTripsStore } from "@/features/trips/tripsStore";

export function AccountPage() {
  useDocumentTitle("Account — Skylark");
  const tripCount = useTripsStore((s) => s.bookings.length);
  const reset = useTripsStore((s) => s.reset);
  const [cleared, setCleared] = useState(false);

  function resetDemo() {
    reset();
    setCleared(true);
  }

  return (
    <div className="px-6 pt-8 pb-6">
      <h1 className="text-[28px] leading-8 font-bold tracking-tight">Account</h1>

      <section className="mt-5 flex items-center gap-4 rounded-tile border border-line bg-surface p-5">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-pill bg-forest text-lg font-bold text-cream"
        >
          DU
        </span>
        <div>
          <h2 className="text-base font-bold">Demo user</h2>
          <p className="text-sm text-muted">No sign-in, no real data</p>
        </div>
      </section>

      <section aria-labelledby="demo-title" className="mt-6">
        <h2 id="demo-title" className="text-base font-semibold">
          About this demo
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-muted">
          Skylark is a portfolio project. Airlines, fares and schedules are made up, nothing is bookable and no
          payment is taken. Your trips are stored only in this browser.
        </p>
      </section>

      <section className="mt-6">
        <button
          type="button"
          onClick={resetDemo}
          className="h-12 w-full rounded-pill border border-line bg-surface font-semibold"
        >
          Reset demo data
        </button>
        <p role="status" className="mt-2 px-2 text-sm text-muted">
          {cleared ? "Trips cleared." : `${tripCount} ${tripCount === 1 ? "trip" : "trips"} saved in this browser.`}
        </p>
      </section>
    </div>
  );
}
