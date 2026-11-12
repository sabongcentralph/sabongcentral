import { AlertIcon, BookIcon, DownloadIcon, GearIcon, InfoIcon, MegaphoneIcon, ShieldIcon, TruckIcon, UserIcon } from "./icons";

type Item = { href: string; label: string; Icon?: (p: { size?: number; className?: string }) => React.ReactElement; warn?: boolean };

export const SIDE_SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Quick Links",
    items: [
      { href: "/learn", label: "Articles & Guides", Icon: BookIcon },
      { href: "/learn?topic=Downloads", label: "Breeder Resources", Icon: DownloadIcon },
      { href: "/suppliers", label: "Verified Suppliers", Icon: TruckIcon },
      { href: "/notices", label: "Community Notices", Icon: MegaphoneIcon },
      { href: "/report?target=Scam+report", label: "Report Scam", Icon: AlertIcon, warn: true },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/portal", label: "Portal (farms, organizers, sellers)", Icon: UserIcon },
      { href: "/submit", label: "Share an article, reel or notice", Icon: MegaphoneIcon },
      { href: "/settings", label: "Settings", Icon: GearIcon },
    ],
  },
  {
    title: "About & Help",
    items: [
      { href: "/legal/about", label: "About", Icon: InfoIcon },
      { href: "/legal/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/legal/terms", label: "Terms of Use", Icon: ShieldIcon },
      { href: "/legal/privacy", label: "Privacy Notice" },
      { href: "/legal/disclaimer", label: "Legal Disclaimer" },
      { href: "/legal/market", label: "Marketplace Notice" },
      { href: "/legal/rules", label: "Portal Rules" },
      { href: "/legal/responsible-gaming", label: "Responsible Gaming" },
    ],
  },
];

// The left panel: always open on wide screens, opened from ☰ on phones.
export function SideNav() {
  return (
    <nav aria-label="Side menu" className="flex flex-col gap-5">
      {SIDE_SECTIONS.map((s) => (
        <section key={s.title} className="flex flex-col gap-0.5">
          <h2 className="m-0 px-3 pb-1 text-[11.5px] font-bold uppercase tracking-[1.4px] text-gold-dark">{s.title}</h2>
          {s.items.map(({ href, label, Icon, warn }) => (
            <a key={href} href={href}
              className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium no-underline hover:bg-blush ${warn ? "text-wine" : "text-ink"}`}>
              <span className={`flex size-5 flex-none items-center justify-center ${warn ? "text-wine" : "text-crimson"}`}>{Icon ? <Icon size={18} /> : <span className="size-1.5 rounded-full bg-gold" />}</span>
              {label}
            </a>
          ))}
        </section>
      ))}
      <p className="m-0 px-3 text-[11.5px] leading-relaxed text-muted">21 and over only. Gamble responsibly. Information only: no bets, no payments.</p>
    </nav>
  );
}
