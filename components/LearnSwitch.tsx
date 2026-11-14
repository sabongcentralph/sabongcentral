// The Learn tab has two halves: articles and seminars & expos. Seminars also appear under Events (Em, 2026-11-14).
export function LearnSwitch({ at }: { at: "articles" | "seminars" }) {
  const items = [["articles", "/learn", "Articles & Guides"], ["seminars", "/learn/seminars", "Seminars & Expos"]] as const;
  return (
    <nav aria-label="Learn sections" className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-cream p-1">
      {items.map(([k, href, label]) => (
        <a key={k} href={href} aria-current={k === at ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-[13.5px] font-semibold leading-tight no-underline ${k === at ? "bg-crimson text-white" : "text-ink-soft hover:bg-blush"}`}>
          {label}
        </a>
      ))}
    </nav>
  );
}
