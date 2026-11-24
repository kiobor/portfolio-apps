import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { useTripsStore } from "@/features/trips/tripsStore";

// Gli store sono singleton di modulo (e persistono su localStorage): li azzeriamo tra i test.
afterEach(() => {
  useTripsStore.setState({ bookings: [] });
  localStorage.clear();
});
