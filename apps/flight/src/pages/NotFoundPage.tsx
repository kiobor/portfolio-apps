import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted">That page does not exist.</p>
      <Link to="/" className="mt-4 inline-block font-semibold underline">
        Search flights
      </Link>
    </section>
  );
}
