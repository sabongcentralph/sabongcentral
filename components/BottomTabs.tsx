"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { TABS, isActive } from "./tabs";

// Phone layout: five fixed tabs at the bottom, like an app.
export function BottomTabs({ lang }: { lang: Lang }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="m-0 grid list-none grid-cols-5 p-0">
        {TABS.map(({ href, label, Icon }) => {
          const on = isActive(path, href);
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold no-underline ${on ? "text-crimson" : "text-muted"}`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${on ? "bg-blush" : ""}`}>
                  <Icon size={21} />
                </span>
                {label[lang]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
