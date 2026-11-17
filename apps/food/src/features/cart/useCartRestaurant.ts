import { useQuery } from "@tanstack/react-query";
import { fetchRestaurantDetail } from "@/api/restaurants";
import { cartSubtotal, useCart } from "./cartStore";
import { orderTotals } from "./pricing";

/** Il ristorante del carrello e i totali dell'ordine (null finché i dati non arrivano). */
export function useCartSummary() {
  const { lines, restaurantId } = useCart();
  const { data, isPending } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => fetchRestaurantDetail(restaurantId ?? ""),
    enabled: restaurantId !== null,
  });
  const restaurant = data?.restaurant ?? null;
  const totals = restaurant ? orderTotals(cartSubtotal(lines), restaurant.deliveryFee) : null;
  return { lines, restaurantId, restaurant, totals, isPending: restaurantId !== null && isPending };
}
