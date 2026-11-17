export const STAGES = ["confirmed", "preparing", "on-the-way", "delivered"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  confirmed: "Order confirmed",
  preparing: "Preparing your food",
  "on-the-way": "On the way",
  delivered: "Delivered",
};

/**
 * Durata demo di ogni fase prima della successiva (ms). Ordine completo in 30 secondi,
 * così chi prova l'app vede tutto il percorso senza aspettare.
 */
export const STAGE_DURATIONS_MS = [6_000, 10_000, 14_000] as const;
export const TOTAL_DEMO_MS = STAGE_DURATIONS_MS.reduce((a, b) => a + b, 0);

/** Lo stato è derivato dall'ora: sopravvive al ricaricamento e non serve un server. */
export function orderStage(createdAt: number, now: number) {
  const elapsed = Math.max(0, now - createdAt);
  let index = 0;
  let threshold = 0;
  for (const duration of STAGE_DURATIONS_MS) {
    threshold += duration;
    if (elapsed >= threshold) index += 1;
  }
  return {
    index,
    stage: STAGES[index] as Stage,
    progress: Math.min(1, elapsed / TOTAL_DEMO_MS),
    delivered: index === STAGES.length - 1,
  };
}

/** Minuti rimasti, scalati in proporzione all'avanzamento della demo. */
export function minutesLeft(etaMin: number, progress: number) {
  return Math.max(0, Math.ceil(etaMin * (1 - progress)));
}
