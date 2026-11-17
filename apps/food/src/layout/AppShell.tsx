import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { HomeIcon, OrdersIcon, SearchIcon, TabBar, UserIcon, type TabItem } from "@portfolio/ui";
import { OverlayContext } from "./OverlayContext";

const tabs: (TabItem & { path: string })[] = [
  { id: "home", label: "Home", path: "/", icon: <HomeIcon size={24} /> },
  { id: "search", label: "Search", path: "/search", icon: <SearchIcon size={24} /> },
  { id: "orders", label: "Orders", path: "/orders", icon: <OrdersIcon size={24} /> },
  { id: "account", label: "Account", path: "/account", icon: <UserIcon size={24} /> },
];

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const active =
    tabs.find((t) => (t.path === "/" ? pathname === "/" : pathname.startsWith(t.path))) ?? tabs[0];

  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:bg-tile md:p-8">
      {/* Su desktop l'app vive in un frame telefono centrato, non in una pagina stirata. */}
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-cream md:h-[880px] md:max-h-[calc(100dvh-4rem)] md:rounded-[44px] md:border md:border-line md:shadow-soft">
        <OverlayContext.Provider value={overlayRoot}>
          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </OverlayContext.Provider>
        <TabBar
          items={tabs}
          activeId={active?.id ?? "home"}
          onChange={(id) => navigate(tabs.find((t) => t.id === id)?.path ?? "/")}
        />
        <div ref={setOverlayRoot} className="pointer-events-none absolute inset-0 z-40 *:pointer-events-auto" />
      </div>
    </div>
  );
}
