import { cx } from "@portfolio/ui";
import { fareAddOnCents, type FareId } from "./pricing";
import { formatCents } from "@/lib/format";

const fares: { id: FareId; name: string; perks: string }[] = [
  { id: "basic", name: "Basic", perks: "Cabin bag only" },
  { id: "standard", name: "Standard", perks: "Cabin bag + checked bag" },
  { id: "flex", name: "Flex", perks: "Checked bag + free changes" },
];

/** Tre tariffe come schede radio: il supplemento sta nella scheda, il totale nel riepilogo. */
export function FareOptions({ value, onChange }: { value: FareId; onChange: (fare: FareId) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-semibold">Choose your fare</legend>
      <div className="flex flex-col gap-2.5">
        {fares.map((fare) => {
          const selected = fare.id === value;
          const extra = fareAddOnCents[fare.id];
          return (
            <label
              key={fare.id}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-forest",
                selected ? "border-forest bg-forest-soft" : "border-line bg-surface",
              )}
            >
              <input
                type="radio"
                name="fare"
                value={fare.id}
                checked={selected}
                onChange={() => onChange(fare.id)}
                className="size-5 shrink-0 accent-forest"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{fare.name}</span>
                <span className="block text-sm text-muted">{fare.perks}</span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold">
                {extra === 0 ? "Included" : `+${formatCents(extra)}`}
                {extra > 0 && <span className="block text-xs font-normal text-muted">per person</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
