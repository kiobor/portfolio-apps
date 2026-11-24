import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function createIcon(children: ReactNode, filled = false) {
  return function Icon({ size = 24, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  };
}

export const HomeIcon = createIcon(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9v11h14V9" />
  </>,
);
export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
);
export const OrdersIcon = createIcon(
  <>
    <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </>,
);
export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </>,
);
export const FilterIcon = createIcon(
  <>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </>,
);
export const PlaneIcon = createIcon(
  <path d="M10.5 13.5 4 12l1.5-1.5 6 .5 4-5.5 2 .5-2 6.5 5 2.5-1 1.5-5.5-1.5-2.5 4.5-1.5-.5z" />,
);
export const CalendarIcon = createIcon(
  <>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </>,
);
export const SwapIcon = createIcon(
  <>
    <path d="M7 4 3.5 7.5 7 11M3.5 7.5h14" />
    <path d="m17 13 3.5 3.5L17 20M20.5 16.5h-14" />
  </>,
);
export const CheckIcon = createIcon(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const SortIcon = createIcon(
  <>
    <path d="M8 20V5m0 0L4.5 8.5M8 5l3.5 3.5" />
    <path d="M16 4v15m0 0-3.5-3.5M16 19l3.5-3.5" />
  </>,
);
export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);
export const BagIcon = createIcon(
  <>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </>,
);
export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = createIcon(<path d="M5 12h14" />);
export const ArrowLeftIcon = createIcon(<path d="M19 12H5m0 0 6-6m-6 6 6 6" />);
export const CloseIcon =createIcon(<path d="M6 6l12 12M18 6 6 18" />);
export const ChevronDownIcon =createIcon(<path d="m6 9 6 6 6-6" />);
export const StarIcon = createIcon(
  <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />,
  true,
);
export const CardLayoutIcon = createIcon(<rect x="5" y="5" width="14" height="14" rx="3.5" />);
export const ListLayoutIcon = createIcon(<path d="M5 7h14M5 12h14M5 17h14" />);
