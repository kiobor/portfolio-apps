import type { ReactNode } from "react";
import type { CategoryId } from "@/data/types";

/** Set di illustrazioni proprie (non foto): non competono con i piatti sotto. */
const svg = (children: ReactNode) => (
  <svg className="size-3/4" viewBox="0 0 48 48" aria-hidden="true">
    {children}
  </svg>
);

const illustrations: Record<CategoryId, ReactNode> = {
  bowls: svg(
    <>
      <circle cx="16" cy="21" r="5" fill="#d9574a" />
      <circle cx="25" cy="18" r="5.5" fill="#6fa86c" />
      <circle cx="33" cy="22" r="4.5" fill="#f0b83d" />
      <path d="M6 24h36a18 18 0 0 1-36 0Z" fill="#2b2b2b" />
    </>,
  ),
  salads: svg(
    <>
      <path d="M11 26c0-9 6-14 13-14s13 5 13 14Z" fill="#4f9a5e" />
      <circle cx="19" cy="20" r="2.6" fill="#d9574a" />
      <circle cx="29" cy="21" r="2.2" fill="#d9574a" />
      <path d="M8 26h32a16 16 0 0 1-32 0Z" fill="#fbf8f1" stroke="#d9d2c3" strokeWidth="1.5" />
    </>,
  ),
  poke: svg(
    <>
      <path d="m30 8 10 14M34 6l10 14" stroke="#b98a52" strokeWidth="2" strokeLinecap="round" />
      <rect x="13" y="17" width="8" height="8" rx="2" fill="#ef7a63" />
      <rect x="22" y="15" width="8" height="8" rx="2" fill="#f4b36a" />
      <circle cx="19" cy="21" r="3.5" fill="#ffffff" opacity="0.0" />
      <path d="M6 24h36a18 18 0 0 1-36 0Z" fill="#256b6d" />
    </>,
  ),
  brunch: svg(
    <>
      <path
        d="M10 26c-3-8 3-16 12-15 7-3 17 2 16 11 3 8-5 15-14 14-8 1-12-4-14-10Z"
        fill="#fffdf8"
        stroke="#e4ddcc"
        strokeWidth="1.5"
      />
      <circle cx="23" cy="25" r="7" fill="#f2b632" />
      <circle cx="21" cy="23" r="2" fill="#fbd877" />
    </>,
  ),
  smoothies: svg(
    <>
      <path d="M26 5l-3 12" stroke="#4f9a5e" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 16h24l-3 25a3 3 0 0 1-3 2H18a3 3 0 0 1-3-2l-3-25Z" fill="#7a3e8a" />
      <path d="M13 19h22l-.6 5H13.6Z" fill="#a964b8" />
      <circle cx="21" cy="31" r="2" fill="#e1b6ea" />
    </>,
  ),
  vegan: svg(
    <>
      <path d="M24 42V24" stroke="#2f7a45" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 26C14 26 9 20 9 12c9 0 15 5 15 14Z" fill="#4f9a5e" />
      <path d="M24 22c0-8 5-13 15-13 0 8-5 13-15 13Z" fill="#7fc17f" />
    </>,
  ),
};

export const categories: { id: CategoryId; label: string }[] = [
  { id: "bowls", label: "Bowls" },
  { id: "salads", label: "Salads" },
  { id: "poke", label: "Poke" },
  { id: "brunch", label: "Brunch" },
  { id: "smoothies", label: "Smoothies" },
  { id: "vegan", label: "Vegan" },
];

export function CategoryIllustration({ id }: { id: CategoryId }) {
  return <>{illustrations[id]}</>;
}
