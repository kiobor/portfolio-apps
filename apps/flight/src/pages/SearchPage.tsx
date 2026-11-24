import { PlaneIcon, useDocumentTitle } from "@portfolio/ui";
import { SearchForm } from "@/features/search/SearchForm";

export function SearchPage() {
  useDocumentTitle("Search flights — Skylark");
  return (
    <div className="px-6 pt-8 pb-8">
      {/* La Search non aspetta nessuna richiesta: il contenuto principale è subito lì (LCP). */}
      <p className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-forest uppercase">
        <PlaneIcon size={18} />
        Skylark
      </p>
      <h1 className="sr-only">Search flights</h1>
      <p aria-hidden="true" className="mt-3 mb-6 text-[32px] leading-9 font-bold tracking-tight">
        Where to next?
      </p>
      <SearchForm />
      <p className="mt-6 text-center text-xs text-muted">
        Demo: airlines, fares and dates are made up. Nothing here is bookable.
      </p>
    </div>
  );
}
