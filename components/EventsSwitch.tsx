// The Events tab has two halves: the derby schedule and the Venues & Organizers directory.
export function EventsSwitch({ at }: { at: "derbies" | "venues" }) {
  const items = [["derbies", "/events", "Derby Schedule"], ["venues", "/venues", "Venues & Organizers"]] as const;
  return (
    <nav aria-label="Events sections" className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-cream p-1">
      {items.map(([k, href, label]) => (
        <a key={k} href={href} aria-current={k === at ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-[13.5px] font-semibold leading-tight no-underline ${k === at ? "bg-crimson text-white" : "text-ink-soft hover:bg-blush"}`}>
          {label}
        </a>
      ))}
    </nav>
  );
}
