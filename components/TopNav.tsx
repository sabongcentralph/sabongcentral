"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { TABS, isActive } from "./tabs";

// Desktop: the six main sections sit in the header. Phones and tablets use the bottom tab bar.
export function TopNav({ lang }: { lang: Lang }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden flex-auto justify-center gap-x-6 lg:flex">
      {TABS.map((tab) => (
        <a
          key={tab.href}
          href={tab.href}
          aria-current={isActive(path, tab.href) ? "page" : undefined}
          className="nav-link py-3 text-[15px] font-medium text-[#f7e9e6] no-underline"
        >
          {tab.label[lang]}
        </a>
      ))}
    </nav>
  );
}
