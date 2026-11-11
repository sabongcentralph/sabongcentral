import { FilterIcon } from "./icons";

// A collapsible filter box: closed on phones (tap "Filter"), always open on desktop.
export function FilterPanel({ children, active, action, reset }: { children: React.ReactNode; active: number; action: string; reset: string }) {
  return (
    <details className="group rounded-2xl border border-line bg-cream md:open:bg-cream" open={active > 0 ? true : undefined}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        <FilterIcon size={18} className="text-crimson" /> Filter
        {active > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-[#3a0a0a]">{active}</span>}
        <span className="ml-auto text-[13px] text-muted group-open:hidden">Buksan</span>
        <span className="ml-auto hidden text-[13px] text-muted group-open:inline">Isara</span>
      </summary>
      <form action={action} method="get" className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
        {children}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="lift min-h-11 cursor-pointer rounded-full border-0 bg-crimson px-6 text-[15px] font-semibold text-white">I-apply</button>
          <a href={reset} className="flex min-h-11 items-center px-3 text-sm font-semibold text-wine">Reset</a>
        </div>
      </form>
    </details>
  );
}
