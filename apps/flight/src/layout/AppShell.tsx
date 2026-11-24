import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { OrdersIcon, OverlayContext, PlaneIcon, TabBar, UserIcon, type TabItem } from "@portfolio/ui";

const tabs: (TabItem & { path: string })[] = [
  { id: "search", label: "Search", path: "/", icon: <PlaneIcon size={24} /> },
  { id: "trips", label: "Trips", path: "/trips", icon: <OrdersIcon size={24} /> },
  { id: "account", label: "Account", path: "/account", icon: <UserIcon size={24} /> },
];

/** Le schermate della ricerca (risultati, dettaglio, passeggeri, conferma) appartengono alla tab Search. */
const tabPrefixes: Record<string, string[]> = {
  search: ["/results", "/flight", "/passengers"],
  trips: ["/trips", "/booking"],
  account: ["/account"],
};

function activeTabId(pathname: string) {
  if (pathname === "/") return "search";
  return Object.entries(tabPrefixes).find(([, prefixes]) => prefixes.some((p) => pathname.startsWith(p)))?.[0] ?? "search";
}

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

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
          activeId={activeTabId(pathname)}
          onChange={(id) => navigate(tabs.find((t) => t.id === id)?.path ?? "/")}
        />
        <div ref={setOverlayRoot} className="pointer-events-none absolute inset-0 z-40 *:pointer-events-auto" />
      </div>
    </div>
  );
}
