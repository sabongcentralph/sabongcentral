import { BagIcon, CalendarIcon, FarmIcon, HomeIcon, ReelIcon } from "./icons";

export const TABS = [
  { href: "/", label: { tl: "Home", en: "Home" }, Icon: HomeIcon },
  { href: "/events", label: { tl: "Events", en: "Events" }, Icon: CalendarIcon },
  { href: "/reels", label: { tl: "Reels", en: "Reels" }, Icon: ReelIcon },
  { href: "/farms", label: { tl: "Farms", en: "Farms" }, Icon: FarmIcon },
  { href: "/goods", label: { tl: "Goods", en: "Goods" }, Icon: BagIcon },
] as const;

export function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}
