import { BagIcon, CalendarIcon, FarmIcon, GradIcon, HomeIcon, ReelIcon } from "./icons";

export const TABS = [
  { href: "/", label: { tl: "Home", en: "Home" }, Icon: HomeIcon },
  { href: "/events", label: { tl: "Events", en: "Events" }, Icon: CalendarIcon },
  { href: "/reels", label: { tl: "Reels", en: "Reels" }, Icon: ReelIcon },
  { href: "/farms", label: { tl: "Farms", en: "Farms" }, Icon: FarmIcon },
  { href: "/learn", label: { tl: "Learn", en: "Learn" }, Icon: GradIcon },
  { href: "/market", label: { tl: "Market", en: "Market" }, Icon: BagIcon },
] as const;

export function isActive(path: string, href: string) {
  // Seminars & Expos and Venues & Organizers are part of the Events tab.
  if (href === "/events" && ["/education", "/venues"].some((p) => path === p || path.startsWith(p + "/"))) return true;
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}
