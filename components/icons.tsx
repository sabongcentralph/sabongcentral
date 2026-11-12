type P = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Emblem({ size = 30, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.6} className={className}>
      <path d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6z" />
      <path d="M8.5 14.5c.6-3.2 2.6-5 6-5.2" />
      <path d="M12.5 9.3l1.2-2.3 1 2" />
    </svg>
  );
}

export function ShieldCheck({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M12 2.5l8 3v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function Pin({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function Info({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16v.5" />
    </svg>
  );
}

export function Camera({ size = 28, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.6} className={className}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 6l1.5-2h5L16 6" />
    </svg>
  );
}

export function Phone({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
    </svg>
  );
}

export function Chat({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1.2-4.6A8 8 0 1121 12z" />
    </svg>
  );
}

export function Flag({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M5 21V4h11l-1.5 4L16 12H5" />
    </svg>
  );
}

export function Play({ size = 22, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor" />
    </svg>
  );
}

function Icon({ size = 20, className, d }: P & { d: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d={d} />
    </svg>
  );
}

export const HomeIcon = (p: P) => <Icon {...p} d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" />;
export const CalendarIcon = (p: P) => <Icon {...p} d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />;
export const ReelIcon = (p: P) => <Icon {...p} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM10 8.5v7l6-3.5z" />;
export const FarmIcon = (p: P) => <Icon {...p} d="M3 21V10l9-6 9 6v11M3 21h18M9 21v-6h6v6" />;
export const BagIcon = (p: P) => <Icon {...p} d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2" />;
export const BookIcon = (p: P) => <Icon {...p} d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7" />;
export const BellIcon = (p: P) => <Icon {...p} d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0" />;
export const UserIcon = (p: P) => <Icon {...p} d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />;
export const FilterIcon = (p: P) => <Icon {...p} d="M4 5h16l-6 8v5l-4 2v-7z" />;
export const ChevronRight = (p: P) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const MegaphoneIcon = (p: P) => <Icon {...p} d="M3 10v4h3l7 4V6L6 10zM16 9a4 4 0 010 6" />;
export const TruckIcon = (p: P) => <Icon {...p} d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" />;
export const AlertIcon = (p: P) => <Icon {...p} d="M12 3l9 16H3zM12 10v4M12 17h.01" />;
export const DownloadIcon = (p: P) => <Icon {...p} d="M12 4v11M7 10l5 5 5-5M5 20h14" />;
export const MailIcon = (p: P) => <Icon {...p} d="M3 6h18v12H3zM3 7l9 6 9-6" />;
export const MenuIcon = (p: P) => <Icon {...p} d="M4 6h16M4 12h16M4 18h16" />;
export const CloseIcon = (p: P) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
export const GearIcon = (p: P) => <Icon {...p} d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />;
export const InfoIcon = (p: P) => <Icon {...p} d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5h.01" />;
export const ShieldIcon = (p: P) => <Icon {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />;
export const GradIcon = (p: P) => <Icon {...p} d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5" />;
