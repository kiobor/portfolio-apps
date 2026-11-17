import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";
import type { Totals } from "@/features/cart/pricing";

export type PaymentMethod = "demo-card" | "cash";

export type OrderLine = { name: string; qty: number; price: number };

export type Order = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  etaMin: number;
  lines: OrderLine[];
  totals: Totals;
  address: string;
  note: string;
  payment: PaymentMethod;
  createdAt: number;
};

type OrderState = {
  /** Dal più recente al più vecchio. */
  orders: Order[];
  place: (order: Omit<Order, "id" | "createdAt">) => Order;
};

const newId = () => `ord-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const useOrders = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      place: (input) => {
        const order: Order = { ...input, id: newId(), createdAt: Date.now() };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
    }),
    {
      name: "nosh-orders",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);

export const paymentLabels: Record<PaymentMethod, string> = {
  "demo-card": "Demo card •••• 4242",
  cash: "Cash on delivery",
};
