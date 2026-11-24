import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/layout/AppShell";
import { AccountPage } from "@/pages/AccountPage";
import { FlightPage } from "@/pages/FlightPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PassengersPage } from "@/pages/PassengersPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SearchPage } from "@/pages/SearchPage";
import { TripsPage } from "@/pages/TripsPage";

// Rotte /results, /flight/:id, /passengers, /booking/:ref arrivano nei task 6-8.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<SearchPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="flight/:id" element={<FlightPage />} />
        <Route path="passengers" element={<PassengersPage />} />
        <Route path="booking/:ref" element={<ConfirmationPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
