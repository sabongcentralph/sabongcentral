"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { TABS, isActive } from "./tabs";

// Phone layout: six big fixed tabs at the bottom, like the Facebook app. The open tab gets a red bar on top.
export function BottomTabs({ lang }: { lang: Lang }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgb(0_0_0/0.06)] backdrop-blur lg:hidden"
    >
      <ul className="m-0 grid list-none grid-cols-6 p-0">
        {TABS.map(({ href, label, Icon }) => {
          const on = isActive(path, href);
          return (
            <li key={href}>
              <a
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex min-h-[66px] flex-col items-center justify-center gap-1 text-[12px] no-underline active:bg-blush ${on ? "font-bold text-crimson" : "font-semibold text-muted"}`}
              >
                {on && <span aria-hidden className="absolute inset-x-2 top-0 h-[3px] rounded-b-full bg-crimson" />}
                <Icon size={26} className={on ? "[&_path]:stroke-[2.4]" : ""} />
                {label[lang]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
