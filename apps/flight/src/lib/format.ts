const euroWhole = new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" });

/** Centesimi in euro: senza decimali se l'importo è intero ("€80"), con due altrimenti ("€80.50"). */
export function formatCents(cents: number): string {
  return cents % 100 === 0 ? euroWhole.format(cents / 100) : euroCents.format(cents / 100);
}

/** Minuti come "3h 35m", "3h" o "45m". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Data di calendario YYYY-MM-DD come "Mon 15 Mar" (calcolata in UTC: un giorno di calendario non ha fuso). */
export function formatDay(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(new Date(`${iso}T00:00:00Z`));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}
