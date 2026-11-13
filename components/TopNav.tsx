"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { TABS, isActive } from "./tabs";

// Desktop: the six main sections sit in the header as big icon tabs (Facebook style); labels show on wider screens. Phones use the bottom tab bar.
export function TopNav({ lang }: { lang: Lang }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden flex-auto justify-center gap-x-1 lg:flex 2xl:gap-x-2">
      {TABS.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          aria-current={isActive(path, href) ? "page" : undefined}
          title={label[lang]}
          className="nav-link flex items-center gap-1.5 rounded-lg px-4 py-3 text-[16px] font-bold text-white/75 no-underline hover:bg-white/8 xl:px-2.5 2xl:px-3.5"
        >
          <Icon size={24} />
          <span className="sr-only xl:not-sr-only">{label[lang]}</span>
        </a>
      ))}
    </nav>
  );
}
