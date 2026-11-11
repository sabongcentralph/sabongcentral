"use client";

import { usePathname } from "next/navigation";

export function NavLinks({ links, label }: { links: { href: string; text: string }[]; label: string }) {
  const path = usePathname();
  return (
    <nav aria-label={label} className="flex flex-auto flex-wrap gap-x-7">
      {links.map((l) => {
        const current = l.href !== "/#paano" && (path === l.href || path.startsWith(l.href + "/"));
        return (
          <a
            key={l.href}
            href={l.href}
            aria-current={current ? "page" : undefined}
            className="nav-link py-3 text-[15px] font-medium text-[#f7e9e6] no-underline"
          >
            {l.text}
          </a>
        );
      })}
    </nav>
  );
}
