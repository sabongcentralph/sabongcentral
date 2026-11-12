"use client";

import { usePathname } from "next/navigation";
import { UserIcon, AlertIcon, BookIcon, CalendarIcon, FarmIcon, GearIcon, HomeIcon, MailIcon, ShieldIcon } from "../icons";

type Counts = { waiting: number; reports: number; messages: number; permits: number; members: number; docs: number };
type Item = { href: string; label: string; icon: (p: { size?: number }) => React.ReactNode; badge?: keyof Counts; subs?: [string, string][] };

const ITEMS: Item[] = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/add", label: "+ Add listing", icon: ShieldIcon },
  { href: "/admin/queue", label: "Review queue", icon: ShieldIcon, badge: "waiting", subs: [
    ["/admin/queue", "Waiting for review"],
    ["/admin/queue?q=Needs+Changes", "Needs changes"],
    ["/admin/queue?q=Approved", "Live on the site"],
    ["/admin/queue?q=Archived", "Archived"],
  ] },
  { href: "/admin/queue?type=Event&q=All", label: "Derbies & Events", icon: CalendarIcon, badge: "permits", subs: [
    ["/admin/queue?type=Event&q=All", "Derbies"],
    ["/admin/queue?type=Seminar%2FTraining&q=All", "Seminars & Training"],
  ] },
  { href: "/admin/queue?type=Farm&q=All", label: "Farms & Market", icon: FarmIcon, subs: [
    ["/admin/queue?type=Farm&q=All", "Farms"],
    ["/admin/queue?type=Market&q=All", "Market"],
    ["/admin/queue?type=Supplier&q=All", "Suppliers"],
  ] },
  { href: "/admin/queue?type=Article&q=All", label: "Content", icon: BookIcon, subs: [
    ["/admin/queue?type=Reel&q=All", "Reels"],
    ["/admin/queue?type=Article&q=All", "Articles & Guides"],
    ["/admin/queue?type=Announcement&q=All", "Announcements"],
  ] },
  { href: "/admin/members", label: "Members", icon: UserIcon, badge: "members" },
  { href: "/admin/documents", label: "Documents", icon: BookIcon, badge: "docs" },
  { href: "/admin/reports", label: "Reports", icon: AlertIcon, badge: "reports" },
  { href: "/admin/messages", label: "Messages", icon: MailIcon, badge: "messages" },
  { href: "/admin/account", label: "Account", icon: GearIcon },
];

// Admin side menu: always open on desktop, inside the ☰ drawer on phones.
export function AdminSideNav({ counts }: { counts: Counts }) {
  const path = usePathname();
  const top = (it: Item) => (it.href === "/admin" ? path === "/admin" : it.label === "Review queue" ? path.startsWith("/admin/queue") || path.startsWith("/admin/item") : path.startsWith(it.href.split("?")[0]) && !it.href.includes("?"));
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {ITEMS.map((it) => {
        const on = top(it);
        const n = it.badge ? counts[it.badge] : 0;
        const Icon = it.icon;
        return (
          <div key={it.label}>
            <a href={it.href} aria-current={on ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold no-underline transition-colors ${on ? "bg-crimson text-white shadow-[0_6px_18px_rgb(200_35_47/0.35)]" : "text-ink-soft hover:bg-white/5"}`}>
              <Icon size={20} />
              <span className="flex-1">{it.label}</span>
              {n > 0 && <span className={`min-w-6 rounded-full px-1.5 text-center text-[12px] font-bold leading-6 ${on ? "bg-white text-crimson" : "bg-crimson text-white"}`}>{n}</span>}
            </a>
            {it.subs && (
              <ul className="m-0 mb-1 ml-[42px] mt-0.5 flex list-none flex-col p-0">
                {it.subs.map(([href, label]) => (
                  <li key={label}><a href={href} className="flex min-h-8 items-center text-[13.5px] text-muted no-underline hover:text-ink">{label}</a></li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <a href="/" className="mt-3 flex min-h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-gold-light no-underline hover:bg-white/5">↗ View public site</a>
      <form action="/api/admin/logout" method="post">
        <button type="submit" className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[14px] font-semibold text-muted hover:bg-white/5">Sign out</button>
      </form>
    </nav>
  );
}

// Phone bottom tabs for the admin panel.
export function AdminTabs({ counts }: { counts: Counts }) {
  const path = usePathname();
  const tabs: [string, string, (p: { size?: number }) => React.ReactNode, number][] = [
    ["/admin", "Dashboard", HomeIcon, 0],
    ["/admin/queue", "Review", ShieldIcon, counts.waiting],
    ["/admin/reports", "Reports", AlertIcon, counts.reports],
    ["/admin/messages", "Messages", MailIcon, counts.messages],
    ["/admin/account", "Account", GearIcon, 0],
  ];
  return (
    <nav aria-label="Admin tabs" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-[#0c0909]/95 px-1.5 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur lg:hidden">
      {tabs.map(([href, label, Icon, n]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href) || (href === "/admin/queue" && path.startsWith("/admin/item"));
        return (
          <a key={href} href={href} aria-current={on ? "page" : undefined}
            className={`relative mx-0.5 flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11.5px] font-semibold no-underline ${on ? "bg-crimson text-white" : "text-muted"}`}>
            <Icon size={21} />{label}
            {n > 0 && <span className="absolute right-2 top-1 min-w-5 rounded-full bg-crimson px-1 text-center text-[10.5px] font-bold leading-5 text-white ring-2 ring-[#0c0909]">{n}</span>}
          </a>
        );
      })}
    </nav>
  );
}
