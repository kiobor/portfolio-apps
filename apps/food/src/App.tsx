import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/layout/AppShell";
import { AccountPage } from "@/pages/AccountPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { Home } from "@/pages/Home";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { RestaurantPage } from "@/pages/RestaurantPage";
import { SearchPage } from "@/pages/SearchPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderTrackingPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
