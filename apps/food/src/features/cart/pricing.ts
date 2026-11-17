export const SERVICE_FEE = 0.99;

export type Totals = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
};

/** Somma in centesimi per evitare errori di arrotondamento dei decimali. */
export function orderTotals(subtotal: number, deliveryFee: number): Totals {
  const cents = (n: number) => Math.round(n * 100);
  const total = (cents(subtotal) + cents(deliveryFee) + cents(SERVICE_FEE)) / 100;
  return { subtotal, deliveryFee, serviceFee: SERVICE_FEE, total };
}
