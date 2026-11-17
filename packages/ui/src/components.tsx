import { useEffect, useId, useRef } from "react";
import type { ButtonHTMLAttributes, ComponentProps, KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- SearchField ---------- */
export function SearchField({
  icon,
  className,
  ...props
}: ComponentProps<"input"> & { icon?: ReactNode; "aria-label": string }) {
  return (
    <label
      className={cx(
        "flex h-12 items-center gap-3 rounded-pill border border-line bg-surface px-4 text-muted",
        className,
      )}
    >
      {icon}
      <input
        type="search"
        className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        {...props}
      />
    </label>
  );
}

/* ---------- IconButton ---------- */
export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button
      type="button"
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-pill border border-line bg-surface text-ink transition-colors hover:bg-tile",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- FilterPill ---------- */
export function FilterPill({
  icon,
  pressed,
  className,
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  icon?: ReactNode;
  pressed: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx(
        "flex h-10 shrink-0 items-center gap-2 rounded-pill border px-4 text-[15px] font-medium transition-colors",
        pressed
          ? "border-forest bg-forest text-cream"
          : "border-line bg-surface text-ink hover:bg-tile",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */
export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-pill bg-cream px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-forest uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- SegmentedToggle ---------- */
export type SegmentOption<T extends string> = { value: T; label: string; icon: ReactNode };

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-pill bg-tile p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cx(
            "grid h-8 w-10 place-items-center rounded-pill transition-colors",
            option.value === value ? "bg-surface text-ink shadow-soft" : "text-muted",
          )}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

/* ---------- CategoryTile ---------- */
export function CategoryTile({
  label,
  illustration,
  selected,
  onClick,
}: {
  label: string;
  illustration: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
    >
      <span
        className={cx(
          "grid aspect-square w-full place-items-center rounded-tile bg-tile transition-shadow",
          selected && "ring-2 ring-forest",
        )}
      >
        {illustration}
      </span>
      <span className={cx("text-xs", selected ? "font-semibold text-ink" : "text-muted")}>
        {label}
      </span>
    </button>
  );
}

/* ---------- TabBar ---------- */
export type TabItem = { id: string; label: string; icon: ReactNode };

export function TabBar({
  items,
  activeId,
  onChange,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav aria-label="Main" className="border-t border-line bg-cream pb-3">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(item.id)}
                className={cx(
                  "flex w-full flex-col items-center gap-1 pt-2.5 pb-1 text-xs",
                  active ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------- OptionChip: opzione di filtro con il conteggio dei risultati ---------- */
export function OptionChip({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  /** Quanti risultati si avrebbero scegliendo questa opzione. */
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  const disabled = count === 0 && !selected;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex h-10 items-center gap-2 rounded-pill border px-4 text-[15px] font-medium transition-colors",
        selected ? "border-forest bg-forest text-cream" : "border-line bg-surface text-ink",
        disabled && "opacity-40",
      )}
    >
      {label}
      <span className={cx("text-xs font-normal", selected ? "text-cream/80" : "text-muted")}>
        {count}
      </span>
    </button>
  );
}

/* ---------- HistogramSlider: slider con la distribuzione dei risultati dietro ---------- */
export function HistogramSlider({
  label,
  buckets,
  min,
  max,
  step,
  value,
  valueText,
  onChange,
}: {
  label: string;
  /** Una barra per ogni valore da `min` a `max` a passi di `step`. */
  buckets: number[];
  min: number;
  max: number;
  step: number;
  value: number;
  valueText: string;
  onChange: (value: number) => void;
}) {
  const peak = Math.max(...buckets, 1);
  return (
    <div>
      <div className="flex h-14 items-end gap-1" aria-hidden="true">
        {buckets.map((count, i) => (
          <div
            key={min + i * step}
            className={cx(
              "flex-1 rounded-t-md transition-colors",
              min + i * step <= value ? "bg-forest" : "bg-line",
            )}
            style={{ height: `${Math.max((count / peak) * 100, 6)}%` }}
          />
        ))}
      </div>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={valueText}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-forest"
      />
    </div>
  );
}

/* ---------- Sheet: pannello dal basso sopra i risultati ---------- */
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  container,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Dove montare il pannello (es. dentro il frame telefono). Di default `document.body`. */
  container?: HTMLElement | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previous?.focus?.();
  }, [open]);

  if (!open) return null;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative flex max-h-[88%] flex-col rounded-t-[28px] bg-cream shadow-soft outline-none motion-safe:animate-sheet-in"
      >
        <header className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 id={titleId} className="text-xl font-bold tracking-tight">
            {title}
          </h2>
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon size={20} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>
        {footer && <footer className="border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    container ?? document.body,
  );
}

/* ---------- QuantityStepper: "+" che diventa "− 2 +" ---------- */
export function QuantityStepper({
  quantity,
  name,
  onAdd,
  onRemove,
}: {
  quantity: number;
  /** Nome dell'articolo, per le etichette accessibili. */
  name: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        aria-label={`Add ${name}`}
        onClick={onAdd}
        className="grid size-10 shrink-0 place-items-center rounded-pill border border-line bg-surface text-ink shadow-soft transition-colors hover:bg-tile"
      >
        <PlusIcon size={20} />
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label={`${name} quantity`}
      className="flex h-10 shrink-0 items-center rounded-pill bg-forest text-cream"
    >
      <button
        type="button"
        aria-label={`Remove one ${name}`}
        onClick={onRemove}
        className="grid size-10 place-items-center"
      >
        <MinusIcon size={18} />
      </button>
      <span aria-live="polite" className="min-w-5 text-center text-[15px] font-semibold">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Add another ${name}`}
        onClick={onAdd}
        className="grid size-10 place-items-center"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("animate-pulse rounded-card bg-tile", className)} />;
}
